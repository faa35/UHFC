"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopNavItem from "@/components/TopNavItem";
import FooterSocial from "@/components/FooterSocial";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      router.push("/schedule");
      return;
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr) {
      router.push("/schedule");
      return;
    }

    if ((profile?.role || "").toLowerCase() === "admin") {
      router.push("/admin/bookings");
    } else {
      router.push("/my-bookings");
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* TOP GREEN BAR */}
      <header className="bg-[#4B7D1A] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            {/* Left brand */}
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded bg-white/15 flex items-center justify-center font-bold shrink-0">
                UH
              </div>
              <div className="min-w-0">
                <div className="font-bold leading-5 truncate">UHFC</div>
                <div className="text-sm text-white/90 leading-4 truncate">
                  Sports Complex
                </div>
              </div>
            </Link>

            {/* Right icon blocks */}
            <div className="flex items-stretch gap-[1px] overflow-hidden rounded">
              <TopNavItem href="/login" icon="🔑" label="Login" variant="yellow" />
              <TopNavItem href="/signup" icon="📝" label="Sign Up" />
              <TopNavItem
                href="/my-bookings"
                icon="👤"
                label="My Bookings"
                widthClass="w-[90px]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* HERO IMAGE + OVERLAY LOGIN CARD */}
      <section className="relative w-full">
        {/* Image */}
        <div className="relative h-[260px] sm:h-[420px] w-full overflow-hidden">
          <img
            src="/Gemini_Generated_Image_xqwa7bxqwa7bxqwa.png"
            alt="Sports field"
            className="h-full w-full object-cover"
          />
          {/* Slight dark overlay so white card looks nice */}
          <div className="absolute inset-0 bg-black/15" />
        </div>

        {/* CARD OVER PHOTO (ABSOLUTE) */}
        <div className="absolute inset-x-0 top-[160px] sm:top-[250px]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-lg border border-black bg-white p-5 sm:p-6 shadow-2xl">
                <p className="mb-4 text-sm text-gray-700">
                  To book a slot or view your bookings, please log in.
                </p>

                <h1 className="text-xl font-bold mb-4 text-black">Login</h1>

                <form onSubmit={onLogin} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
                      Email
                    </label>
                    <input
                      className="border border-black w-full p-2 rounded text-black placeholder-gray-400"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
                      Password
                    </label>
                    <input
                      className="border border-black w-full p-2 rounded text-black placeholder-gray-400"
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button className="bg-black text-white px-3 py-2 w-full rounded font-semibold">
                    Login
                  </button>
                </form>

                <p className="mt-4 text-sm text-black ">
                  No account?{" "}
                  <Link className="underline font-semibold" href="/signup">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer so the absolute card doesn't overlap next content */}
      <div className="h-[220px] sm:h-[240px]" />
      <FooterSocial />
    </main>
  );
}
