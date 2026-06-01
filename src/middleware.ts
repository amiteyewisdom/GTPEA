
import { NextResponse } from "next/server";
export async function middleware() {
  return new Response("MIDDLEWARE IS RUNNING", { status: 200 });
}
export const config = { matcher: ["/"] };
