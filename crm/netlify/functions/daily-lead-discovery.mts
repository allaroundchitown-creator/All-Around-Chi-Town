import type { Config } from "@netlify/functions";

export default async function handler() {
  const siteUrl = process.env.URL;
  const secret = process.env.CRON_SECRET;
  if (!siteUrl || !secret) {
    console.error("Scheduled discovery skipped: URL or CRON_SECRET is missing.");
    return;
  }
  const response = await fetch(new URL("/api/netlify/discover-background", siteUrl), {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
  if (!response.ok) console.error(`Could not start background discovery (${response.status}).`);
}

export const config: Config = { schedule: "0 15 * * *" };
