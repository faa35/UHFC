"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, isBefore } from "date-fns";
import { fetchBookingsForWeek, getWeekStart } from "@/lib/booking";
import BookingModal from "./BookingModal";
import { supabase } from "@/lib/supabaseClient";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am–12am

export default function WeekCalendar({
  onBooked,
}: {
  onBooked?: () => void;
}) {
  // ✅ Anchor everything to "today"
  const today = useMemo(() => new Date(), []);
  const todayWeekStart = useMemo(() => getWeekStart(today), [today]);

  // ✅ Allowed range: 1 week before today’s weekStart, and 2 weeks after
  const minWeekStart = useMemo(() => addDays(todayWeekStart, -7), [todayWeekStart]);
  const maxWeekStart = useMemo(() => addDays(todayWeekStart, 14), [todayWeekStart]);

  const [weekStart, setWeekStart] = useState<Date>(() => todayWeekStart);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, d) => addDays(weekStart, d)),
    [weekStart]
  );

  // ✅ If somehow weekStart goes out of range, snap it back
  useEffect(() => {
    if (weekStart < minWeekStart) setWeekStart(minWeekStart);
    if (weekStart > maxWeekStart) setWeekStart(maxWeekStart);
  }, [weekStart, minWeekStart, maxWeekStart]);

  // Fetch bookings for visible week
  useEffect(() => {
    fetchBookingsForWeek(weekStart).then(setBookings).catch(console.error);
  }, [weekStart]);

  // Realtime updates (refetch current week on any booking change)
  useEffect(() => {
    const channel = supabase
      .channel(`bookings-changes-${weekStart.toISOString()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchBookingsForWeek(weekStart).then(setBookings).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weekStart]);

  // Find booking that starts at that exact hour for that day
  function isBooked(day: Date, hour: number) {
    return bookings.find((b) => {
      const start = new Date(b.start_time);
      return (
        start.getHours() === hour &&
        start.toDateString() === day.toDateString()
      );
    });
  }

  // ✅ Build a Date for the slot and block past slots
  function getSlotDateTime(day: Date, hour: number) {
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    return slotStart;
  }

  function isSlotInPast(day: Date, hour: number) {
    const slotStart = getSlotDateTime(day, hour);
    return isBefore(slotStart, new Date()); // before "right now"
  }

  function handleClickEmptySlot(day: Date, hour: number) {
    const slotStart = getSlotDateTime(day, hour);

    // ✅ prevent selecting past slots
    if (isBefore(slotStart, new Date())) return;

    setSelectedSlot({ start: slotStart });
  }

  // Navigation limits (3-week window)
  const prevWeek = addDays(weekStart, -7);
  const nextWeek = addDays(weekStart, 7);
  const canGoPrev = prevWeek >= minWeekStart;
  const canGoNext = nextWeek <= maxWeekStart;

  return (
    <div>
      <div className="flex justify-between mb-2 items-center text-gray-600">
        <button
          onClick={() => canGoPrev && setWeekStart(prevWeek)}
          disabled={!canGoPrev}
          className={!canGoPrev ? "opacity-40 cursor-not-allowed" : ""}
        >
          ◀ Previous Week
        </button>

        {/* <h2 className="font-bold">Week of {format(weekStart, "MMM d")}</h2> */}

        <button
          onClick={() => canGoNext && setWeekStart(nextWeek)}
          disabled={!canGoNext}
          className={!canGoNext ? "opacity-40 cursor-not-allowed" : ""}
        >
          Next Week▶
        </button>
      </div>

      {/* ✅ Today shown under headline */}
      <h2 className="font-bold text-gray-600 mb-6 text-center">
      
        Today: <span className="font-medium">{format(new Date(), "EEEE, MMM d, yyyy")}</span>
      
      </h2>

      <div className="grid grid-cols-8 border-2 border-black text-gray-600">
        <div />
        {/* {days.map((day, d) => (
          <div key={d} className="text-center font-semibold border">
            {format(day, "EEE")}
          </div>
        ))} */}

        {days.map((day, d) => (
          <div
            key={d}
            className="text-center font-semibold border flex flex-col leading-tight text-gray-600"
          >
            <span>{format(day, "EEE")}</span>
            <span className="text-sm text-gray-600">
              {format(day, "d")}
            </span>
          </div>
))}


        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="border text-sm text-gray-600 p-1">{hour}:00</div>

            {days.map((day, d) => {
              const booked = isBooked(day, hour);
              const past = isSlotInPast(day, hour);

              const slotClass = booked
                ? booked.status === "CONFIRMED"
                  ? "bg-blue-300"
                  : "bg-red-300"
                : past
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-green-100";

              return (
                <div
                  key={`${hour}-${d}`}
                  className={`border h-12 ${slotClass}`}
                  onClick={() => {
                    if (!booked && !past) handleClickEmptySlot(day, hour);
                  }}
                >
                  {booked
                    ? booked.status === "CONFIRMED"
                      ? "Confirmed"
                      : "Pending"
                    : past
                    ? "Past"
                    : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onBooked={() => {
            setSelectedSlot(null);

            // local refresh (nice UX)
            fetchBookingsForWeek(weekStart)
              .then(setBookings)
              .catch(console.error);

            // 🔥 HARD REFRESH for MyBookings sync
            onBooked?.();
          }}
        />
      )}
    </div>
  );
}
