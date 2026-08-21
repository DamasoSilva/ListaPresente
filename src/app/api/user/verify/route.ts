import { NextResponse } from "next/server";
import { verifyEmail } from "@/lib/user-actions";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const result = await verifyEmail(token);
  if ("error" in result) {
    return NextResponse.redirect(
      new URL("/login?verified=0", url.origin)
    );
  }
  return NextResponse.redirect(new URL("/login?verified=1", url.origin));
}
