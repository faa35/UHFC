"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();

    // replace history so back button won't return to protected pages
    router.replace("/"); // redirect to home page

    // ensure cached pages re-check auth
    router.refresh();
  }

  return (
    <button className="border px-3 py-1" onClick={logout}>
      Logout
    </button>
  );
}
