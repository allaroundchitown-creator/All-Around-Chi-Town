import { PrismaClient } from "@prisma/client";
import { DEFAULT_CATEGORIES, DEFAULT_LIMITS, DEFAULT_LOCATIONS } from "../src/lib/constants";
const prisma = new PrismaClient();
async function main() { await Promise.all([prisma.appSetting.upsert({ where: { key: "categories" }, create: { key: "categories", value: [...DEFAULT_CATEGORIES] }, update: {} }), prisma.appSetting.upsert({ where: { key: "locations" }, create: { key: "locations", value: [...DEFAULT_LOCATIONS] }, update: {} }), prisma.appSetting.upsert({ where: { key: "limits" }, create: { key: "limits", value: { ...DEFAULT_LIMITS } }, update: {} })]); for (const category of DEFAULT_CATEGORIES) for (const location of DEFAULT_LOCATIONS) await prisma.searchQuery.upsert({ where: { category_location: { category, location } }, create: { category, location }, update: {} }); }
main().finally(() => prisma.$disconnect());
