import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // This is the response Supabase will attach cookies to
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";

      const redirectRes = NextResponse.redirect(url);
      res.cookies.getAll().forEach(({ name, value, ...rest }) => {
        redirectRes.cookies.set(name, value, rest);
      });
      return redirectRes;
    }

    // Check role
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile?.role || "").toLowerCase().trim();

    // If profile missing / RLS error / not admin -> redirect to schedule (WITH cookies)
    if (error || role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/schedule";

      const redirectRes = NextResponse.redirect(url);
      res.cookies.getAll().forEach(({ name, value, ...rest }) => {
        redirectRes.cookies.set(name, value, rest);
      });
      return redirectRes;
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
