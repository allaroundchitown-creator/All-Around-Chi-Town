import { getConfig } from "@/lib/settings";
import { SettingsForm } from "@/components/settings-form";
export const dynamic = "force-dynamic";
export default async function SettingsPage() { const config = await getConfig(); return <div className="page-shell"><p className="eyebrow">Controls</p><h1 className="page-title">Settings</h1><p className="page-copy">Edit the search queue and conservative daily guardrails without changing code.</p><SettingsForm config={config} /></div>; }
