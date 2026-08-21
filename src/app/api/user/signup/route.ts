import { NextResponse } from "next/server";
import { signupUser } from "@/lib/user-actions";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await signupUser({
      name: String(body.name || ""),
      email: String(body.email || ""),
      phone: String(body.phone || ""),
      password: String(body.password || ""),
    });
    if ("error" in res) return NextResponse.json(res, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
