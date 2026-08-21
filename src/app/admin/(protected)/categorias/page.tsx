import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Card } from "@/components/ui";
import { CategoryManager } from "./category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const list = await db.query.categories.findMany({
    orderBy: (c, { asc }) => [asc(c.order), asc(c.name)],
  });
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
          Categorias
        </p>
        <h1 className="font-display text-3xl text-[var(--color-navy)] md:text-4xl">
          Categorias de presentes
        </h1>
      </div>
      <CategoryManager initial={list} />
    </div>
  );
}
