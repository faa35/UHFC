// E:\UHFC\UHFC\turf-booking\app\my-bookings\page.tsx
"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";
import WeekCalendar from "@/components/WeekCalendar";
import TopNavItem from "@/components/TopNavItem";
import FooterSocial from "@/components/FooterSocial";


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
    <main className="min-h-screen bg-white">

      <header className="sticky top-0 z-20 bg-[#5b7f1f] text-white">
        <div className="mx-auto max-w-6xl flex items-stretch">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded bg-white/15 flex items-center justify-center font-extrabold">
              UH
            </div>
            <div className="leading-tight">
              <div className="font-extrabold">UHFC</div>
              <div className="text-sm opacity-90">Sports Complex</div>
            </div>
          </div>

          {/* Nav items */}
          <div className="ml-auto flex">



              <TopNavItem
                href="/my-bookings"
                icon="👤"
                label="My Bookings"
                variant="yellow"
                widthClass="w-[90px]"
              />            

            <LogoutButton />


          </div>
        </div>
      </header>


      {/* Page Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Big page heading like Home experience */}
        <div className="rounded-xl border border-black bg-white p-6">
          <h1 className="text-3xl text-gray-600 sm:text-4xl font-extrabold tracking-tight">
            My Bookings
          </h1>
          <p className="mt-2 text-gray-700 max-w-2xl">
            View your upcoming bookings. You can cancel anytime. To make a new
            booking, scroll to the schedule below.
          </p>

          {/* My bookings list */}
          <div className="mt-6">
            {bookings.length === 0 ? (
              <p className="text-sm text-gray-700">No upcoming bookings.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="border border-black p-3 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-gray-600">
                        {new Date(b.start_time).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Status: <span className="font-medium">{b.status}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => cancel(b.id)}
                      className="border border-black px-4 py-2 rounded bg-white hover:bg-gray-50 text-red-600 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA text like Home */}
          <div className="mt-8">
            <p className="font-bold text-gray-600">Make a new booking below:</p>
            <p className="text-sm text-gray-600">
              Tap a green slot to request a booking. We will call you to confirm.
            </p>
          </div>
        </div>

        {/* Schedule section (same “Home” feeling: clean box + spacing) */}
        <section className="mt-8">
          <h2 className="text-xl text-gray-600 font-extrabold mb-3">Schedule</h2>

          <div className="rounded-xl border border-black bg-white p-4">
            <WeekCalendar onBooked={() => window.location.reload()} />
          </div>
        </section>
      </div>
      <FooterSocial />
    </main>
  );
}
