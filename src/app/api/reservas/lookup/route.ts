import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { reservations, products } from "@/db/schema";
import { validateEmail, validatePhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });
    const phoneErr = validatePhone(phone);
    if (phoneErr) return NextResponse.json({ error: phoneErr }, { status: 400 });

    const list = await db.query.reservations.findMany({
      where: and(
        eq(reservations.guestEmail, email.toLowerCase()),
        eq(reservations.guestPhone, phone)
      ),
      orderBy: (r, { desc }) => desc(r.createdAt),
      with: { product: true },
    });

    return NextResponse.json({ reservations: list });
  } catch {
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
