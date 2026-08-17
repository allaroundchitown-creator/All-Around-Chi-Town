"use client";

import { CalendarClock, LayoutDashboard, MapPin, Search, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [["Overview", "/", LayoutDashboard], ["Leads", "/leads", Users], ["Follow ups", "/follow-ups", CalendarClock], ["Search runs", "/search-runs", Search], ["Settings", "/settings", Settings]] as const;

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/8 bg-[#0b0b0b] px-5 py-7 lg:flex lg:flex-col"><Link href="/" className="mb-10 flex items-center gap-3 px-2"><span className="grid size-10 place-items-center rounded-xl border border-[#d5b36c]/25 bg-[#d5b36c]/10 text-[#d5b36c]"><MapPin size={19} /></span><span><span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#cba969]">All Around</span><span className="mt-0.5 block font-semibold tracking-tight">Chi Town CRM</span></span></Link><nav className="space-y-1.5 text-sm">{items.map(([label, href, Icon]) => { const active = href === "/" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition ${active ? "bg-[#cba969]/12 font-medium text-[#e8c982]" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"}`}><Icon size={17} />{label}</Link>; })}</nav><div className="mt-auto rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-xs font-medium text-zinc-300">Cost controls active</p><p className="mt-1.5 text-xs leading-5 text-zinc-600">Conservative daily limits protect your API budget.</p></div></aside>;
}
