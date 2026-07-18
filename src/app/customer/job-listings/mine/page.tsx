import { redirect } from "next/navigation";
import { getSession } from "@/utils/session";
import { JobListingsMine } from "@/components/job-listings/JobListingsMine";

export default async function CustomerJobListingsMinePage() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/customer/login");

  return <JobListingsMine />;
}
