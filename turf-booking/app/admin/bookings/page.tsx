"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  async function load() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .neq("status", "CANCELLED")
      .order("start_time");

    if (error) return alert(error.message);

    // PENDING_CALL first
    const sorted = (data || []).sort((a, b) => {
      const aPending = a.status === "PENDING_CALL" ? 0 : 1;
      const bPending = b.status === "PENDING_CALL" ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });

    setBookings(sorted);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return alert(error.message);
    load();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="font-bold">Admin – Bookings</h1>
        <LogoutButton />
      </div>

      {bookings.map((b) => (
        <div key={b.id} className="border p-2 mb-2 flex justify-between">
          <div>
            <div>{new Date(b.start_time).toLocaleString()}</div>
            <div className="text-sm">Status: {b.status}</div>
          </div>

          <div className="flex gap-2">
            <button
              className="border px-2"
              onClick={() => updateStatus(b.id, "CONFIRMED")}
            >
              Confirm
            </button>
            <button
              className="border px-2 text-red-600"
              onClick={() => updateStatus(b.id, "CANCELLED")}
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
