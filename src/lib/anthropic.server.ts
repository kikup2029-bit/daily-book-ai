// Superseded by ai.server.ts, which supports both Google Gemini (free tier)
// and Anthropic Claude. Kept as a thin re-export so older imports keep working.
export { chatWithAI, chatWithAI as chatWithClaude, extractReceiptData } from "./ai.server";
export type { ReceiptExtraction } from "./ai.server";
