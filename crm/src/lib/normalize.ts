export function normalizeDomain(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function normalizePhone(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits.length === 10 ? digits : null;
}

export function normalizeNameCity(name: string, city?: string | null) {
  const clean = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
  return `${clean(name)}:${clean(city ?? "")}`;
}
