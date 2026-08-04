import { NextResponse } from "next/server";

/**
 * Next.js Edge Proxy / Middleware for Subdomain Routing
 * Supports both Next.js 16 (`proxy`) and Next.js 15 (`middleware`) conventions.
 * Handles admin.theoutliersstudio.com (and admin.localhost for local dev)
 */
export function proxy(request) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Identify if request is targeting the admin subdomain
  const isAdminSubdomain =
    host.startsWith("admin.theoutliersstudio.com") ||
    host.startsWith("admin.localhost") ||
    host.startsWith("admin.127.0.0.1");

  if (isAdminSubdomain) {
    // 1. Root path on admin subdomain -> /dashboard
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/dashboard", request.url));
    }

    // 2. /login on admin subdomain -> /admin/login
    if (pathname === "/login") {
      return NextResponse.rewrite(new URL("/admin/login", request.url));
    }

    // 3. If path already starts with /dashboard or /admin, pass through
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.next();
    }

    // 4. Clean routes on admin subdomain (e.g. admin.theoutliersstudio.com/orders -> /dashboard/orders)
    const dashboardSubRoutes = [
      "orders",
      "products",
      "categories",
      "collections",
      "coupons",
      "reviews",
      "users",
      "warehouses",
    ];

    const firstSegment = pathname.split("/")[1];
    if (dashboardSubRoutes.includes(firstSegment)) {
      return NextResponse.rewrite(new URL(`/dashboard${pathname}`, request.url));
    }

    // Pass through for any other unhandled routes
    return NextResponse.next();
  }

  // Main storefront domain (theoutliersstudio.com or www.theoutliersstudio.com)
  if (
    host.includes("theoutliersstudio.com") &&
    !host.startsWith("admin.")
  ) {
    // Redirect direct /dashboard access on storefront domain to admin subdomain
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const subPath = pathname.replace(/^\/dashboard/, "");
      return NextResponse.redirect(
        new URL(`https://admin.theoutliersstudio.com${subPath || "/"}`, request.url)
      );
    }

    // Redirect direct /admin/login access on storefront domain to admin subdomain /login
    if (pathname === "/admin/login") {
      return NextResponse.redirect(
        new URL("https://admin.theoutliersstudio.com/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

// Backward compatibility alias for middleware
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - static & image assets (_next/static, _next/image)
     * - public files & icons (.svg, .png, .jpg, .ico, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|apple-icon.png|icon.png|icon.svg|robots.js|sitemap.js|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json)).*)",
  ],
};
