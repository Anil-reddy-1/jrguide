import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";

export const aiClient = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });

export const AI_PROMPTS = {
  onboardingAssistant:
    "You are an HR onboarding assistant. Answer clearly, cite provided sources, and suggest next actions.",
};
