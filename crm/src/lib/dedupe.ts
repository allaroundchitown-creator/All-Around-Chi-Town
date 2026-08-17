import { normalizeDomain, normalizeNameCity, normalizePhone } from "./normalize";

export type DuplicateCandidate = {
  id: string; provider?: string | null; providerBusinessId?: string | null;
  website?: string | null; phone?: string | null; businessName: string; city?: string | null;
};

export type IncomingIdentity = Omit<DuplicateCandidate, "id">;

export function findDuplicate(incoming: IncomingIdentity, existing: DuplicateCandidate[]) {
  return existing.find((lead) =>
    Boolean(incoming.providerBusinessId && lead.providerBusinessId === incoming.providerBusinessId && lead.provider === incoming.provider)
  ) ?? existing.find((lead) => {
    const a = normalizeDomain(incoming.website); const b = normalizeDomain(lead.website);
    return Boolean(a && b && a === b);
  }) ?? existing.find((lead) => {
    const a = normalizePhone(incoming.phone); const b = normalizePhone(lead.phone);
    return Boolean(a && b && a === b);
  }) ?? existing.find((lead) => normalizeNameCity(incoming.businessName, incoming.city) === normalizeNameCity(lead.businessName, lead.city));
}
