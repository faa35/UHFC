"use client";

import Link from "next/link";
import WeekCalendar from "@/components/WeekCalendar";
import TopNavItem from "@/components/TopNavItem";
import FooterSocial from "@/components/FooterSocial";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* TOP GREEN BAR */}
      <header className="bg-[#4B7D1A] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            {/* Left brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded bg-white/15 flex items-center justify-center font-bold shrink-0">
                UH
              </div>
              <div className="min-w-0">
                <div className="font-bold leading-5 truncate">UHFC</div>
                <div className="text-sm text-white/90 leading-4 truncate">
                  Sports Complex
                </div>
              </div>
            </div>

            {/* Right icon blocks (add as many as you want) */}
            <div className="flex items-stretch gap-[1px] overflow-hidden rounded">
              <TopNavItem
                href="/login"
                icon="🔑"
                label="Login"
                widthClass="w-[72px]"
              />

              <TopNavItem
                href="/signup"
                icon="📝"
                label="Sign Up"
                widthClass="w-[72px]"
              />

              <TopNavItem
                href="/my-bookings"
                icon="👤"
                label="My Bookings"
                widthClass="w-[90px]"
              />


            </div>
          </div>
        </div>
      </header>


      <section className="w-full">
        <div className="relative h-[220px] sm:h-[320px] w-full overflow-hidden">
          <img
            src="/Gemini_Generated_Image_xqwa7bxqwa7bxqwa.png"
            alt="Sports field"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">


        <h1 className="mt-4 text-[44px] leading-[1.02] font-black tracking-tight text-black">
          UHFC Sports
          <br />
          Complex
        </h1>

        <p className="mt-6 text-[18px] leading-7 text-gray-800 max-w-2xl">
          Book your turf time in seconds. View availability, reserve a slot, and
          we will call you to confirm your booking.
        </p>



        <div id="schedule" className="mt-10 pb-12 scroll-mt-24">
          <h2 className="text-xl text-gray-600 font-bold mb-3">Schedule</h2>
          <div className="border border-black rounded-lg p-3 overflow-x-auto">
            <WeekCalendar />
          </div>
        </div>
      </section>
      <FooterSocial />
    </main>
  );
}
