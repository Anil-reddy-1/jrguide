/**
 * embed-docs.ts — Reads knowledge base markdown files, chunks them,
 * embeds via gemini-embedding-001, and stores in Firestore `vectors` collection.
 *
 * Usage: npx tsx scripts/embed-docs.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

config();
config({ path: "src/.env", override: false });

/* ─── Firebase Admin ────────────────────────────────────────────── */
const firebaseApp =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID!,
  });

const db = getFirestore(firebaseApp);
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

/* ─── Config ────────────────────────────────────────────────────── */
const KB_DIR = resolve(import.meta.dirname ?? __dirname, "../knowledge-base");
const COLLECTION = "vectors";
const EMBEDDING_MODEL = "gemini-embedding-001";
const CHUNK_SIZE = 400; // approximate tokens per chunk
const CHUNK_OVERLAP = 80;

/* ─── Chunking ──────────────────────────────────────────────────── */
function chunkText(text: string, source: string): Array<{ content: string; source: string; section: string }> {
  const lines = text.split("\n");
  const chunks: Array<{ content: string; source: string; section: string }> = [];
  let currentSection = "Introduction";
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    const content = buffer.join("\n").trim();
    if (content.length > 30) {
      chunks.push({ content, source, section: currentSection });
    }
    // keep overlap
    const overlapLines = Math.max(2, Math.floor(buffer.length * (CHUNK_OVERLAP / CHUNK_SIZE)));
    buffer = buffer.slice(-overlapLines);
  };

  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("# ")) {
      flush();
      currentSection = line.replace(/^#+\s*/, "").trim();
    }
    buffer.push(line);
    // approximate: 1 token ≈ 4 chars
    const approxTokens = buffer.join("\n").length / 4;
    if (approxTokens >= CHUNK_SIZE) {
      flush();
    }
  }
  flush();
  return chunks;
}

/* ─── Embed ─────────────────────────────────────────────────────── */
const EMBEDDING_DIMS = 768; // Firestore max is 2048; we use 768 for efficiency

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: {
      taskType: "RETRIEVAL_DOCUMENT" as any,
      outputDimensionality: EMBEDDING_DIMS,
    },
  });

  const embeddings = (response.embeddings ?? []).map((e: any) => {
    const vals: number[] = e.values ?? [];
    // Safety: truncate if still over limit
    return vals.length > EMBEDDING_DIMS ? vals.slice(0, EMBEDDING_DIMS) : vals;
  });

  if (embeddings.length > 0) {
    console.log(`   📐 Embedding dimensions: ${embeddings[0].length}`);
  }

  return embeddings;
}

/* ─── Main ──────────────────────────────────────────────────────── */
async function main() {
  console.log("📂 Reading knowledge base from:", KB_DIR);
  const files = readdirSync(KB_DIR).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    console.error("❌ No markdown files found in knowledge-base/");
    process.exit(1);
  }

  // Clear existing vectors
  console.log("🗑️  Clearing existing vectors...");
  const existing = await db.collection(COLLECTION).get();
  const deleteBatch = db.batch();
  existing.docs.forEach((doc) => deleteBatch.delete(doc.ref));
  if (existing.size > 0) await deleteBatch.commit();
  console.log(`   Deleted ${existing.size} old vectors.`);

  // Process each file
  const allChunks: Array<{ content: string; source: string; section: string }> = [];

  for (const file of files) {
    const filePath = resolve(KB_DIR, file);
    const text = readFileSync(filePath, "utf-8");
    const source = basename(file, ".md");
    const chunks = chunkText(text, source);
    console.log(`📄 ${file}: ${chunks.length} chunks`);
    allChunks.push(...chunks);
  }

  console.log(`\n🔢 Total chunks: ${allChunks.length}`);
  console.log("🧠 Generating embeddings...\n");

  // Embed in batches of 10
  const BATCH_SIZE = 10;
  let stored = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.content);

    const embeddings = await embedBatch(texts);

    const writeBatch = db.batch();
    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      const embedding = embeddings[j];
      if (!embedding || embedding.length === 0) continue;

      const ref = db.collection(COLLECTION).doc();
      writeBatch.set(ref, {
        content: chunk.content,
        source: chunk.source,
        section: chunk.section,
        embedding: FieldValue.vector(embedding),
        createdAt: FieldValue.serverTimestamp(),
      });
      stored++;
    }
    await writeBatch.commit();
    console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: stored ${batch.length} vectors`);
  }

  console.log(`\n🎉 Done! Stored ${stored} vectors in Firestore '${COLLECTION}' collection.`);
  console.log("💡 Reminder: Create a vector index on the 'embedding' field for findNearest queries.");
  console.log("   gcloud firestore indexes composite create --collection-group=vectors --field-config=vector-config='{\"dimension\":768,\"flat\":{}}',field-path=embedding");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
