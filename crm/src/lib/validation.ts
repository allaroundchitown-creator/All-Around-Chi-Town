import { z } from "zod";
import { LEAD_STATUSES } from "./constants";

export const searchRequestSchema = z.object({
  category: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(100),
  maxResults: z.coerce.number().int().min(1).max(20).default(10),
});

export const inquirySchema = z.object({
  customerName: z.string().trim().min(2).max(120), email: z.string().email().max(254),
  phone: z.string().trim().max(30).optional(), instagram: z.string().trim().max(200).optional(),
  eventDate: z.coerce.date().optional(), eventType: z.string().trim().min(2).max(100),
  eventLocation: z.string().trim().min(2).max(200), package: z.string().trim().max(100).optional(),
  message: z.string().trim().max(3000).optional(),
});

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(), notes: z.string().trim().max(3000).optional(),
  nextFollowUpAt: z.union([z.iso.datetime(), z.literal(""), z.null()]).optional(),
  estimatedDealValue: z.coerce.number().min(0).max(1_000_000).optional(),
  activityType: z.enum(["EMAIL_SENT", "INSTAGRAM_CONTACTED", "PHONE_CALL", "FOLLOW_UP", "RESPONSE_RECEIVED", "QUOTE_SENT", "DEPOSIT_REQUEST_SENT", "BOOKED", "LOST", "NOTE_ADDED"]).optional(),
  activityNotes: z.string().trim().max(2000).optional(),
});
