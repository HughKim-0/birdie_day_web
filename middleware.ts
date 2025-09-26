// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/app/:path*"], // 기존 그대로
};

export async function middleware(req: any) {
    
  const url = new URL(req.url);
  const { pathname } = url;

  // ✅ book 경로는 공개
  if (pathname.startsWith("/app/book")) {
    return NextResponse.next();
  }

  // ⬇️ 이하 기존 보호 로직 유지
  const res = NextResponse.next();
   res.headers.set("x-mw-hit", "yes"); 
  const supabase = createMiddlewareClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    url.pathname = "/auth/sign-in";
    url.searchParams.set("next", pathname + url.search); // 로그인 후 복귀용
    return NextResponse.redirect(url);
  }

  return res;
}
