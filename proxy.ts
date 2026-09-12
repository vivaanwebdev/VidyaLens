import { NextRequest, NextResponse } from "next/server";

// Keep the public educator URL stable while preserving the legacy page on disk.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/teacher") {
    return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/teacher"] };
