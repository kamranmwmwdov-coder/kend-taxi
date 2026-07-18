import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { logAudit } from "@/modules/logs/logs.service";
import { ok, fail } from "@/utils/api-response";

export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const listing = await jobListingsService.approve(params.id);
    await logAudit({ userId: admin.id, action: "APPROVE_JOB_LISTING", module: "job-listings", meta: { listingId: params.id } });
    return ok(listing, "Elan təsdiqləndi və aktiv edildi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
