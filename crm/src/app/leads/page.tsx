import { FindLeads } from "@/components/find-leads";
import { LeadTable } from "@/components/lead-table";
import { getLeads } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function LeadsPage() { const raw = await getLeads(); const leads = raw.map((lead) => ({ ...lead, createdAt: lead.createdAt.toISOString(), nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null })); return <div className="page-shell"><header className="flex flex-col gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Prospect database</p><h1 className="page-title">Leads</h1><p className="page-copy">Sort, filter, and open every prospect or direct inquiry in one place.</p></div><FindLeads /></header><div className="pt-7"><LeadTable leads={leads} /></div></div>; }
