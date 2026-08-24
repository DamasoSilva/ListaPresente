import { NextResponse } from "next/server";
import { authenticateWithCredentials, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe email e senha." },
        { status: 400 }
      );
    }
    const result = await authenticateWithCredentials(email, password);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    await setSessionCookie(result.token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("LOGIN_ERROR", e);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
