import { config } from "dotenv";
import { z } from "zod";

config();
config({ path: "src/.env", override: false });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(8),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.union([z.string().email(), z.string().length(0)]).optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  BREVO_API_KEY: z.string().min(1),
  BREVO_FROM_EMAIL: z.union([z.string().email(), z.string().length(0)]).default(""),
  BREVO_FROM_NAME: z.string().default("HR Team"),
  BREVO_INVITE_TEMPLATE_ID: z.coerce.number().optional(),
  BREVO_REMINDER_TEMPLATE_ID: z.coerce.number().optional(),
  BREVO_COMPLETION_TEMPLATE_ID: z.coerce.number().optional(),
});

export const env = envSchema.parse(process.env);
