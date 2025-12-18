"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

type Profile = {
  full_name: string | null;
  phone: string | null;
};

type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: "PENDING_CALL" | "CONFIRMED" | "CANCELLED" | string;
  user_id: string;
  profiles: Profile | null; // <-- IMPORTANT: object (or null), NOT array
};

function displayName(p: Profile | null): string {
  if (!p) return "Unknown user";
  return p.full_name?.trim() ? p.full_name : "No name";
}

function displayPhone(p: Profile | null): string {
  if (!p) return "No phone";
  return p.phone?.trim() ? p.phone : "No phone";
}

export default function AdminBookings() {
  const [pending, setPending] = useState<Booking[]>([]);
  const [confirmed, setConfirmed] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        start_time,
        end_time,
        status,
        user_id,
        profiles:profiles!bookings_user_id_profiles_fkey ( full_name, phone )
      `
      )
      .neq("status", "CANCELLED")
      .order("start_time", { ascending: true });

    setLoading(false);

    if (error) {
      console.error("Load bookings error:", error);
      alert(error.message);
      return;
    }

    // Optional debug
    // console.log("First row:", data?.[0]);

    const all = (data ?? []) as unknown as Booking[];
    setPending(all.filter((b) => b.status === "PENDING_CALL"));
    setConfirmed(all.filter((b) => b.status === "CONFIRMED"));
  }

  useEffect(() => {
    load();

    // realtime so when schedule updates, admin list updates too
    const channel = supabase
      .channel("admin-bookings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Update status error:", error);
      alert(error.message);
      return;
    }

    console.log("Updated booking:", data);
    load();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="font-bold text-xl">Admin Dashboard</h1>
          {loading && <p className="text-sm">Loading…</p>}
        </div>
        <LogoutButton />
      </div>

      <div className="mb-8">
        <h2 className="font-bold text-lg mb-2">
          Pending Calls ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <p className="text-sm">No pending bookings 🎉</p>
        ) : (
          pending.map((b) => {
            const p = b.profiles; // <-- fixed
            return (
              <div
                key={b.id}
                className="border p-3 mb-2 bg-red-50 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">
                    {new Date(b.start_time).toLocaleString()}
                  </div>

                  <div className="text-sm">
                    Booked by:{" "}
                    <span className="font-medium">{displayName(p)}</span>{" "}
                    <span className="text-gray-600">({displayPhone(p)})</span>
                  </div>

                  <div className="text-sm">Status: {b.status}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="border px-3 py-1 bg-white"
                    onClick={() => updateStatus(b.id, "CONFIRMED")}
                  >
                    Confirm
                  </button>
                  <button
                    className="border px-3 py-1 text-red-600 bg-white"
                    onClick={() => updateStatus(b.id, "CANCELLED")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div>
        <h2 className="font-bold text-lg mb-2">
          Confirmed Bookings ({confirmed.length})
        </h2>

        {confirmed.length === 0 ? (
          <p className="text-sm">No confirmed bookings yet.</p>
        ) : (
          confirmed.map((b) => {
            const p = b.profiles; // <-- fixed
            return (
              <div
                key={b.id}
                className="border p-3 mb-2 bg-blue-50 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">
                    {new Date(b.start_time).toLocaleString()}
                  </div>

                  <div className="text-sm">
                    Booked by:{" "}
                    <span className="font-medium">{displayName(p)}</span>{" "}
                    <span className="text-gray-600">({displayPhone(p)})</span>
                  </div>

                  <div className="text-sm">Status: {b.status}</div>
                </div>

                <button
                  className="border px-3 py-1 text-red-600 bg-white"
                  onClick={() => updateStatus(b.id, "CANCELLED")}
                >
                  Cancel
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
