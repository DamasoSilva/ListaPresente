import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserSession } from "@/lib/user-auth";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const [user] = await db
    .select({
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);
  return NextResponse.json({
    authenticated: true,
    email: user?.email ?? session.email,
    name: user?.name ?? null,
    emailVerified: user?.emailVerified ?? false,
  });
}
