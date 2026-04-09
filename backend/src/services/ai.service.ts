import { aiClient } from "../config/ai.js";
import { firestore } from "../config/firebase.js";
import { env } from "../config/env.js";
import { FieldValue } from "firebase-admin/firestore";

/* ─── Guardrails System Prompt ──────────────────────────────────── */
const SYSTEM_PROMPT = `You are JrGuide, an HR onboarding assistant for a company's employee onboarding platform. Your role is strictly limited to answering questions about:

ALLOWED TOPICS:
- Onboarding process and tasks
- Company policies (leave, remote work, dress code, conduct)
- HR procedures (payroll, benefits, expense reimbursement)
- IT setup (email, VPN, equipment, security training)
- Document submission requirements
- Team contacts and who to reach out to
- Working hours and office policies
- Training and learning resources

RULES YOU MUST FOLLOW:
1. ONLY answer based on the provided context documents. Never make up information.
2. If the provided context does not contain enough information to answer, respond: "I don't have enough information about that in my knowledge base. Please contact HR at hr@company.com for assistance."
3. REFUSE to answer questions about: personal opinions, politics, entertainment, sports, coding/programming help, medical advice, legal advice, financial investment advice, or any topic not related to HR/onboarding.
4. For off-topic questions, respond: "I'm your onboarding assistant and can only help with HR, onboarding, company policies, and IT setup questions. For other inquiries, please reach out to the appropriate team."
5. Always cite the source document when answering. Use format: [Source: document-name]
6. Keep answers concise — under 200 words.
7. Never generate personal information, passwords, or sensitive data.
8. Be professional, friendly, and helpful in tone.
9. If multiple sources are relevant, cite all of them.
10. Format your response clearly with bullet points when listing steps.`;

/* ─── Embedding ─────────────────────────────────────────────────── */
export const embedText = async (text: string): Promise<number[]> => {
  const response = await aiClient.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { 
      taskType: "RETRIEVAL_QUERY" as any,
      outputDimensionality: 768
    },
  });

  const embedding = response.embeddings?.[0];
  const vals: number[] = (embedding as any)?.values ?? [];
  return vals.length > 768 ? vals.slice(0, 768) : vals;
};

/* ─── Vector Search ─────────────────────────────────────────────── */
export const searchVectors = async (
  queryEmbedding: number[],
  topK = 5,
): Promise<Array<{ content: string; source: string; section: string; score?: number }>> => {
  try {
    const collectionRef = firestore.collection("vectors");

    const vectorQuery = collectionRef.findNearest(
      "embedding",
      FieldValue.vector(queryEmbedding),
      {
        limit: topK,
        distanceMeasure: "COSINE",
      },
    );

    const snapshot = await vectorQuery.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        content: data.content ?? "",
        source: data.source ?? "unknown",
        section: data.section ?? "",
      };
    });
  } catch (error: any) {
    // If vector index not created yet, fall back to empty
    console.error("Vector search failed (index may not exist):", error.message);
    return [];
  }
};

/* ─── Off-Topic Detection ───────────────────────────────────────── */
const OFF_TOPIC_PATTERNS = [
  /\b(stock|crypto|bitcoin|invest|trading)\b/i,
  /\b(politics|election|vote|president|government)\b/i,
  /\b(movie|game|sport|football|cricket|basketball)\b/i,
  /\b(recipe|cook|restaurant|food recommendation)\b/i,
  /\b(dating|relationship|personal life)\b/i,
  /\b(code|debug|programming|algorithm|leetcode)\b/i,
  /\b(medical diagnosis|symptom|disease|medication)\b/i,
  /\b(legal advice|lawsuit|attorney)\b/i,
  /\b(write me a story|poem|joke|song)\b/i,
];

const isOffTopic = (question: string): boolean => {
  return OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(question));
};

/* ─── Main RAG Pipeline ─────────────────────────────────────────── */
export const askOnboardingAssistant = async (
  question: string,
  _context: string,
): Promise<{ answer: string; sources: Array<{ name: string; section: string }> }> => {
  // Guardrail 1: Off-topic detection
  if (isOffTopic(question)) {
    return {
      answer:
        "I'm your onboarding assistant and can only help with HR, onboarding, company policies, and IT setup questions. For other inquiries, please reach out to the appropriate team.",
      sources: [],
    };
  }

  // Step 1: Embed the question
  const queryEmbedding = await embedText(question);

  let retrievedContext = "";
  let sources: Array<{ name: string; section: string }> = [];

  if (queryEmbedding.length > 0) {
    // Step 2: Search vectors
    const results = await searchVectors(queryEmbedding, 5);

    if (results.length > 0) {
      // Build context from retrieved chunks
      retrievedContext = results
        .map((r, i) => `[Source ${i + 1}: ${r.source} — ${r.section}]\n${r.content}`)
        .join("\n\n---\n\n");

      // Deduplicate sources
      const sourceMap = new Map<string, string>();
      for (const r of results) {
        sourceMap.set(r.source, r.section);
      }
      sources = Array.from(sourceMap.entries()).map(([name, section]) => ({
        name,
        section,
      }));
    }
  }

  // Step 3: Build the prompt
  const userPrompt = retrievedContext
    ? `CONTEXT DOCUMENTS:\n${retrievedContext}\n\n---\n\nUSER QUESTION:\n${question}`
    : `No relevant documents found in the knowledge base.\n\nUSER QUESTION:\n${question}`;

  // Step 4: Generate response with Gemini
  try {
    const response = await aiClient.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 500,
        temperature: 0.3,
      },
    });

    const answer = response.text ?? "I encountered an issue generating a response. Please try again.";

    // Guardrail 2: Check response length
    if (answer.length > 2000) {
      return {
        answer: answer.substring(0, 2000) + "...\n\nFor more details, please contact HR at hr@company.com.",
        sources,
      };
    }

    return { answer, sources };
  } catch (error: any) {
    console.error("Gemini generation failed:", error.message);
    return {
      answer: "I'm having trouble generating a response right now. Please try again in a moment, or contact HR at hr@company.com for immediate assistance.",
      sources: [],
    };
  }
};
