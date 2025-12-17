"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { fetchBookingsForWeek, getWeekStart } from "@/lib/booking";
import BookingModal from "./BookingModal";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am–12am

export default function WeekCalendar() {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    fetchBookingsForWeek(weekStart).then(setBookings);
  }, [weekStart]);

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
    const slotStart = new Date(day); // copy, don’t mutate original
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
        {[...Array(7)].map((_, d) => (
          <div key={d} className="text-center font-semibold border">
            {format(addDays(weekStart, d), "EEE")}
          </div>
        ))}

        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="border text-sm p-1">{hour}:00</div>

            {[...Array(7)].map((_, d) => {
              const day = addDays(weekStart, d);
              const booked = isBooked(day, hour);

              return (
                <div
                  key={`${hour}-${d}`}
                  className={`border h-12 cursor-pointer ${
                    booked ? "bg-red-300" : "hover:bg-green-100"
                  }`}
                  onClick={() => {
                    if (!booked) handleClickEmptySlot(day, hour);
                  }}
                >
                  {booked ? "Booked" : ""}
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
            fetchBookingsForWeek(weekStart).then(setBookings);
          }}
        />
      )}
    </div>
  );
}
