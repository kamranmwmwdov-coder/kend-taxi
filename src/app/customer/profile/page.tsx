import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/utils/session";
import { LogoutButton } from "@/components/LogoutButton";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { AddEmailForm } from "@/components/AddEmailForm";

export default async function CustomerProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/customer/login");

  return (
    <main className="min-h-screen px-6 py-8 max-w-sm mx-auto">
      <Link href="/customer/home" className="mb-6 inline-block text-ink-muted"><ArrowLeft /></Link>
      <h1 className="text-xl font-bold mb-6">Profilim</h1>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-4">
        <Row label="Ad" value={session.firstName} />
        <Row label="Soyad" value={session.lastName} />
        <Row label="Telefon" value={session.phone} />
      </div>

      <div className="mb-3">
        <ChangePasswordForm />
      </div>
      <div className="mb-6">
        <AddEmailForm />
      </div>

      <p className="text-xs text-ink-muted mb-6">
        Telefon nömrənizi yalnız Admin dəyişə bilər.
      </p>

      <LogoutButton />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-ink-muted text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
