CREATE TYPE "LeadStatus" AS ENUM ('NEW','RESEARCHED','CONTACTED','RESPONDED','INTERESTED','QUOTE_SENT','DEPOSIT_SENT','BOOKED','LOST','NOT_INTERESTED');
CREATE TYPE "LeadQuality" AS ENUM ('HIGH','MEDIUM','LOW');
CREATE TYPE "LeadSourceType" AS ENUM ('BUSINESS_SEARCH','WEBSITE_INQUIRY','MANUAL');
CREATE TYPE "ActivityType" AS ENUM ('LEAD_DISCOVERED','RESEARCH_COMPLETED','EMAIL_SENT','INSTAGRAM_CONTACTED','PHONE_CALL','FOLLOW_UP','RESPONSE_RECEIVED','QUOTE_SENT','DEPOSIT_REQUEST_SENT','BOOKED','LOST','NOTE_ADDED','STATUS_CHANGED');
CREATE TYPE "SearchRunStatus" AS ENUM ('RUNNING','COMPLETED','FAILED');

CREATE TABLE "Lead" (
  "id" TEXT PRIMARY KEY, "businessName" TEXT NOT NULL, "normalizedNameCity" TEXT,
  "provider" TEXT, "providerBusinessId" TEXT, "category" TEXT NOT NULL, "address" TEXT,
  "city" TEXT, "phone" TEXT, "normalizedPhone" TEXT, "website" TEXT, "normalizedDomain" TEXT,
  "mapsUrl" TEXT, "email" TEXT, "instagramUrl" TEXT, "facebookUrl" TEXT, "description" TEXT,
  "serviceTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "eventTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "serviceArea" TEXT, "rating" DOUBLE PRECISION, "reviewCount" INTEGER, "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION, "source" "LeadSourceType" NOT NULL DEFAULT 'BUSINESS_SEARCH',
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW', "deterministicScore" INTEGER NOT NULL DEFAULT 0,
  "aiScore" INTEGER, "aiReason" TEXT, "recommendedContact" TEXT,
  "quality" "LeadQuality" NOT NULL DEFAULT 'LOW', "fitReason" TEXT, "notes" TEXT,
  "lastContactedAt" TIMESTAMP(3), "nextFollowUpAt" TIMESTAMP(3), "followUpCount" INTEGER NOT NULL DEFAULT 0,
  "estimatedDealValue" DECIMAL(10,2), "websiteFingerprint" TEXT, "aiQualifiedFingerprint" TEXT, "aiQualifiedAt" TIMESTAMP(3),
  "contactName" TEXT, "eventDate" TIMESTAMP(3), "eventLocation" TEXT, "packageName" TEXT,
  "inquiryMessage" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "Lead_normalizedNameCity_key" ON "Lead"("normalizedNameCity");
CREATE UNIQUE INDEX "Lead_normalizedPhone_key" ON "Lead"("normalizedPhone");
CREATE UNIQUE INDEX "Lead_normalizedDomain_key" ON "Lead"("normalizedDomain");
CREATE UNIQUE INDEX "Lead_provider_providerBusinessId_key" ON "Lead"("provider", "providerBusinessId");
CREATE INDEX "Lead_status_nextFollowUpAt_idx" ON "Lead"("status", "nextFollowUpAt");
CREATE INDEX "Lead_quality_deterministicScore_idx" ON "Lead"("quality", "deterministicScore");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

CREATE TABLE "LeadActivity" ("id" TEXT PRIMARY KEY, "leadId" TEXT NOT NULL, "type" "ActivityType" NOT NULL, "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE;

CREATE TABLE "SearchQuery" ("id" TEXT PRIMARY KEY, "category" TEXT NOT NULL, "location" TEXT NOT NULL, "enabled" BOOLEAN NOT NULL DEFAULT true, "lastRunAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "SearchQuery_category_location_key" ON "SearchQuery"("category", "location");
CREATE INDEX "SearchQuery_enabled_lastRunAt_idx" ON "SearchQuery"("enabled", "lastRunAt");

CREATE TABLE "LeadSearchSource" ("id" TEXT PRIMARY KEY, "leadId" TEXT NOT NULL, "searchQueryId" TEXT NOT NULL, "queryText" TEXT NOT NULL, "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "LeadSearchSource_leadId_searchQueryId_key" ON "LeadSearchSource"("leadId", "searchQueryId");
ALTER TABLE "LeadSearchSource" ADD CONSTRAINT "LeadSearchSource_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE;
ALTER TABLE "LeadSearchSource" ADD CONSTRAINT "LeadSearchSource_searchQueryId_fkey" FOREIGN KEY ("searchQueryId") REFERENCES "SearchQuery"("id") ON DELETE CASCADE;

CREATE TABLE "SearchRun" ("id" TEXT PRIMARY KEY, "searchQueryId" TEXT, "queryText" TEXT NOT NULL, "status" "SearchRunStatus" NOT NULL DEFAULT 'RUNNING', "businessesFound" INTEGER NOT NULL DEFAULT 0, "duplicateCount" INTEGER NOT NULL DEFAULT 0, "newLeadCount" INTEGER NOT NULL DEFAULT 0, "highCount" INTEGER NOT NULL DEFAULT 0, "mediumCount" INTEGER NOT NULL DEFAULT 0, "lowCount" INTEGER NOT NULL DEFAULT 0, "errorMessage" TEXT, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completedAt" TIMESTAMP(3));
CREATE INDEX "SearchRun_startedAt_idx" ON "SearchRun"("startedAt");
ALTER TABLE "SearchRun" ADD CONSTRAINT "SearchRun_searchQueryId_fkey" FOREIGN KEY ("searchQueryId") REFERENCES "SearchQuery"("id") ON DELETE SET NULL;

CREATE TABLE "AppSetting" ("key" TEXT PRIMARY KEY, "value" JSONB NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL);
