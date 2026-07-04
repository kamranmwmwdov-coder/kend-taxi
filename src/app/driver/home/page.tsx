import { redirect } from "next/navigation";
import { getSession } from "@/utils/session";
import { DriverDashboard } from "@/components/DriverDashboard";

export default async function DriverHomePage() {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") redirect("/driver/login");

  return <DriverDashboard firstName={session.firstName} />;
}
