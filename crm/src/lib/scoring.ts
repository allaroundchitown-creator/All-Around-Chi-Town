const PRIMARY_CITIES = new Set(["chicago", "skokie", "evanston", "niles", "morton grove", "lincolnwood", "northbrook", "glenview", "des plaines", "park ridge", "schaumburg", "arlington heights"]);

export type ScoreInput = { category?: string | null; city?: string | null; email?: string | null; instagramUrl?: string | null; description?: string | null; serviceTypes?: string[]; eventTypes?: string[]; };

export function scoreLead(input: ScoreInput) {
  const category = (input.category ?? "").toLowerCase();
  const text = [input.description, ...(input.serviceTypes ?? []), ...(input.eventTypes ?? [])].filter(Boolean).join(" ").toLowerCase();
  let score = 10;
  const reasons: string[] = [];
  if (category.includes("wedding planner") || category.includes("event planner")) { score += 25; reasons.push("plans events"); }
  else if (category.includes("venue") || category.includes("banquet")) { score += 20; reasons.push("hosts events"); }
  else if (/dj|decor|photograph|cater|party rental/.test(category)) { score += 15; reasons.push("serves event clients"); }
  if (/wedding/.test(text)) { score += 15; reasons.push("mentions weddings"); }
  if (/quincea(ñ|n)era/.test(text)) { score += 15; reasons.push("mentions quinceañeras"); }
  if (/birthday/.test(text)) { score += 10; reasons.push("mentions birthdays"); }
  if (/corporate event/.test(text)) { score += 10; reasons.push("mentions corporate events"); }
  if (input.email) { score += 5; reasons.push("has public email"); }
  if (input.instagramUrl) { score += 5; reasons.push("has Instagram"); }
  if (PRIMARY_CITIES.has((input.city ?? "").toLowerCase())) { score += 10; reasons.push("in the target area"); }
  else if (input.city) { score -= 40; reasons.push("outside the primary area"); }
  if (text && !/event|wedding|party|quince|birthday|corporate/.test(text) && !/planner|venue|banquet/.test(category)) { score -= 20; reasons.push("limited event evidence"); }
  const deterministicScore = Math.max(0, Math.min(100, score));
  const quality = deterministicScore >= 75 ? "HIGH" : deterministicScore >= 45 ? "MEDIUM" : "LOW";
  return { deterministicScore, quality, reason: reasons.length ? `Strong fit because it ${reasons.join(", ")}.` : "Insufficient public event signals." } as const;
}
