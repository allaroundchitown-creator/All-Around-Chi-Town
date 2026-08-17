import { prisma } from "./prisma";
import { getConfig } from "./settings";
import { discoverBusinesses } from "./search/google-places";
import { saveDiscoveredBusiness } from "./lead-service";

export async function runLeadSearch(category: string, location: string, maxResults: number) {
  const config = await getConfig(); const start = new Date(); start.setHours(0, 0, 0, 0);
  const [searchesToday, processedToday] = await Promise.all([prisma.searchRun.count({ where: { startedAt: { gte: start } } }), prisma.searchRun.aggregate({ where: { startedAt: { gte: start } }, _sum: { businessesFound: true } })]);
  if (searchesToday >= config.limits.maxSearchesPerDay) throw new Error("Daily search limit reached. Adjust it in Settings if needed.");
  const remaining = config.limits.maxBusinessesPerDay - (processedToday._sum.businessesFound ?? 0);
  if (remaining <= 0) throw new Error("Daily business processing limit reached.");
  const query = await prisma.searchQuery.upsert({ where: { category_location: { category, location } }, create: { category, location }, update: {} }); const queryText = `${category} in ${location}, Illinois`;
  const run = await prisma.searchRun.create({ data: { searchQueryId: query.id, queryText } });
  try { const businesses = await discoverBusinesses(category, location, Math.min(maxResults, remaining)); let duplicateCount = 0; let newLeadCount = 0; const qualities = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const business of businesses) { const result = await saveDiscoveredBusiness(business, query.id, queryText, config.limits.maxWebsitePagesPerLead); if (result.duplicate) duplicateCount++; else newLeadCount++; qualities[result.lead.quality]++; }
    await prisma.$transaction([prisma.searchRun.update({ where: { id: run.id }, data: { status: "COMPLETED", completedAt: new Date(), businessesFound: businesses.length, duplicateCount, newLeadCount, highCount: qualities.HIGH, mediumCount: qualities.MEDIUM, lowCount: qualities.LOW } }), prisma.searchQuery.update({ where: { id: query.id }, data: { lastRunAt: new Date() } })]);
    return { runId: run.id, businessesFound: businesses.length, duplicateCount, newLeadCount, ...qualities };
  } catch (error) { await prisma.searchRun.update({ where: { id: run.id }, data: { status: "FAILED", completedAt: new Date(), errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Unknown search error" } }); throw error; }
}
