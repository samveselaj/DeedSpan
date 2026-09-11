import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "deedspan_sid";

const PROTECTED_PREFIXES = ["/dashboard", "/tasks", "/goals", "/habits", "/reflect", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requiresAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!requiresAuth) return NextResponse.next();

  const sid = req.cookies.get(SESSION_COOKIE)?.value;
  if (sid) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
