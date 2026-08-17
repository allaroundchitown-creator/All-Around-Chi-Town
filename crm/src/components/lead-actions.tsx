"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, CalendarPlus, Copy, Sparkles } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/constants";

export function LeadActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<{ emailSubject: string; emailBody: string; instagramDm: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function update(payload: Record<string, unknown>) {
    setLoading(true); setMessage("");
    const response = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(data.error ?? "Could not save");
    setMessage("Saved"); router.refresh();
  }
  async function generate() {
    setLoading(true); setMessage("");
    const response = await fetch(`/api/leads/${id}/outreach`, { method: "POST" }); const data = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(data.error ?? "Could not generate outreach"); setDraft(data);
  }
  async function qualify() {
    setLoading(true); setMessage("");
    const response = await fetch(`/api/leads/${id}/qualify`, { method: "POST" }); const data = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(data.error ?? "Could not qualify lead");
    setMessage(`AI score ${data.aiScore}/100 — ${data.reason}`); router.refresh();
  }

  return <div className="space-y-4">
    <div className="rounded-2xl border border-white/8 bg-[#111] p-5">
      <h2 className="text-sm font-semibold">Pipeline</h2>
      <label className="mt-4 block text-xs text-zinc-500">Status<select value={status} onChange={(event) => update({ status: event.target.value })} disabled={loading} className="field mt-2">{LEAD_STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="mt-4 block text-xs text-zinc-500">Next follow-up<input type="datetime-local" className="field mt-2" onChange={(event) => update({ nextFollowUpAt: event.target.value ? new Date(event.target.value).toISOString() : null })} /></label>
      <form className="mt-4" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); update({ notes: form.get("notes"), activityType: "NOTE_ADDED", activityNotes: form.get("notes") }); event.currentTarget.reset(); }}><textarea name="notes" required maxLength={2000} rows={3} className="field resize-none" placeholder="Add a note…" /><button className="mt-2 w-full rounded-xl border border-white/10 py-2.5 text-xs font-medium text-zinc-300">Add note</button></form>
      {message && <p className="mt-3 text-xs leading-5 text-[#d5b36c]">{message}</p>}
    </div>
    <div className="grid grid-cols-2 gap-2"><button onClick={qualify} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl border border-[#d5b36c]/25 py-3 text-xs font-semibold text-[#d5b36c] disabled:opacity-50"><Brain size={15} />AI qualify</button><button onClick={generate} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-[#d5b36c] py-3 text-xs font-semibold text-black disabled:opacity-50"><Sparkles size={15} />Outreach</button></div>
    {draft && <div className="rounded-2xl border border-white/8 bg-[#111] p-5 text-sm"><h3 className="font-semibold">Email</h3><p className="mt-3 text-xs font-medium text-[#d5b36c]">{draft.emailSubject}</p><p className="mt-2 whitespace-pre-wrap leading-6 text-zinc-400">{draft.emailBody}</p><button onClick={() => navigator.clipboard.writeText(`${draft.emailSubject}\n\n${draft.emailBody}`)} className="mt-3 flex items-center gap-2 text-xs text-zinc-300"><Copy size={13} />Copy email</button><h3 className="mt-5 font-semibold">Instagram DM</h3><p className="mt-2 whitespace-pre-wrap leading-6 text-zinc-400">{draft.instagramDm}</p><button onClick={() => navigator.clipboard.writeText(draft.instagramDm)} className="mt-3 flex items-center gap-2 text-xs text-zinc-300"><Copy size={13} />Copy DM</button></div>}
    <div className="rounded-2xl border border-[#d5b36c]/15 bg-[#d5b36c]/5 p-4 text-xs leading-5 text-[#bda875]"><CalendarPlus size={15} className="mb-2" />Drafts are never sent automatically. You stay in control of every message.</div>
  </div>;
}
