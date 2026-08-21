// Small set of shared helpers used across the app.
// Keep this file side-effect free so it can be imported on both client and server.

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Convert an arbitrary string into a URL-safe slug.
 * Removes diacritics and collapses non-alphanumeric characters.
 */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function priceRangeLabel(range: string | null | undefined): string {
  switch (range) {
    case "$":
      return "$ até R$ 50";
    case "$$":
      return "$$ R$ 51–100";
    case "$$$":
      return "$$$ R$ 101–250";
    case "$$$$":
      return "$$$$ R$ 251+";
    default:
      return "";
  }
}

export function priorityLabel(priority: string | null | undefined): {
  label: string;
  emoji: string;
  color: string;
} {
  switch (priority) {
    case "alta":
      return { label: "Alta", emoji: "🔴", color: "text-rose-700" };
    case "baixa":
      return { label: "Baixa", emoji: "🟢", color: "text-emerald-700" };
    default:
      return { label: "Média", emoji: "🟡", color: "text-amber-700" };
  }
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateEmail(value: string): string | null {
  const email = (value || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Informe um e-mail válido.";
  }
  return null;
}

export function validatePhone(value: string): string | null {
  const digits = phoneDigits(value);
  if (digits.length < 10 || digits.length > 13) {
    return "Informe um WhatsApp válido com DDD.";
  }
  return null;
}

export function formatPhone(value: string): string {
  const digits = phoneDigits(value);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

export function whatsappLink(phone: string, message: string): string {
  const digits = phoneDigits(phone);
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function truncate(value: string, max: number): string {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
