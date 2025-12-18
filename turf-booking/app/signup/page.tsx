"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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
    <main className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={onSignup} className="space-y-3">
        <input
          className="border w-full p-2"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        {/* Phone input */}
        <input
          className="border w-full p-2"
          placeholder="Phone (required)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onFocus={() => setPhoneFocused(true)}
          onBlur={() => setPhoneFocused(false)}
          required
        />

        {/* 👇 Helper text (only when focused or typing) */}
        {(phoneFocused || phone.length > 0) && (
          <p className="text-sm text-gray-600">
            We will call you on this number to confirm your booking. (on Whatsapp)
          </p>
        )}

        <input
          className="border w-full p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <input
          className="border w-full p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-black text-white px-3 py-2 w-full">
          Create account
        </button>
      </form>
    </main>
  );
}
