import { requireCustomer } from "@/utils/require-role";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { ok, fail } from "@/utils/api-response";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await requireCustomer();
    const result = await jobListingsService.getActiveDetail(params.id, customer.id);
    return ok(result);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await requireCustomer();
    const body = await req.json();
    const listing = await jobListingsService.updateOwn(params.id, customer.id, body);
    return ok(listing, "Elan yeniləndi və yenidən moderator təsdiqinə göndərildi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await requireCustomer();
    await jobListingsService.deleteOwn(params.id, customer.id);
    return ok(null, "Elan silindi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
