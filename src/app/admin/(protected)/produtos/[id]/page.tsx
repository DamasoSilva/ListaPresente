import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminProdutoEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) return notFound();
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: { category: true },
  });
  if (!product) return notFound();
  const cats = await db.query.categories.findMany({
    where: eq(categories.active, true),
    orderBy: (c, { asc }) => asc(c.name),
  });
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-mute)]">
        Editar presente
      </p>
      <h1 className="mt-2 font-display text-3xl text-[var(--color-navy)]">
        {product.name}
      </h1>
      <Card className="mt-6">
        <ProductForm categories={cats} initial={product} />
      </Card>
    </div>
  );
}
