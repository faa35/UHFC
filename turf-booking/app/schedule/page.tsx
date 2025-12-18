import WeekCalendar from "@/components/WeekCalendar";
import LogoutButton from "@/components/LogoutButton";

export default function SchedulePage() {
  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Turf Schedule</h1>
        <LogoutButton />
      </div>

      <WeekCalendar />
    </main>
  );
}
