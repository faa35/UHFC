import Link from "next/link";
import WeekCalendar from "@/components/WeekCalendar";


export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Turf Booking</h1>
      <p>View the schedule publicly. Book a slot after login.</p>

      <div className="flex gap-3">
        {/* <Link className="border px-3 py-2" href="/schedule">View Schedule</Link> */}
        <Link className="border px-3 py-2" href="/login">Login</Link>
        <Link className="border px-3 py-2" href="/signup">Sign Up</Link>
        <Link className="border px-3 py-2" href="/my-bookings">My Bookings</Link>
        {/* <Link className="border px-3 py-2" href="/admin/bookings">Admin</Link> */}
        
      </div>

      <div>
        <WeekCalendar />
      </div>


    </main>
  );
}

