import { requireCustomer } from "@/utils/require-role";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await requireCustomer();
    const body = await req.json();
    const myReaction = await jobListingsService.react(params.id, customer.id, body.type);
    return ok({ myReaction });
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
