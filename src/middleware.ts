import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface UserToken {
  role?: string;
}

const decodeJWT = (token: string): UserToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload;
  } catch (error) {
    console.error("❌ JWT Decode Error:", error);
    return null;
  }
};

// const roleBasedRoutes: Record<string, string[]> = {
//   "/admin": ["admin"],
//   "/": ["user","admin"],
//   "/user": ["user", "admin"],
// };

export async function middleware(req: NextRequest) {
  console.log("🌐 Middleware Triggered:", req.nextUrl.pathname);

  const token = req.cookies.get("accessToken")?.value;
  console.log("🔍 Retrieved Token:", token ? "Token Found" : "No Token Found");

  let userRole = null;
  if (token) {
    const decodedToken = decodeJWT(token);
    userRole = decodedToken?.role;
    console.log("✅ Decoded Token:", decodedToken);
  }

  // If no user role and accessing root, redirect to login
  if (!userRole && req.nextUrl.pathname === "/") {
    console.log("⛔ No User Role - Redirecting to Login");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Auto-redirect authenticated users from root to their role-based dashboard
  if (userRole && req.nextUrl.pathname === "/") {
    console.log(
      `🔀 User Role Found (${userRole}) - Redirecting to /${userRole}/dashboard`
    );
    return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
  }

  // Admin users bypass all checks
  if (userRole === "admin") {
    return NextResponse.next();
  }

  // From here on, only userRole === "user"
  const path = req.nextUrl.pathname;

  // Redirect user from admin paths to corresponding user paths
  if (path.startsWith("/admin/notice-types")) {
    console.log("🔄 Redirecting user from admin notice-types to user notice-types");
    return NextResponse.redirect(new URL(path.replace("/admin", "/user"), req.url));
  }
  if (path.startsWith("/admin/settings")) {
    console.log("🔄 Redirecting user from admin settings to user settings");
    return NextResponse.redirect(new URL(path.replace("/admin", "/user"), req.url));
  }
  if (path.startsWith("/admin/dashboard")) {
    console.log("🔄 Redirecting user from admin dashboard to user dashboard");
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  // Allowed user-specific routes
  const allowedUserRoutes = [
    "/user/dashboard",
    "/user/notice-types",
    "/user/settings",
  ];
  if (allowedUserRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // All other attempts by user are unauthorized
  console.log(`⛔ User role cannot access ${path} - Redirecting to unauthorized`);
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/user/:path*",
    "/admin/notice-types/:path*",
    "/user/notice-types/:path*",
    "/user/settings/:path*",
    "/admin/settings/:path*",
    "/dashboard/:path*",
  ],
};