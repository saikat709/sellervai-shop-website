import { NextRequest, NextResponse } from "next/server";

const APEX_FIRST_LABELS = new Set(["www", "lvh", "localhost"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next internals, API routes, and file-like paths.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hostname = request.headers.get("host") ?? "";
  const hostNoPort = hostname.split(":")[0];
  const parts = hostNoPort.split(".");

  if (parts.length < 3) {
    return NextResponse.next();
  }

  const first = parts[0].toLowerCase();
  if (APEX_FIRST_LABELS.has(first)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-subdomain", first);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
