"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    router.push("/schedule");
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">Login</h1>

      <form onSubmit={onLogin} className="space-y-3">
        <input className="border w-full p-2" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border w-full p-2" placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="bg-black text-white px-3 py-2 w-full">Login</button>
      </form>

      <p className="mt-4 text-sm">
        No account? <Link className="underline" href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
