import { redirect } from "next/navigation";
import { getSiteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  redirect("/");
}
