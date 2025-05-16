import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ar"];

export function middleware(request: NextRequest) {
  const localeCookie = request.cookies.get("locale");
  let locale = localeCookie?.value || "en";

  if (!locales.includes(locale)) {
    locale = "en";
  }

  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
