import { redirect } from "next/navigation";
import { getSession } from "@/utils/session";
import { JobListingsFeed } from "@/components/job-listings/JobListingsFeed";

export default async function CustomerJobListingsPage() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/customer/login");

  return <JobListingsFeed />;
}
