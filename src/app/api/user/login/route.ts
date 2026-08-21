import { NextResponse } from "next/server";
import { loginUser } from "@/lib/user-actions";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await loginUser({
      email: String(body.email || ""),
      password: String(body.password || ""),
    });
    if ("error" in res) return NextResponse.json(res, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
