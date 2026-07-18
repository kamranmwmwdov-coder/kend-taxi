import { redirect } from "next/navigation";
import { getSession } from "@/utils/session";
import { JobListingDetailView } from "@/components/job-listings/JobListingDetailView";

export default async function CustomerJobListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/customer/login");

  return <JobListingDetailView id={params.id} />;
}
