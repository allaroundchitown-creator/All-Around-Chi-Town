import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/prisma";
import { runLeadSearch } from "@/lib/run-search";
import { searchRequestSchema } from "@/lib/validation";
export async function POST(request: Request) { if (!hasDatabase()) return NextResponse.json({ error: "Connect PostgreSQL before running live searches. The dashboard is currently showing preview data." }, { status: 503 }); try { const input = searchRequestSchema.parse(await request.json()); return NextResponse.json(await runLeadSearch(input.category, input.location, input.maxResults)); } catch (error) { const message = error instanceof Error ? error.message : "Search failed"; return NextResponse.json({ error: message }, { status: message.includes("limit") ? 429 : 400 }); } }
