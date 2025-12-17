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

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return alert(error.message);

    // create profile row (role defaults to 'user' in SQL)
    const userId = data.user?.id;
    if (userId) {
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        phone,
      });
      if (profileErr) return alert(profileErr.message);
    }

    alert("Signed up! You can now login.");
    router.push("/login");
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={onSignup} className="space-y-3">
        <input className="border w-full p-2" placeholder="Full name"
          value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className="border w-full p-2" placeholder="Phone"
          value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="border w-full p-2" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border w-full p-2" placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="bg-black text-white px-3 py-2 w-full">Create account</button>
      </form>
    </main>
  );
}
