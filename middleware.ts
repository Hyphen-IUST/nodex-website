import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logActivity, extractClientInfo } from "@/lib/activity-logger";

export function middleware(request: NextRequest) {
  // Skip logging for API routes, static files, and the activity log API itself
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".") ||
    request.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Extract client information
  const clientInfo = extractClientInfo(request);

  // Log the page visit asynchronously (don't block the request)
  logActivity({
    ...clientInfo,
    action: "page_visit",
    page_url: request.url,
  }).catch((error) => {
    console.error("Failed to log page visit:", error);
  });

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
