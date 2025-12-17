import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // In some Next server contexts cookies are readonly-typed,
              // but set() works where it’s allowed (route handlers/server actions/middleware).
              // If TS still complains, add @ts-expect-error on the next line.
              cookieStore.set(name, value, options);
            });
          } catch {
            // In Server Components, setting cookies can fail; middleware handles refresh.
          }
        },
      },
    }
  );
}
