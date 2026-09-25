import type { SupabaseClient } from "@supabase/supabase-js";

export type CompanionArea = {
  id: string;
  province: string;
  district: string;
};

export type AvailabilityRow = {
  companion_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;

  return user;
}

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, full_name, phone, avatar_url")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
}

export async function getCompanionApplication(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("companion_profiles")
    .select("verification_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getAreas(
  supabase: SupabaseClient,
): Promise<CompanionArea[]> {
  const { data, error } = await supabase
    .from("areas")
    .select("id, province, district")
    .order("province")
    .order("district");

  if (error) throw error;

  return data ?? [];
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);

  return data.publicUrl;
}

export async function uploadIdDocument(
  supabase: SupabaseClient,
  userId: string,
  file: File,
) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "pdf";

  const path = `${userId}/identity-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("id-documents")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  return path;
}

export async function updateCompanionProfileBase(
  supabase: SupabaseClient,
  userId: string,
  data: {
    fullName: string;
    phone: string;
    avatarUrl: string | null;
  },
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      phone: data.phone,
      avatar_url: data.avatarUrl,
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function createCompanionProfile(
  supabase: SupabaseClient,
  data: {
    userId: string;
    bio: string;
    experience: string | null;
    documentPath: string;
  },
) {
  const { error } = await supabase.from("companion_profiles").insert({
    user_id: data.userId,
    bio: data.bio,
    experience: data.experience,
    verification_status: "pending",
    id_doc_path: data.documentPath,
  });

  if (error) throw error;
}

export async function saveServiceAreas(
  supabase: SupabaseClient,
  userId: string,
  areaIds: string[],
) {
  const rows = areaIds.map((areaId) => ({
    companion_id: userId,
    area_id: areaId,
  }));

  const { error } = await supabase.from("companion_service_areas").insert(rows);

  if (error) throw error;
}

export async function saveAvailability(
  supabase: SupabaseClient,
  rows: AvailabilityRow[],
) {
  const { error } = await supabase.from("companion_availability").insert(rows);

  if (error) throw error;
}
