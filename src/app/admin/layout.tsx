import { redirect } from "next/navigation";
import { getSession } from "@/utils/session";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex bg-surface-muted">
      {session && session.role === "ADMIN" ? (
        <>
          <AdminSidebar adminName={session.firstName} />
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </>
      ) : (
        children
      )}
    </div>
  );
}