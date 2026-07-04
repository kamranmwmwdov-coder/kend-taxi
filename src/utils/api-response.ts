import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function ok<T>(data: T, message = "Uğurlu"): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, message, data, errors: null, timestamp: new Date().toISOString() },
    { status: 200 }
  );
}

export function created<T>(data: T, message = "Yaradıldı"): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, message, data, errors: null, timestamp: new Date().toISOString() },
    { status: 201 }
  );
}

export function fail(
  message: string,
  status = 400,
  errors: Record<string, string> | null = null
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    { success: false, message, data: null, errors, timestamp: new Date().toISOString() },
    { status }
  );
}
