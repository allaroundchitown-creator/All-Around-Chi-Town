import { describe, expect, it } from "vitest";
import { inquirySchema, searchRequestSchema } from "@/lib/validation";
import { applyStatusUpdate } from "@/lib/status";
describe("API validation", () => { it("rejects excessive search volume", () => expect(searchRequestSchema.safeParse({ category: "DJ", location: "Chicago", maxResults: 200 }).success).toBe(false)); it("requires a valid inquiry email", () => expect(inquirySchema.safeParse({ customerName: "Maya", email: "bad", eventType: "Wedding", eventLocation: "Chicago" }).success).toBe(false)); });
describe("status updates", () => { it("updates status and first-contact time", () => { const now = new Date("2026-08-17T12:00:00Z"); const lead = applyStatusUpdate({ status: "NEW", lastContactedAt: null, followUpCount: 0 }, "CONTACTED", now); expect(lead.status).toBe("CONTACTED"); expect(lead.lastContactedAt).toEqual(now); }); });
