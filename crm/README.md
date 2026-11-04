# AACT Booths CRM — Netlify starter

Private internal dashboard at /crm/. It is **not** linked from the public website.

## Before using customer data
1. In Netlify Site configuration → Environment variables, add ADMIN_API_TOKEN with a unique random secret at least 32 characters long. Do not commit it.
2. Ensure Netlify Functions are enabled and the @netlify/blobs dependency installs during build.
3. Redeploy the site. Visit /crm/ and choose Connect CRM. Enter the secret only on your own trusted device.
4. Confirm creating a test lead survives a reload and a second browser session before using real customer records.
5. Do not distribute the CRM URL or token. For production use, add Netlify Identity / SSO or another proper login and per-user permissions.

## Scope
The dashboard supports manual leads, bookings, campaigns, paid amounts, pipeline stages and JSON backups. Netlify Blobs stores the shared records; there is no SQLite. The frontend uses bearer-token authentication and does not put the token in the repository.

**Not implemented:** Facebook/Instagram webhook ingestion, a full inbox, Meta Ads / Google Ads reporting, Square sync, audit logs, multi-user login, and reliable campaign attribution. ROAS is calculated from manually entered campaign associations, not verified ad attribution.

**Limitations:** One shared JSON record means concurrent edits can overwrite one another. Move to PostgreSQL with transactional updates and proper user authentication before multi-user production use. Never use this as the only copy of critical customer information.
