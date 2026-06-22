import { NextRequest, NextResponse } from "next/server";

// First-label values that are apex hosts (not real subdomains).
// `lvh.me` is two parts so it never reaches here, but the set is kept
// in case a future deploy uses `lvh.localhost` style hosts.
const APEX_FIRST_LABELS = new Set(["www", "lvh", "localhost"]);

/**
 * Subdomain detection.
 *
 * For a hostname like `myshop.lvh.me:3000`, extracts `myshop` and forwards
 * it to the rest of the request pipeline as the `x-subdomain` request header.
 *
 * Skips: `/_next/*`, `/api/*`, paths with a `.` (static files), apex hosts
 * (e.g. `lvh.me`, `localhost`), and the `www.` prefix.
 */
export function middleware(request: NextRequest) {
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
  // Strip the port (e.g. ":3000") so it isn't mistaken for a subdomain label.
  const hostNoPort = hostname.split(":")[0];
  const parts = hostNoPort.split(".");

  // Need at least 3 labels (subdomain.domain.tld) to have a real subdomain.
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
