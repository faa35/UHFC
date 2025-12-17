"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";

export default function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "CANCELLED")
        .order("start_time");

      setBookings(data || []);
    })();
  }, [router]);

  async function cancel(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "CANCELLED" })
      .eq("id", id);

    if (error) return alert(error.message);

    setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="font-bold">My Bookings</h1>
        <LogoutButton />
      </div>

      {bookings.length === 0 && <p>No upcoming bookings.</p>}

      {bookings.map((b) => (
        <div key={b.id} className="border p-2 mb-2 flex justify-between">
          <div>
            <div>{new Date(b.start_time).toLocaleString()}</div>
            <div className="text-sm">Status: {b.status}</div>
          </div>

          <button onClick={() => cancel(b.id)} className="text-red-600">
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}
