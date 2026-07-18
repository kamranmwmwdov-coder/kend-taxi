import { requireCustomer } from "@/utils/require-role";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await requireCustomer();
    await jobListingsService.recordView(params.id, customer.id);
    return ok(null);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
