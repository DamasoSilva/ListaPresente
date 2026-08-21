import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <AdminSidebar email={session.email} />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
