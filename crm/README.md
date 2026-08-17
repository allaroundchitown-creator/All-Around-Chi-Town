# All Around Chi Town CRM

A low-cost lead discovery and lightweight CRM application for All Around Chi Town. It is a separate Next.js application so the existing public website remains unchanged.

## What is included

- Manual Google Places lead search by category and Chicagoland location
- Duplicate prevention by provider ID, normalized domain, normalized phone, then normalized name + city
- Respectful, bounded website research with robots.txt checks, timeouts, HTML size limits, and public contact extraction
- Deterministic 0–100 scoring with separately stored optional AI qualification fields
- Lead pipeline, detail pages, quick contact actions, activity history, notes, and follow-up dates
- Follow Up Today and search-run reporting views
- Optional AI-written email and Instagram drafts; drafts are never sent automatically
- Rotating daily search queue with strict cost controls
- Authenticated website inquiry endpoint that creates priority CRM leads
- PostgreSQL schema, migration, seed data, tests, Vercel Cron configuration, and optional Basic Auth

## Local setup

Requirements: Node.js 20+ and PostgreSQL 15+.

1. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` plus any optional API keys.
2. Install packages with `npm install`.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply the included migration with `npm run db:migrate` (use `npm run db:dev` while developing new migrations).
5. Seed editable categories, cities, limits, and the rotating queue with `npm run db:seed`.
6. Start the app with `npm run dev`, then open `http://localhost:3000`.

Without `DATABASE_URL`, the UI intentionally opens in preview mode with representative data. Mutations and external searches return a clear configuration error instead of failing silently.

## Required credentials

### Google Places API

1. Create or select a project in Google Cloud Console.
2. Enable **Places API (New)** and attach a billing account.
3. Create an API key and restrict it to Places API (New). For production, also restrict requests to the server environment where practical.
4. Set `GOOGLE_PLACES_API_KEY` only in server environment variables. Never prefix it with `NEXT_PUBLIC_`.

The app uses the official Places Text Search (New) endpoint and requests only the fields it stores.

### OpenAI (optional)

Create a server API key in the OpenAI platform and set `OPENAI_API_KEY`. AI is used only when a user clicks Generate Outreach (the qualification helper is ready for later use). The deterministic score remains authoritative and stored separately.

## Vercel deployment

1. Import this repository in Vercel and set the project Root Directory to `crm`.
2. Attach a managed PostgreSQL provider (for example Neon through Vercel Marketplace) and set `DATABASE_URL`.
3. Add the values from `.env.example` in Project Settings → Environment Variables.
4. Generate long random values for `CRON_SECRET`, `INQUIRY_API_SECRET`, and `CRM_BASIC_AUTH_PASSWORD`.
5. Deploy, then run `npm run db:migrate` and `npm run db:seed` against the production `DATABASE_URL` from a trusted local terminal or CI migration job.
6. Vercel reads `vercel.json` and calls `/api/cron/discover` daily. The job processes only two least-recently-searched combinations per run and still respects daily settings.

For stronger multi-user access later, replace Basic Auth with Clerk, Auth0, or an internal SSO provider and add user/audit models.

## Website inquiry integration

Send a POST request to `/api/inquiries` with `Content-Type: application/json` and header `x-inquiry-secret: <INQUIRY_API_SECRET>`:

```json
{
  "customerName": "Maya Johnson",
  "email": "maya@example.com",
  "phone": "312-555-0123",
  "instagram": "https://instagram.com/maya",
  "eventDate": "2026-10-24T00:00:00.000Z",
  "eventType": "Wedding",
  "eventLocation": "Schaumburg, IL",
  "package": "Gold",
  "message": "We expect about 175 guests."
}
```

Successful inquiries are marked `WEBSITE_INQUIRY`, scored 100, classified HIGH, and appear in the same pipeline.

## Editing cities, categories, and limits

Open **Settings** in the CRM. Enter one category or location per line, adjust the numeric daily limits, and save. The next scheduled run synchronizes new combinations into the rotating queue. Existing combinations and historical search sources remain intact.

Defaults are intentionally conservative: 6 searches/day, 40 businesses/day, 3 website pages/new lead, and 10 AI qualifications/day. Google caps Text Search at 20 results/request in this app.

## Expected low-volume monthly cost

- Vercel: commonly $0 on the Hobby tier for a small private app, subject to current plan rules.
- PostgreSQL: commonly $0 on a small managed free tier; use connection pooling for serverless deployments.
- Google Places: usage-based. At the default 6 daily searches and requested field set, monitor the Google Cloud billing calculator and set a hard budget alert. Actual price depends on Google’s current SKU pricing.
- OpenAI: optional and click-driven; short structured prompts generally stay well below a few dollars/month at low volume.

The target can remain under $20/month at low volume, but third-party pricing changes. Configure provider billing alerts and review Search Runs after the first week.

## Tests and failure behavior

Run `npm test` and `npm run build`. Tests cover identity normalization/deduplication, score calculation, lead status updates, Google result parsing, malformed HTML/contact extraction, and API input validation. External calls use timeouts; unavailable websites do not discard a lead; failed searches create failed SearchRun records; missing keys return actionable errors; AI failures never block normal CRM work.

## Recommended next upgrades

1. Add proper multi-user authentication, roles, and an audit log.
2. Add a review queue before AI qualification and cache AI results by `websiteFingerprint`.
3. Add an email provider only after templates, consent rules, unsubscribe handling, and sending limits are approved.
4. Add CSV export/import and merge suggestions for borderline duplicates.
5. Add conversion and source-performance reports after enough bookings exist.
6. Add Meta’s official Instagram Messaging API only for approved inbound/message workflows—never browser automation.
