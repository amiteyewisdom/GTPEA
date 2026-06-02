import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  return new NextResponse(
    `PROXY IS RUNNING ON: ${request.nextUrl.pathname}`,
    { status: 200 }
  );
}
