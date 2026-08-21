import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";

export type SiteConfig = {
  coupleNames: string;
  couplePhoto: string;
  housePhoto: string;
  moveDate: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeMessage: string;
  howItWorksTitle: string;
  howItWorksSteps: string[];
  howItWorksFooter: string;
  footerThanks: string;
  whatsapp: string;
  instagram: string;
  siteUrl: string;
  metaTitle: string;
  metaDescription: string;
  shareMessage: string;
  showGuestNames: boolean;
  showProgress: boolean;
  showCounters: boolean;
  tipMessage: string;
  confirmationMessage: string;
};

export const DEFAULT_CONFIG: SiteConfig = {
  coupleNames: "Cíntia & Damaso",
  couplePhoto: "",
  housePhoto: "",
  moveDate: "",
  welcomeTitle: "Lista de Presentes",
  welcomeSubtitle: "Casa Nova",
  welcomeMessage:
    "Cada detalhe da nossa casa está sendo construído com amor e sonhos. Obrigado!",
  howItWorksTitle: "Como funciona?",
  howItWorksSteps: [
    "Escolha um item que deseja nos presentear.",
    "Reserve o presente pelo site.",
    "Compre o produto onde preferir.",
    "Depois, nos conte! ❤️",
  ],
  howItWorksFooter: "Ficaremos muito felizes com sua participação!",
  footerThanks: "Obrigado por fazer parte desse momento tão especial!",
  whatsapp: "",
  instagram: "",
  siteUrl: "",
  metaTitle: "Lista de Presentes — Casa Nova",
  metaDescription:
    "Estamos começando uma nova fase juntos e queremos compartilhar esse momento com você.",
  shareMessage: "Reservei um presente para a nova casa! ❤️",
  showGuestNames: false,
  showProgress: true,
  showCounters: true,
  tipMessage:
    "Use os filtros para organizar os presentes por categoria, prioridade, faixa de preço ou disponibilidade.",
  confirmationMessage:
    "Você acabou de fazer parte de um pedacinho da nossa nova casa.",
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "sim";
}

function parseList(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // not JSON
  }
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const rows = await db.select().from(siteConfig);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const get = (key: string, fallback: string) => map.get(key) ?? fallback;

  return {
    coupleNames: get("coupleNames", DEFAULT_CONFIG.coupleNames),
    couplePhoto: get("couplePhoto", DEFAULT_CONFIG.couplePhoto),
    housePhoto: get("housePhoto", DEFAULT_CONFIG.housePhoto),
    moveDate: get("moveDate", DEFAULT_CONFIG.moveDate),
    welcomeTitle: get("welcomeTitle", DEFAULT_CONFIG.welcomeTitle),
    welcomeSubtitle: get("welcomeSubtitle", DEFAULT_CONFIG.welcomeSubtitle),
    welcomeMessage: get("welcomeMessage", DEFAULT_CONFIG.welcomeMessage),
    howItWorksTitle: get("howItWorksTitle", DEFAULT_CONFIG.howItWorksTitle),
    howItWorksSteps: parseList(
      get("howItWorksSteps", ""),
      DEFAULT_CONFIG.howItWorksSteps
    ),
    howItWorksFooter: get("howItWorksFooter", DEFAULT_CONFIG.howItWorksFooter),
    footerThanks: get("footerThanks", DEFAULT_CONFIG.footerThanks),
    whatsapp: get("whatsapp", DEFAULT_CONFIG.whatsapp),
    instagram: get("instagram", DEFAULT_CONFIG.instagram),
    siteUrl: get("siteUrl", DEFAULT_CONFIG.siteUrl),
    metaTitle: get("metaTitle", DEFAULT_CONFIG.metaTitle),
    metaDescription: get("metaDescription", DEFAULT_CONFIG.metaDescription),
    shareMessage: get("shareMessage", DEFAULT_CONFIG.shareMessage),
    showGuestNames: parseBool(
      get("showGuestNames", ""),
      DEFAULT_CONFIG.showGuestNames
    ),
    showProgress: parseBool(get("showProgress", ""), DEFAULT_CONFIG.showProgress),
    showCounters: parseBool(get("showCounters", ""), DEFAULT_CONFIG.showCounters),
    tipMessage: get("tipMessage", DEFAULT_CONFIG.tipMessage),
    confirmationMessage: get(
      "confirmationMessage",
      DEFAULT_CONFIG.confirmationMessage
    ),
  };
}

export async function saveSiteConfig(partial: Partial<SiteConfig>): Promise<void> {
  const entries: Array<[string, string]> = [];
  (Object.keys(partial) as Array<keyof SiteConfig>).forEach((key) => {
    const v = partial[key];
    if (v === undefined) return;
    if (key === "howItWorksSteps") {
      entries.push([key, JSON.stringify(v)]);
    } else if (typeof v === "boolean") {
      entries.push([key, v ? "true" : "false"]);
    } else {
      entries.push([key, String(v)]);
    }
  });
  for (const [k, v] of entries) {
    await db.execute(sql`
      insert into site_config (key, value, updated_at)
      values (${k}, ${v}, now())
      on conflict (key) do update
      set value = excluded.value, updated_at = excluded.updated_at
    `);
  }
}
