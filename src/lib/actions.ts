"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  categories,
  externalProducts,
  products,
  reservations,
} from "@/db/schema";
import { requireAdmin, type SessionUser } from "./auth";
import { slugify, validateEmail, validatePhone } from "./utils";
import { deleteLocalFiles } from "./uploads";

export type ActionError = { error: string };
export type ActionOk<T = { ok: true }> = T & { ok: true };

function actionError(message: string): ActionError {
  return { error: message };
}

/* ------------------------------------------------------------------ */
/* Public: reservation                                                  */
/* ------------------------------------------------------------------ */

export type ReserveInput = {
  productId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  message?: string;
  quantity: number;
  idempotencyKey?: string;
};

export type ReserveOutput =
  | ActionOk<{
      reservationId: number;
      publicToken: string;
      productName: string;
      quantity: number;
    }>
  | ActionError;

export async function createReservation(input: ReserveInput): Promise<ReserveOutput> {
  // Basic input sanitization
  const name = (input.guestName || "").trim().slice(0, 200);
  const email = (input.guestEmail || "").trim().slice(0, 255);
  const phone = (input.guestPhone || "").trim().slice(0, 40);
  const message = (input.message || "").trim().slice(0, 1000) || null;
  const qty = Math.max(1, Math.floor(Number(input.quantity) || 1));

  if (name.length < 2) return actionError("Informe seu nome completo.");
  const emailErr = validateEmail(email);
  if (emailErr) return actionError(emailErr);
  const phoneErr = validatePhone(phone);
  if (phoneErr) return actionError(phoneErr);
  if (!Number.isFinite(input.productId) || input.productId <= 0) {
    return actionError("Presente inválido.");
  }

  const idem = input.idempotencyKey?.trim() || null;

  // Idempotency: return existing reservation if same key
  if (idem) {
    const existing = await db.query.reservations.findFirst({
      where: (t, { eq }) => eq(t.idempotencyKey, idem),
      with: { product: true } as never,
    });
    if (existing) {
      const prod = await db.query.products.findFirst({
        where: (t, { eq }) => eq(t.id, existing.productId),
      });
      return {
        ok: true,
        reservationId: existing.id,
        publicToken: existing.publicToken,
        productName: prod?.name ?? "presente",
        quantity: existing.quantity,
      };
    }
  }

  // Transactional reservation with SELECT FOR UPDATE
  const result = await db.transaction(async (tx) => {
    // Lock the product row
    const locked = await tx.execute<{
      id: number;
      name: string;
      active: boolean;
      total_quantity: number;
      reserved_quantity: number;
    }>(
      sql`select id, name, active, total_quantity, reserved_quantity
          from products where id = ${input.productId} for update`
    );
    const row = locked.rows?.[0];
    if (!row) throw new Error("PRODUCT_NOT_FOUND");
    if (!row.active) throw new Error("PRODUCT_INACTIVE");

    const available = row.total_quantity - row.reserved_quantity;
    if (qty > available) throw new Error("INSUFFICIENT_STOCK");

    const publicToken = generateToken();

    const inserted = await tx
      .insert(reservations)
      .values({
        productId: row.id,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        message,
        quantity: qty,
        status: "reservada",
        publicToken,
        idempotencyKey: idem,
      })
      .returning({ id: reservations.id });

    await tx
      .update(products)
      .set({
        reservedQuantity: sql`${products.reservedQuantity} + ${qty}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, row.id));

    return {
      id: inserted[0].id,
      publicToken,
      productName: row.name,
      quantity: qty,
    };
  });

  return {
    ok: true,
    reservationId: result.id,
    publicToken: result.publicToken,
    productName: result.productName,
    quantity: result.quantity,
  };
}

function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/* ------------------------------------------------------------------ */
/* Admin: products                                                      */
/* ------------------------------------------------------------------ */

async function logAction(
  admin: SessionUser | null,
  action: string,
  entity: string,
  entityId: string | number | null,
  info?: unknown
) {
  await db.insert(auditLogs).values({
    adminId: admin?.id ?? null,
    action,
    entity,
    entityId: entityId === null ? null : String(entityId),
    info: info ?? null,
  });
}

export type ProductInput = {
  id?: number;
  name: string;
  description?: string;
  fullDescription?: string;
  categoryId?: number | null;
  imageUrl?: string;
  images?: string[];
  totalQuantity: number;
  price?: string | null;
  priceRange?: string;
  priority?: string;
  brand?: string;
  model?: string;
  notes?: string;
  externalLink?: string;
  featured?: boolean;
  active?: boolean;
  order?: number;
};

export async function upsertProduct(input: ProductInput): Promise<
  | ActionOk<{ id: number }>
  | ActionError
> {
  const admin = await requireAdmin();
  const name = (input.name || "").trim();
  if (!name) return actionError("Nome é obrigatório.");

  const total = Math.max(1, Math.floor(Number(input.totalQuantity) || 1));

  if (input.id) {
    // Update
    const [current] = await db
      .select()
      .from(products)
      .where(eq(products.id, input.id))
      .limit(1);
    if (!current) return actionError("Produto não encontrado.");

    // If reducing total below reserved, block
    if (total < current.reservedQuantity) {
      return actionError(
        `Não é possível reduzir a quantidade para menos de ${current.reservedQuantity} (já reservadas).`
      );
    }

    const nextImages = input.images ?? current.images ?? [];
    const removed = (current.images ?? []).filter(
      (img) => !nextImages.includes(img)
    );
    if (removed.length) await deleteLocalFiles(removed);

    const nextReserved = Math.min(current.reservedQuantity, total);
    const [updated] = await db
      .update(products)
      .set({
        name,
        description: input.description ?? current.description,
        fullDescription: input.fullDescription ?? current.fullDescription,
        categoryId: input.categoryId ?? current.categoryId,
        imageUrl: input.imageUrl ?? current.imageUrl,
        images: input.images ?? current.images,
        totalQuantity: total,
        reservedQuantity: nextReserved,
        price: input.price ?? current.price,
        priceRange: input.priceRange ?? current.priceRange,
        priority: input.priority ?? current.priority,
        brand: input.brand ?? current.brand,
        model: input.model ?? current.model,
        notes: input.notes ?? current.notes,
        externalLink: input.externalLink ?? current.externalLink,
        featured: input.featured ?? current.featured,
        active: input.active ?? current.active,
        order: input.order ?? current.order,
        updatedAt: new Date(),
      })
      .where(eq(products.id, input.id))
      .returning({ id: products.id });
    await logAction(admin, "update", "product", updated.id);
    return { ok: true, id: updated.id };
  }

  // Create
  let slug = slugify(name) || "presente";
  // Ensure unique slug
  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug));
  if (existing.length) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const [created] = await db
    .insert(products)
    .values({
      name,
      slug,
      description: input.description ?? null,
      fullDescription: input.fullDescription ?? null,
      categoryId: input.categoryId ?? null,
      imageUrl: input.imageUrl ?? null,
      images: input.images ?? [],
      totalQuantity: total,
      reservedQuantity: 0,
      price: input.price ?? null,
      priceRange: input.priceRange ?? "$$",
      priority: input.priority ?? "media",
      brand: input.brand ?? null,
      model: input.model ?? null,
      notes: input.notes ?? null,
      externalLink: input.externalLink ?? null,
      featured: input.featured ?? false,
      active: input.active ?? true,
      order: input.order ?? 0,
    })
    .returning({ id: products.id });

  await logAction(admin, "create", "product", created.id);
  return { ok: true, id: created.id };
}

export async function toggleProductActive(
  id: number,
  active: boolean
): Promise<ActionOk | ActionError> {
  const admin = await requireAdmin();
  await db
    .update(products)
    .set({ active, updatedAt: new Date() })
    .where(eq(products.id, id));
  await logAction(admin, active ? "activate" : "deactivate", "product", id);
  return { ok: true };
}

export async function deleteProduct(id: number): Promise<ActionOk | ActionError> {
  const admin = await requireAdmin();
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!product) return actionError("Produto não encontrado.");
  // Don't delete products with active reservations
  const activeReservations = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(eq(reservations.productId, id), eq(reservations.status, "reservada"))
    )
    .limit(1);
  if (activeReservations.length) {
    return actionError(
      "Este produto possui reservas ativas. Desative-o em vez de excluir."
    );
  }
  const files = [product.imageUrl, ...(product.images ?? [])].filter(
    (x): x is string => !!x
  );
  await deleteLocalFiles(files);
  await db.delete(products).where(eq(products.id, id));
  await logAction(admin, "delete", "product", id);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Admin: reservations                                                  */
/* ------------------------------------------------------------------ */

export async function updateReservationStatus(
  id: number,
  status: "reservada" | "cancelada" | "entregue" | "confirmada"
): Promise<ActionOk | ActionError> {
  const admin = await requireAdmin();
  const [res] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  if (!res) return actionError("Reserva não encontrada.");

  const wasActive = res.status === "reservada" || res.status === "confirmada";
  const willBeActive = status === "reservada" || status === "confirmada";

  await db.transaction(async (tx) => {
    if (wasActive && !willBeActive) {
      // Restore stock
      await tx
        .update(products)
        .set({
          reservedQuantity: sql`greatest(0, ${products.reservedQuantity} - ${res.quantity})`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, res.productId));
    } else if (!wasActive && willBeActive) {
      // Re-reserve stock — but only if product has available quantity
      const locked = await tx.execute<{
        total_quantity: number;
        reserved_quantity: number;
      }>(
        sql`select total_quantity, reserved_quantity
            from products where id = ${res.productId} for update`
      );
      const row = locked.rows?.[0];
      if (row) {
        const available = row.total_quantity - row.reserved_quantity;
        if (res.quantity > available) {
          throw new Error("INSUFFICIENT_STOCK");
        }
        await tx
          .update(products)
          .set({
            reservedQuantity: sql`${products.reservedQuantity} + ${res.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, res.productId));
      }
    }

    await tx
      .update(reservations)
      .set({ status, updatedAt: new Date() })
      .where(eq(reservations.id, id));
  });

  await logAction(admin, "update_status", "reservation", id, { status });
  return { ok: true };
}

export async function deleteReservation(
  id: number
): Promise<ActionOk | ActionError> {
  const admin = await requireAdmin();
  const [res] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  if (!res) return actionError("Reserva não encontrada.");
  await db.transaction(async (tx) => {
    const wasActive = res.status === "reservada" || res.status === "confirmada";
    if (wasActive) {
      await tx
        .update(products)
        .set({
          reservedQuantity: sql`greatest(0, ${products.reservedQuantity} - ${res.quantity})`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, res.productId));
    }
    await tx.delete(reservations).where(eq(reservations.id, id));
  });
  await logAction(admin, "delete", "reservation", id);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Admin: categories                                                    */
/* ------------------------------------------------------------------ */

export type CategoryInput = {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  active?: boolean;
};

export async function upsertCategory(
  input: CategoryInput
): Promise<ActionOk<{ id: number }> | ActionError> {
  const admin = await requireAdmin();
  const name = (input.name || "").trim();
  if (!name) return actionError("Nome é obrigatório.");
  const slug = slugify(name) || "categoria";

  if (input.id) {
    const [updated] = await db
      .update(categories)
      .set({
        name,
        description: input.description ?? null,
        icon: input.icon ?? null,
        order: input.order ?? 0,
        active: input.active ?? true,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, input.id))
      .returning({ id: categories.id });
    await logAction(admin, "update", "category", updated.id);
    return { ok: true, id: updated.id };
  }

  const [created] = await db
    .insert(categories)
    .values({
      name,
      slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      order: input.order ?? 0,
      active: input.active ?? true,
    })
    .returning({ id: categories.id });
  await logAction(admin, "create", "category", created.id);
  return { ok: true, id: created.id };
}

export async function deleteCategory(
  id: number
): Promise<ActionOk | ActionError> {
  const admin = await requireAdmin();
  // Disallow if products use it
  const usage = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.categoryId, id))
    .limit(1);
  if (usage.length) {
    return actionError("Existem produtos nesta categoria. Reatribua antes.");
  }
  await db.delete(categories).where(eq(categories.id, id));
  await logAction(admin, "delete", "category", id);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Admin: external products                                             */
/* ------------------------------------------------------------------ */

export type ExternalProductInput = {
  id?: number;
  name: string;
  description?: string;
  imageUrl?: string;
  store?: string;
  price?: string | null;
  url: string;
  category?: string;
  featured?: boolean;
  active?: boolean;
  order?: number;
};

export async function upsertExternalProduct(
  input: ExternalProductInput
): Promise<ActionOk<{ id: number }> | ActionError> {
  const admin = await requireAdmin();
  const name = (input.name || "").trim();
  const url = (input.url || "").trim();
  if (!name) return actionError("Nome é obrigatório.");
  if (!url) return actionError("URL é obrigatória.");

  if (input.id) {
    const [updated] = await db
      .update(externalProducts)
      .set({
        name,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        store: input.store ?? null,
        price: input.price ?? null,
        url,
        category: input.category ?? null,
        featured: input.featured ?? false,
        active: input.active ?? true,
        order: input.order ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(externalProducts.id, input.id))
      .returning({ id: externalProducts.id });
    await logAction(admin, "update", "external_product", updated.id);
    return { ok: true, id: updated.id };
  }

  const [created] = await db
    .insert(externalProducts)
    .values({
      name,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      store: input.store ?? null,
      price: input.price ?? null,
      url,
      category: input.category ?? null,
      featured: input.featured ?? false,
      active: input.active ?? true,
      order: input.order ?? 0,
    })
    .returning({ id: externalProducts.id });
  await logAction(admin, "create", "external_product", created.id);
  return { ok: true, id: created.id };
}

export async function deleteExternalProduct(
  id: number
): Promise<ActionOk | ActionError> {
  const admin = await requireAdmin();
  await db.delete(externalProducts).where(eq(externalProducts.id, id));
  await logAction(admin, "delete", "external_product", id);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Public: product listing helpers                                      */
/* ------------------------------------------------------------------ */

export type ProductFilters = {
  search?: string;
  categoryId?: number;
  priority?: string;
  priceRange?: string;
  availableOnly?: boolean;
  includeReserved?: boolean;
  sort?:
    | "recommended"
    | "priority"
    | "name"
    | "price_asc"
    | "price_desc"
    | "newest";
  limit?: number;
  featuredOnly?: boolean;
};

export async function listProducts(filters: ProductFilters = {}) {
  const conditions = [eq(products.active, true)];
  if (!filters.includeReserved) {
    // still show all active, availability is handled in UI
  }
  if (filters.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters.priority) {
    conditions.push(eq(products.priority, filters.priority));
  }
  if (filters.priceRange) {
    conditions.push(eq(products.priceRange, filters.priceRange));
  }
  if (filters.featuredOnly) {
    conditions.push(eq(products.featured, true));
  }

  const where = conditions.length === 1 ? conditions[0] : and(...conditions);

  const rows = await db.query.products.findMany({
    where,
    with: { category: true },
    orderBy: (t, { asc, desc }) => {
      switch (filters.sort) {
        case "name":
          return [asc(t.name)];
        case "price_asc":
          return [asc(t.price)];
        case "price_desc":
          return [desc(t.price)];
        case "newest":
          return [desc(t.createdAt)];
        case "priority":
          return [asc(t.priority), asc(t.order), asc(t.name)];
        case "recommended":
        default:
          return [desc(t.featured), asc(t.order), asc(t.name)];
      }
    },
    limit: filters.limit,
  });

  // Apply search + availability client-side (simple text search)
  let list = rows;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }
  if (filters.availableOnly) {
    list = list.filter((p) => p.totalQuantity - p.reservedQuantity > 0);
  }

  return list;
}

export type ListResult = Awaited<ReturnType<typeof listProducts>>;
