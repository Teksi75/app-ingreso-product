import { NextResponse, type NextRequest } from "next/server";

const progressCookieName = "teksi75_progress";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const requestedCode = request.nextUrl.searchParams.get("code") ?? request.nextUrl.searchParams.get("student");
  const cookieCode = request.cookies.get(progressCookieName)?.value;
  const progressCode = normalizeProgressCode(requestedCode) ?? normalizeProgressCode(cookieCode) ?? createProgressCode();

  if (progressCode !== cookieCode) {
    response.cookies.set(progressCookieName, progressCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 400,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
};

function createProgressCode(): string {
  const randomValue = crypto.randomUUID().replaceAll("-", "").slice(0, 10);
  return `stu_${randomValue}`;
}

function normalizeProgressCode(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9_-]{4,64}$/.test(normalized) ? normalized : null;
}
