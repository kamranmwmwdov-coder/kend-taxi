import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { logAudit } from "@/modules/logs/logs.service";
import { ok, fail } from "@/utils/api-response";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const listing = await jobListingsService.getById(params.id);
    return ok(listing);
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const listing = await jobListingsService.update(params.id, body);
    await logAudit({ userId: admin.id, action: "UPDATE_JOB_LISTING", module: "job-listings", meta: { listingId: params.id } });
    return ok(listing, "Elan yeniləndi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const { reason, note } = body as { reason?: string; note?: string };
    if (!reason) return fail("Silmə səbəbi seçilməlidir.", 422);

    await jobListingsService.removeWithReason(params.id, reason, note);
    await logAudit({
      userId: admin.id,
      action: "DELETE_JOB_LISTING",
      module: "job-listings",
      meta: { listingId: params.id, reason, note },
    });
    return ok(null, "Elan silindi və istifadəçiyə bildiriş göndərildi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
