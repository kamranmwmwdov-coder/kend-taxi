import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { ok, fail } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const status = req.nextUrl.searchParams.get("status");
    if (status !== "PENDING" && status !== "ACTIVE") {
      return fail("status parametri PENDING və ya ACTIVE olmalıdır.", 422);
    }
    const listings = await jobListingsService.listByStatus(status);
    return ok(listings);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
