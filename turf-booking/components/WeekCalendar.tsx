"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { fetchBookingsForWeek, getWeekStart } from "@/lib/booking";
import BookingModal from "./BookingModal";
import { supabase } from "@/lib/supabaseClient";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am–12am

export default function WeekCalendar({
  onBooked,
}: {
  onBooked?: () => void;
}) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // Build days array once per weekStart (small perf + cleaner)
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, d) => addDays(weekStart, d)),
    [weekStart]
  );

  // 1) Initial fetch + whenever weekStart changes
  useEffect(() => {
    fetchBookingsForWeek(weekStart).then(setBookings).catch(console.error);
  }, [weekStart]);

  // 2) Realtime updates (refetch current week on any booking change)
  useEffect(() => {
    const channel = supabase
      .channel(`bookings-changes-${weekStart.toISOString()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchBookingsForWeek(weekStart)
            .then(setBookings)
            .catch(console.error);
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

  function handleClickEmptySlot(day: Date, hour: number) {
    const slotStart = new Date(day); // copy (don’t mutate day)
    slotStart.setHours(hour, 0, 0, 0);
    setSelectedSlot({ start: slotStart });
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))}>
          ◀ Prev
        </button>
        <h2 className="font-bold">Week of {format(weekStart, "MMM d")}</h2>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))}>
          Next ▶
        </button>
      </div>

      <div className="grid grid-cols-8 border">
        <div />
        {days.map((day, d) => (
          <div key={d} className="text-center font-semibold border">
            {format(day, "EEE")}
          </div>
        ))}

        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="border text-sm p-1">{hour}:00</div>

            {days.map((day, d) => {
              const booked = isBooked(day, hour);

              const slotClass = booked
                ? booked.status === "CONFIRMED"
                  ? "bg-blue-300"
                  : "bg-red-300" // PENDING_CALL or anything else
                : "hover:bg-green-100";

              return (
                <div
                  key={`${hour}-${d}`}
                  className={`border h-12 cursor-pointer ${slotClass}`}
                  onClick={() => {
                    if (!booked) handleClickEmptySlot(day, hour);
                  }}
                >
                  {booked
                    ? booked.status === "CONFIRMED"
                      ? "Confirmed"
                      : "Pending"
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
