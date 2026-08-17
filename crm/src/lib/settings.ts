import { DEFAULT_CATEGORIES, DEFAULT_LIMITS, DEFAULT_LOCATIONS } from "./constants";
import { hasDatabase, prisma } from "./prisma";

export type AppConfig = { categories: string[]; locations: string[]; limits: { maxSearchesPerDay: number; maxBusinessesPerDay: number; maxWebsitePagesPerLead: number; maxAiQualificationsPerDay: number } };
export async function getConfig(): Promise<AppConfig> { const fallback = { categories: [...DEFAULT_CATEGORIES], locations: [...DEFAULT_LOCATIONS], limits: { ...DEFAULT_LIMITS } }; if (!hasDatabase()) return fallback; const rows = await prisma.appSetting.findMany({ where: { key: { in: ["categories", "locations", "limits"] } } }); return rows.reduce((config, row) => ({ ...config, [row.key]: row.value }), fallback) as AppConfig; }
export async function ensureSearchQueue() { const config = await getConfig(); for (const category of config.categories) for (const location of config.locations) await prisma.searchQuery.upsert({ where: { category_location: { category, location } }, create: { category, location }, update: {} }); }
