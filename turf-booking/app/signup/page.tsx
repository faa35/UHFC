"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopNavItem from "@/components/TopNavItem";
import FooterSocial from "@/components/FooterSocial";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();

    // ✅ ENFORCE PHONE NUMBER
    if (!phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: phone.trim(),
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName || null,
        phone: phone.trim(),
      });

      if (profileErr) {
        alert(profileErr.message);
        return;
      }
    }

    alert("Signed up! You can now login.");
    router.push("/login");
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
              <TopNavItem href="/login" icon="🔑" label="Login" />
              <TopNavItem
                href="/signup"
                icon="📝"
                label="Sign Up"
                variant="yellow"
              />
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

      {/* HERO IMAGE + OVERLAY SIGNUP CARD */}
      <section className="relative w-full">
        {/* Image */}
        <div className="relative h-[260px] sm:h-[420px] w-full overflow-hidden">
          <img
            src="/Gemini_Generated_Image_xqwa7bxqwa7bxqwa.png"
            alt="Sports field"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        {/* CARD OVER PHOTO */}
        <div className="absolute inset-x-0 top-[140px] sm:top-[235px]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-lg border border-black bg-white p-5 sm:p-6 shadow-2xl">
                <p className="mb-4 text-sm text-gray-700">
                  Create an account to book a slot and we will call you to confirm.
                </p>

                <h1 className="text-xl font-bold mb-4 text-black">Sign Up</h1>

                <form onSubmit={onSignup} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
                      Full name
                    </label>
                    <input
                      className="border border-black w-full p-2 rounded text-black placeholder-gray-400"
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
                      Phone
                    </label>
                    <input
                      className="border border-black w-full p-2 rounded text-black placeholder-gray-400"
                      placeholder="Phone (required)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setPhoneFocused(true)}
                      onBlur={() => setPhoneFocused(false)}
                      required
                    />

                    {(phoneFocused || phone.length > 0) && (
                      <p className="mt-2 text-sm text-gray-700">
                        We will call you on this number to confirm your booking.
                        <span className="text-gray-500"> (on WhatsApp)</span>
                      </p>
                    )}
                  </div>

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
                    <label className="block text-sm text-gray-600 font-semibold text-black mb-1">
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
                    Create account
                  </button>
                </form>

                <p className="mt-4 text-sm text-black">
                  Already have an account?{" "}
                  <Link className="underline font-semibold" href="/login">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer so the absolute card doesn't overlap next content */}
      <div className="h-[260px] sm:h-[260px]" />
      <FooterSocial />
    </main>
    
  );
}
