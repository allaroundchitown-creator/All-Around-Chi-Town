import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { normalizeDomain, normalizeNameCity, normalizePhone } from "./normalize";
import { scoreLead } from "./scoring";
import { researchWebsite } from "./enrichment";
import type { DiscoveredBusiness } from "./search/google-places";

export async function saveDiscoveredBusiness(business: DiscoveredBusiness, searchQueryId: string, queryText: string, maxPages = 3) {
  const normalizedDomain = normalizeDomain(business.website);
  const normalizedPhone = normalizePhone(business.phone);
  const normalizedNameCity = normalizeNameCity(business.businessName, business.city);
  const duplicate = await prisma.lead.findFirst({ where: { OR: [
    { provider: business.provider, providerBusinessId: business.providerBusinessId },
    ...(normalizedDomain ? [{ normalizedDomain }] : []), ...(normalizedPhone ? [{ normalizedPhone }] : []), { normalizedNameCity },
  ] } });
  let enrichment: Awaited<ReturnType<typeof researchWebsite>> | undefined;
  if (!duplicate && business.website) enrichment = await researchWebsite(business.website, maxPages);
  const scoring = scoreLead({ ...business, email: enrichment?.email, instagramUrl: enrichment?.instagramUrl, description: enrichment?.description, eventTypes: enrichment?.eventTypes });
  const data: Prisma.LeadUncheckedCreateInput = { businessName: business.businessName, normalizedNameCity, provider: business.provider, providerBusinessId: business.providerBusinessId, category: business.category, address: business.address, city: business.city, phone: business.phone, normalizedPhone, website: business.website, normalizedDomain, mapsUrl: business.mapsUrl, rating: business.rating, reviewCount: business.reviewCount, latitude: business.latitude, longitude: business.longitude, email: enrichment?.email, instagramUrl: enrichment?.instagramUrl, facebookUrl: enrichment?.facebookUrl, description: enrichment?.description, eventTypes: enrichment?.eventTypes ?? [], websiteFingerprint: enrichment?.fingerprint, deterministicScore: scoring.deterministicScore, quality: scoring.quality, fitReason: scoring.reason };
  const lead = duplicate
    ? await prisma.lead.update({ where: { id: duplicate.id }, data: Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined && value !== null)) })
    : await prisma.lead.create({ data: { ...data, activities: { create: { type: "LEAD_DISCOVERED", notes: `Found via ${queryText}` } } } });
  await prisma.leadSearchSource.upsert({ where: { leadId_searchQueryId: { leadId: lead.id, searchQueryId } }, create: { leadId: lead.id, searchQueryId, queryText }, update: { lastSeenAt: new Date(), queryText } });
  return { lead, duplicate: Boolean(duplicate) };
}
