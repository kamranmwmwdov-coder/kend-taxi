import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/utils/session";
import { JobListingForm } from "@/components/job-listings/JobListingForm";

export default async function NewJobListingPage() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/customer/login");

  return (
    <main className="min-h-screen px-4 pt-4 max-w-sm mx-auto pb-8">
      <Link href="/customer/job-listings/mine" className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
        <ArrowLeft size={18} className="text-ink" />
      </Link>
      <h1 className="mb-1 text-xl font-bold text-ink">Elan yerləşdir</h1>
      <p className="mb-5 text-sm text-ink-muted">
        Elanınız paylaşıldıqdan sonra 🟡 moderator təsdiqini gözləyəcək və təsdiqləndikdən sonra 7 gün aktiv qalacaq.
      </p>
      <JobListingForm />
    </main>
  );
}
