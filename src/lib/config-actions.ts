"use server";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "./auth";
import type { SiteConfig } from "./config";

export async function saveSiteConfig(partial: Partial<SiteConfig>): Promise<{ ok: true }> {
  await requireAdmin();
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
  return { ok: true };
}
