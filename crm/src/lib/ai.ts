import OpenAI from "openai";
import { z } from "zod";

const qualificationSchema = z.object({ scoreAdjustment: z.number().int().min(-20).max(20), reason: z.string().max(300), recommendedContactMethod: z.enum(["EMAIL", "INSTAGRAM", "PHONE"]), quality: z.enum(["HIGH", "MEDIUM", "LOW"]) });

function client() {
  if (!process.env.OPENAI_API_KEY) throw new Error("AI features are not configured.");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15_000, maxRetries: 1 });
}

export async function qualifyLead(summary: Record<string, unknown>) {
  const response = await client().responses.create({ model: process.env.OPENAI_MODEL ?? "gpt-5-mini", input: [{ role: "system", content: "Qualify a local Chicagoland event-industry lead for a 360 photo booth company. Return only JSON with scoreAdjustment (-20..20), reason, recommendedContactMethod (EMAIL, INSTAGRAM, PHONE), and quality (HIGH, MEDIUM, LOW)." }, { role: "user", content: JSON.stringify(summary).slice(0, 4000) }] });
  const raw = response.output_text.replace(/^```json\s*|\s*```$/g, "");
  return qualificationSchema.parse(JSON.parse(raw));
}

export async function generateOutreach(summary: Record<string, unknown>) {
  const response = await client().responses.create({ model: process.env.OPENAI_MODEL ?? "gpt-5-mini", input: [{ role: "system", content: "Write concise, warm, non-spammy outreach for All Around Chi Town, a Chicagoland 360 photo booth company. Return JSON with emailSubject, emailBody, and instagramDm. Do not invent facts. Include a clear but low-pressure next step." }, { role: "user", content: JSON.stringify(summary).slice(0, 4000) }] });
  return z.object({ emailSubject: z.string().max(150), emailBody: z.string().max(1800), instagramDm: z.string().max(1000) }).parse(JSON.parse(response.output_text.replace(/^```json\s*|\s*```$/g, "")));
}
