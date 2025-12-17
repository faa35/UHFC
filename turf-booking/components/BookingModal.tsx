"use client";

import { supabase } from "@/lib/supabaseClient";
import { addHours, format } from "date-fns";
import { useRouter } from "next/navigation";

export default function BookingModal({ slot, onClose, onBooked }: any) {
  const router = useRouter();

  async function book() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const start = slot.start;
    const end = addHours(start, 1);

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "PENDING_CALL"
    });

    if (error) {
      alert("Slot already taken");
    } else {
      alert("Booked! We will call you within 15 minutes.");
      onBooked();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <p>
          Book slot:{" "}
          <strong>{format(slot.start, "EEE MMM d, HH:mm")}</strong>
        </p>

        <div className="mt-4 flex gap-2">
          <button onClick={book} className="bg-green-600 text-white px-3 py-1">
            Confirm
          </button>
          <button onClick={onClose} className="border px-3 py-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
