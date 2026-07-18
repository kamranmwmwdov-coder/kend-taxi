import { requireCustomer } from "@/utils/require-role";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { ok, fail } from "@/utils/api-response";

export async function GET() {
  try {
    const customer = await requireCustomer();
    const listings = await jobListingsService.listMine(customer.id);
    return ok(listings);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
