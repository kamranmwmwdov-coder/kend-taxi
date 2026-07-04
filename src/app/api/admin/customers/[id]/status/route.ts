import { NextRequest } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import { getSupabaseAdmin } from "@/utils/supabase-admin";
import { ok, fail } from "@/utils/api-response";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const { status } = await req.json();
    if (!["ACTIVE", "BLOCKED"].includes(status)) return fail("Naməlum status", 422);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("users").update({ status }).eq("id", params.id).eq("role", "CUSTOMER");
    if (error) throw error;

    void admin;
    return ok(null, "Status yeniləndi");
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
