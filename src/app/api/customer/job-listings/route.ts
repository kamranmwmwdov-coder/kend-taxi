import { NextRequest } from "next/server";
import { requireCustomer } from "@/utils/require-role";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";
import { ok, fail } from "@/utils/api-response";

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const customer = await requireCustomer();
    const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0") || 0;
    const listings = await jobListingsService.listActiveFeed(customer.id, offset, PAGE_SIZE);
    return ok({ listings, hasMore: listings.length === PAGE_SIZE });
  } catch (err: any) {
    return fail(err.message ?? "Xəta", err.status ?? 500);
  }
}
