import type { Config } from "@netlify/functions";
import { hasDatabase, prisma } from "../../src/lib/prisma";
import { runLeadSearch } from "../../src/lib/run-search";
import { ensureSearchQueue, getConfig } from "../../src/lib/settings";

export default async function handler(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Rejected an unauthorized discovery request.");
    return;
  }
  if (!hasDatabase()) {
    console.error("Scheduled discovery skipped: DATABASE_URL is not configured.");
    return;
  }
  await ensureSearchQueue();
  const config = await getConfig();
  const queries = await prisma.searchQuery.findMany({
    where: { enabled: true },
    orderBy: [{ lastRunAt: "asc" }, { createdAt: "asc" }],
    take: Math.min(2, config.limits.maxSearchesPerDay),
  });
  for (const query of queries) await runLeadSearch(query.category, query.location, 10);
}

export const config: Config = {
  background: true,
  path: "/api/netlify/discover-background",
};
