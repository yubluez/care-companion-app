import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMyPhone(supabase: SupabaseClient): Promise<string> {
  try {
    const { data, error } = await supabase.rpc("get_my_phone");
    if (!error && data !== null && data !== undefined) {
      return data;
    }
  } catch {
    // RPC not available
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return "";

    const { data } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();

    return data?.phone ?? "";
  } catch {
    return "";
  }
}

/** Returns null when the caller is not a participant or job is not active. */
export async function getRequestContact(
  supabase: SupabaseClient,
  requestId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("get_request_contact", {
      p_request_id: requestId,
    });
    if (!error && data !== undefined) {
      return data ?? null;
    }
  } catch {
    // RPC not available
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: request } = await supabase
      .from("service_requests")
      .select(`
        customer_id,
        companion_id,
        status,
        customer:profiles!service_requests_customer_id_fkey(phone),
        companion:profiles!service_requests_companion_id_fkey(phone)
      `)
      .eq("id", requestId)
      .maybeSingle();

    if (!request) return null;

    if (user.id === request.customer_id) {
      const comp = Array.isArray(request.companion)
        ? request.companion[0]
        : request.companion;
      return comp?.phone ?? null;
    }

    if (user.id === request.companion_id) {
      const cust = Array.isArray(request.customer)
        ? request.customer[0]
        : request.customer;
      return cust?.phone ?? null;
    }

    return null;
  } catch {
    return null;
  }
}
