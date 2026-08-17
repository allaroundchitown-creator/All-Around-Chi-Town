import * as cheerio from "cheerio";
import { createHash } from "node:crypto";

export type WebsiteProfile = { email?: string; instagramUrl?: string; facebookUrl?: string; description?: string; serviceTypes: string[]; eventTypes: string[]; serviceArea?: string; fingerprint: string; pagesFetched: number; };

const PAGE_PATHS = ["/", "/contact", "/about", "/services", "/weddings", "/events"];
const EVENTS = ["weddings", "quinceañeras", "birthdays", "corporate events", "private parties"];

export function extractContactDetails(html: string, baseUrl = "https://example.com") {
  const $ = cheerio.load(html.slice(0, 1_500_000));
  $("script,style,noscript,svg").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 20_000);
  const mailto = $('a[href^="mailto:"]').first().attr("href")?.replace(/^mailto:/i, "").split("?")[0];
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const toAbsolute = (href?: string) => { if (!href) return undefined; try { return new URL(href, baseUrl).toString(); } catch { return undefined; } };
  const instagram = $("a[href*='instagram.com']").first().attr("href");
  const facebook = $("a[href*='facebook.com']").first().attr("href");
  const metaDescription = $('meta[name="description"]').attr("content") ?? $('meta[property="og:description"]').attr("content");
  const lower = text.toLowerCase();
  return { email: mailto ?? emailMatch?.[0], instagramUrl: toAbsolute(instagram), facebookUrl: toAbsolute(facebook), description: metaDescription?.trim().slice(0, 600), eventTypes: EVENTS.filter((event) => { const stem = event.replace("events", "event").replace("birthdays", "birthday").replace("weddings", "wedding"); return lower.includes(event.replace("ñ", "n")) || lower.includes(event) || lower.includes(stem); }), text };
}

async function robotsAllows(origin: string, path: string) {
  try {
    const response = await fetch(new URL("/robots.txt", origin), { signal: AbortSignal.timeout(5_000), headers: { "User-Agent": "AllAroundChiTownCRM/1.0" } });
    if (!response.ok) return true;
    const body = await response.text();
    const blocks = body.split(/user-agent:/i).slice(1);
    const relevant = blocks.filter((block) => /^\s*(\*|AllAroundChiTownCRM)\s*$/im.test(block.split(/\r?\n/)[0] ?? ""));
    return !relevant.some((block) => block.split(/\r?\n/).some((line) => { const match = line.match(/^\s*disallow:\s*(\S+)/i); return match?.[1] === "/" || Boolean(match?.[1] && path.startsWith(match[1])); }));
  } catch { return true; }
}

export async function researchWebsite(website: string, maxPages = 3): Promise<WebsiteProfile> {
  const root = new URL(website.startsWith("http") ? website : `https://${website}`);
  const profiles: ReturnType<typeof extractContactDetails>[] = [];
  for (const path of PAGE_PATHS.slice(0, Math.max(1, Math.min(maxPages, PAGE_PATHS.length)))) {
    if (!(await robotsAllows(root.origin, path))) continue;
    try {
      const response = await fetch(new URL(path, root), { redirect: "follow", signal: AbortSignal.timeout(8_000), headers: { "User-Agent": "AllAroundChiTownCRM/1.0 (+business-research)" } });
      if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) continue;
      profiles.push(extractContactDetails(await response.text(), root.toString()));
    } catch { /* A single unavailable page should not fail the lead. */ }
  }
  const combined = profiles.map((profile) => profile.text).join(" ").slice(0, 30_000);
  const first = <K extends keyof ReturnType<typeof extractContactDetails>>(key: K) => profiles.find((profile) => profile[key])?.[key];
  return { email: first("email") as string | undefined, instagramUrl: first("instagramUrl") as string | undefined, facebookUrl: first("facebookUrl") as string | undefined, description: first("description") as string | undefined, serviceTypes: [], eventTypes: [...new Set(profiles.flatMap((profile) => profile.eventTypes))], fingerprint: createHash("sha256").update(combined).digest("hex"), pagesFetched: profiles.length };
}
