import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Checks whether a request has passed its scheduled start date and time.
 * @param serviceDate - format 'YYYY-MM-DD'
 * @param startTime - format 'HH:MM' or 'HH:MM:SS'
 */
export function isRequestExpired(
  serviceDate: string | null | undefined,
  startTime: string | null | undefined,
): boolean {
  if (!serviceDate || !startTime) return false;

  const dateParts = serviceDate.split("-").map(Number);
  const timeParts = startTime.split(":").map(Number);

  if (dateParts.length < 3 || timeParts.length < 2) return false;

  const [year, month, day] = dateParts;
  const [hours, minutes] = timeParts;

  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    isNaN(hours) ||
    isNaN(minutes)
  ) {
    return false;
  }

  const requestDateTime = new Date(year, month - 1, day, hours, minutes, 0);
  const now = new Date();

  return now.getTime() >= requestDateTime.getTime();
}

/**
 * Checks pending requests and syncs any that are past start time to 'expired' in DB and memory.
 */
export async function syncExpiredRequests(
  supabase: SupabaseClient,
  requests: {
    id: string;
    status: string;
    service_date?: string | null;
    start_time?: string | null;
    serviceDate?: string | null;
    startTime?: string | null;
  }[],
): Promise<string[]> {
  const expiredIds: string[] = [];

  for (const r of requests) {
    const sDate = r.service_date ?? r.serviceDate;
    const sTime = r.start_time ?? r.startTime;

    if (r.status === "pending" && isRequestExpired(sDate, sTime)) {
      expiredIds.push(r.id);
      r.status = "expired";
    }
  }

  if (expiredIds.length > 0) {
    try {
      const { data, error, count } = await supabase
        .from("service_requests")
        .update({ status: "expired" })
        .in("id", expiredIds)
        .eq("status", "pending")
        .select("id");
      console.log("Update expired requests in DB result:", { data, error, count });
    } catch (err) {
      console.error("Failed to update expired requests in database:", err);
    }
  }

  return expiredIds;
}
