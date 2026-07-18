import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/utils/session";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { JobListingForm } from "@/components/job-listings/JobListingForm";

export default async function EditJobListingPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/customer/login");

  const listing = await jobListingsService.getOwnById(params.id, session.id);
  if (!listing) notFound();

  return (
    <main className="min-h-screen px-4 pt-4 max-w-sm mx-auto pb-8">
      <Link href="/customer/job-listings/mine" className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
        <ArrowLeft size={18} className="text-ink" />
      </Link>
      <h1 className="mb-1 text-xl font-bold text-ink">Elanı redaktə et</h1>
      <p className="mb-5 text-sm text-ink-muted">
        Dəyişikliklər yadda saxlanılan kimi elan yenidən 🟡 moderator təsdiqinə göndəriləcək və təsdiqlənənə qədər digər istifadəçilərə görünməyəcək.
      </p>
      <JobListingForm listing={listing} listingId={listing.id} />
    </main>
  );
}
