"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      className="border px-3 py-2"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/login");
      }}
    >
      Logout
    </button>
  );
}
