import { requireCustomer } from "@/utils/require-role";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { ok, fail } from "@/utils/api-response";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireCustomer();
    const body = await req.json();
    const kind = body.kind === "whatsapp" ? "whatsapp" : "phone";
    await jobListingsService.recordContactClick(params.id, kind);
    return ok(null);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
