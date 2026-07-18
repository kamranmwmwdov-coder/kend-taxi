import { NextRequest, NextResponse } from "next/server";
import { jobListingsService } from "@/modules/job-listings/job-listings.service";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await jobListingsService.expireOldListings();
    return NextResponse.json({ success: true, expiredCount: count });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
