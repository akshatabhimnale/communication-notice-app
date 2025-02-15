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

const roleBasedRoutes: Record<string, string[]> = {
  "/": ["admin"],
  "/user": ["user", "admin"],
};

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

  if (!userRole && req.nextUrl.pathname === "/") {
    console.log("⛔ No User Role - Redirecting to Login");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (userRole) {
    console.log(
      `🔀 User Role Found (${userRole}) - Redirecting to /${userRole}/`
    );
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL(`/${userRole}/`, req.url));
    }
  }

  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (
      req.nextUrl.pathname.startsWith(route) &&
      (!userRole || !allowedRoles.includes(userRole))
    ) {
      console.log(
        `⛔ Unauthorized Access Attempt: ${req.nextUrl.pathname} - Redirecting`
      );
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  console.log("✅ Access Granted - Proceeding with Request");
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/user/:path*"],
};
