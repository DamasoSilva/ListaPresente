"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, reservations, users } from "@/db/schema";
import {
  clearUserCookie,
  createUserToken,
  hashPassword,
  setUserCookie,
  verifyPassword,
} from "./user-auth";
import {
  sendEmail,
  verificationEmailHtml,
  verificationEmailText,
} from "./email";
import { validateEmail, validatePhone } from "./utils";

export type ActionError = { error: string };
export type ActionOk<T = { ok: true }> = T & { ok: true };

function actionError(message: string): ActionError {
  return { error: message };
}

function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/* ------------------------------------------------------------------ */
/* User: signup                                                         */
/* ------------------------------------------------------------------ */

export type SignupInput = { name: string; email: string; phone: string; password: string };

export async function signupUser(
  input: SignupInput
): Promise<ActionOk | ActionError> {
  const email = (input.email || "").trim().toLowerCase();
  const name = (input.name || "").trim();
  const phone = (input.phone || "").trim();
  const password = input.password || "";

  if (name.length < 2) return actionError("Informe seu nome completo.");
  if (!EMAIL_RE.test(email)) return actionError("Informe um e-mail válido.");
  const phoneErr = validatePhone(phone);
  if (phoneErr) return actionError(phoneErr);
  if (password.length < 6)
    return actionError("A senha deve ter ao menos 6 caracteres.");

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length)
    return actionError("Este e-mail já possui uma conta.");

  const passwordHash = await hashPassword(password);
  const verificationToken = generateToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [user] = await db
    .insert(users)
    .values({
      email,
      name,
      phone,
      passwordHash,
      verificationToken,
      verificationExpires,
    })
    .returning({ id: users.id, email: users.email });

  await setUserCookie(await createUserToken(user.id, user.email));

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const link = `${base}/api/user/verify?token=${verificationToken}`;
  await sendEmail({
    to: email,
    subject: "Confirme seu e-mail · Lista de Presentes",
    html: verificationEmailHtml(link, "Cíntia & Damaso"),
    text: verificationEmailText(link),
  });
  if (!process.env.SMTP_HOST) {
    console.log(`[email:dev] Link de verificação para ${email}: ${link}`);
  }

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* User: login / logout                                                 */
/* ------------------------------------------------------------------ */

export type LoginInput = { email: string; password: string };

export async function loginUser(
  input: LoginInput
): Promise<ActionOk | ActionError> {
  const email = (input.email || "").trim().toLowerCase();
  const password = input.password || "";

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user) return actionError("E-mail ou senha inválidos.");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return actionError("E-mail ou senha inválidos.");

  await setUserCookie(await createUserToken(user.id, user.email));
  return { ok: true };
}

export async function logoutUser(): Promise<ActionOk> {
  await clearUserCookie();
  return { ok: true };
}

export async function verifyEmail(
  token?: string | null
): Promise<ActionOk | ActionError> {
  const t = (token || "").trim();
  if (!t) return actionError("Token de verificação ausente.");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, t))
    .limit(1);
  if (!user) return actionError("Token de verificação inválido.");
  if (user.verificationExpires && user.verificationExpires < new Date()) {
    return actionError("Este link de verificação expirou. Solicite um novo.");
  }

  await db
    .update(users)
    .set({
      emailVerified: true,
      verificationToken: null,
      verificationExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Public: multi-product reservation (cart checkout)                    */
/* ------------------------------------------------------------------ */

export type MultiReserveInput = {
  items: { productId: number; quantity: number }[];
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  message?: string;
  idempotencyKey?: string;
};

export type MultiReserveResult =
  | ActionOk<{
      groupId: string;
      reservations: {
        productId: number;
        productName: string;
        quantity: number;
        publicToken: string;
      }[];
    }>
  | ActionError;

export async function createReservations(
  input: MultiReserveInput
): Promise<MultiReserveResult> {
  const message = (input.message || "").trim().slice(0, 1000) || null;

  const items = (input.items || [])
    .filter(
      (i) => i && Number.isFinite(i.productId) && Number(i.productId) > 0
    )
    .map((i) => ({
      productId: Number(i.productId),
      quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
    }));
  if (items.length === 0) return actionError("Seu carrinho está vazio.");

  const name = (input.guestName || "").trim();
  const email = (input.guestEmail || "").trim();
  const phone = (input.guestPhone || "").trim();

  if (name.length < 2) return actionError("Informe seu nome completo.");
  const emailErr = validateEmail(email);
  if (emailErr) return actionError(emailErr);
  const phoneErr = validatePhone(phone);
  if (phoneErr) return actionError(phoneErr);

  const groupId = generateToken();
  const groupKey = (input.idempotencyKey || "").trim() || crypto.randomUUID();
  const created: {
    productId: number;
    productName: string;
    quantity: number;
    publicToken: string;
  }[] = [];

  try {
    await db.transaction(async (tx) => {
      for (const item of items) {
        const locked = await tx.execute<{
          id: number;
          name: string;
          active: boolean;
          total_quantity: number;
          reserved_quantity: number;
        }>(
          sql`select id, name, active, total_quantity, reserved_quantity
              from products where id = ${item.productId} for update`
        );
        const row = locked.rows?.[0];
        if (!row) throw new Error(`Produto ${item.productId} não encontrado.`);
        if (!row.active)
          throw new Error(`"${row.name}" não está mais disponível.`);
        const available = row.total_quantity - row.reserved_quantity;
        if (item.quantity > available)
          throw new Error(`Estoque insuficiente para "${row.name}".`);

        const publicToken = generateToken();
        const idem = `${groupKey}:${row.id}`;
        await tx.insert(reservations).values({
          productId: row.id,
          userId: null,
          groupId,
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          message,
          quantity: item.quantity,
          status: "reservada",
          publicToken,
          idempotencyKey: idem,
        });
        await tx
          .update(products)
          .set({
            reservedQuantity: sql`${products.reservedQuantity} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, row.id));

        created.push({
          productId: row.id,
          productName: row.name,
          quantity: item.quantity,
          publicToken,
        });
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Não foi possível concluir a reserva.";
    return actionError(msg);
  }

  return { ok: true, groupId, reservations: created };
}
