import { addDays, startOfWeek } from "date-fns";
import { supabase } from "./supabaseClient";

export function getWeekStart(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export async function fetchBookingsForWeek(weekStart: Date) {
  const weekEnd = addDays(weekStart, 7);

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .gte("start_time", weekStart.toISOString())
    .lt("start_time", weekEnd.toISOString())
    .neq("status", "CANCELLED");

  if (error) throw error;
  return data;
}
