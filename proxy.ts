import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


const protectedPrefixes = ["/dashboard", "/pulse", "/studyhub"];
const authPages = new Set(["/login", "/register"]);


export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionMarker = request.cookies.get("koru_session")?.value === "active";

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !sessionMarker) {
    const loginURL = new URL("/login", request.url);
    loginURL.searchParams.set("next", pathname);
    return NextResponse.redirect(loginURL);
  }

  if (authPages.has(pathname) && sessionMarker) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/dashboard/:path*", "/pulse/:path*", "/studyhub/:path*", "/login", "/register"],
};
