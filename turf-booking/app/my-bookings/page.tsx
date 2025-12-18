"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";
import WeekCalendar from "@/components/WeekCalendar";

export default function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Load bookings
  async function loadBookings(uid: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", uid)
      .neq("status", "CANCELLED")
      .order("start_time");

    if (error) {
      console.error(error);
      return;
    }

    setBookings(data || []);
  }

  // Auth + initial load + realtime sync
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        router.replace("/login");
        router.refresh();
        return;
      }

      if (!cancelled) {
        setUserId(user.id);
        loadBookings(user.id);
      }
    }

    init();

    // 🔁 Realtime: keep My Bookings + Schedule in sync
    const channel = supabase
      .channel("my-bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          if (userId) loadBookings(userId);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [router, userId]);

  // Cancel booking
async function cancel(id: string) {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "CANCELLED" })
    .eq("id", id);

  if (error) return alert(error.message);

  // Hard refresh so WeekCalendar definitely refetches and updates
  window.location.reload();
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

          <button
            onClick={() => cancel(b.id)}
            className="text-red-600"
          >
            Cancel
          </button>
        </div>
      ))}

      <div className="mt-6">
        <p className="font-bold">Make a new booking:</p>
      </div>

      <div>
        <h2 className="font-bold mt-6 mb-2">Schedule</h2>
        <WeekCalendar onBooked={() => window.location.reload()} />

      </div>
    </div>
  );
}
