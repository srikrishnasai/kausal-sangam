import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic auth gate. Real authorisation is enforced again in every
 * server component and server action — this only avoids rendering
 * signed-in shells for anonymous visitors.
 */
export function proxy(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  if (sessionCookie) return NextResponse.next();

  const url = new URL("/login", request.url);
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/swaps/:path*"],
};
