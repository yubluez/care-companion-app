"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  createCompanionProfile,
  getAreas,
  getCompanionApplication,
  getCurrentUser,
  getProfile,
  saveAvailability,
  saveServiceAreas,
  updateCompanionProfileBase,
  uploadAvatar,
  uploadIdDocument,
  type CompanionArea,
} from "@/lib/companion/onboarding";

import {
  DAYS,
  type Availability,
} from "@/components/onboarding/companion/AvailabilitySection";

const INITIAL_AVAILABILITY: Record<number, Availability> = {
  1: { enabled: false, startTime: "09:00", endTime: "18:00" },
  2: { enabled: false, startTime: "09:00", endTime: "18:00" },
  3: { enabled: false, startTime: "09:00", endTime: "18:00" },
  4: { enabled: false, startTime: "09:00", endTime: "18:00" },
  5: { enabled: false, startTime: "09:00", endTime: "18:00" },
  6: { enabled: false, startTime: "09:00", endTime: "18:00" },
  7: { enabled: false, startTime: "09:00", endTime: "18:00" },
};

export function useCompanionOnboarding() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");

  const [areas, setAreas] = useState<CompanionArea[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const [availability, setAvailability] =
    useState<Record<number, Availability>>(INITIAL_AVAILABILITY);

  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser(supabase);

        if (!user) {
          router.replace("/login");
          return;
        }

        setUserId(user.id);
        setEmail(user.email || "");

        const profile = await getProfile(supabase, user.id);

        if (profile.role !== "companion") {
          if (profile.role === "customer") {
            router.replace("/customer");
          } else {
            router.replace("/onboarding/role");
          }

          return;
        }

        setFullName(
          profile.full_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "",
        );

        setPhone(profile.phone || "");

        const currentAvatar =
          profile.avatar_url ||
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          "";

        setAvatarUrl(currentAvatar);
        setAvatarPreview(currentAvatar);

        const application = await getCompanionApplication(supabase, user.id);

        if (application) {
          if (application.verification_status === "approved") {
            router.replace("/companion");
          } else {
            router.replace("/onboarding/companion/status");
          }
          return;
        }

        const areaData = await getAreas(supabase);
        setAreas(areaData);
      } catch (err) {
        console.error("Load companion onboarding error:", err);

        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  // รูป Profile
  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB");
      return;
    }

    setError("");
    setAvatarFile(file);

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
  }

  // เอกสารยืนยันตัวตน
  function handleDocumentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setError("เอกสารต้องเป็นไฟล์ JPG, PNG หรือ PDF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("เอกสารต้องมีขนาดไม่เกิน 10 MB");
      return;
    }

    setError("");
    setDocumentFile(file);
  }

  // พื้นที่
  function toggleArea(areaId: string) {
    setSelectedAreas((current) =>
      current.includes(areaId)
        ? current.filter((id) => id !== areaId)
        : [...current, areaId],
    );
  }

  // วัน/เวลา
  function updateAvailability(day: number, changes: Partial<Availability>) {
    setAvailability((current) => ({
      ...current,

      [day]: {
        ...current[day],
        ...changes,
      },
    }));
  }

  // Submit
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    if (!/^0\d{9}$/.test(trimmedPhone)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง 10 หลัก");
      return;
    }

    if (!trimmedBio) {
      setError("กรุณากรอกข้อมูลแนะนำตัว");
      return;
    }

    if (selectedAreas.length === 0) {
      setError("กรุณาเลือกพื้นที่ให้บริการอย่างน้อย 1 พื้นที่");
      return;
    }

    const selectedAvailability = DAYS.filter(
      (day) => availability[day.value].enabled,
    );

    if (selectedAvailability.length === 0) {
      setError("กรุณาเลือกวันให้บริการอย่างน้อย 1 วัน");
      return;
    }

    for (const day of selectedAvailability) {
      const time = availability[day.value];

      if (time.startTime >= time.endTime) {
        setError(`เวลาเริ่มต้นของวัน${day.label}ต้องน้อยกว่าเวลาสิ้นสุด`);
        return;
      }
    }

    if (!documentFile) {
      setError("กรุณาอัปโหลดเอกสารยืนยันตัวตน");
      return;
    }

    try {
      setSubmitting(true);

      const user = await getCurrentUser(supabase);

      if (!user || user.id !== userId) {
        setError("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      // Avatar
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(supabase, user.id, avatarFile);
      }

      // ID document
      const documentPath = await uploadIdDocument(
        supabase,
        user.id,
        documentFile,
      );

      // profiles
      await updateCompanionProfileBase(supabase, user.id, {
        fullName: trimmedName,
        phone: trimmedPhone,
        avatarUrl: finalAvatarUrl || null,
      });

      // companion_profiles
      await createCompanionProfile(supabase, {
        userId: user.id,
        bio: trimmedBio,
        experience: experience.trim() || null,
        documentPath,
      });

      // service areas
      await saveServiceAreas(supabase, user.id, selectedAreas);

      // availability
      await saveAvailability(
        supabase,
        selectedAvailability.map((day) => ({
          companion_id: user.id,
          day_of_week: day.value,
          start_time: availability[day.value].startTime,
          end_time: availability[day.value].endTime,
        })),
      );

      router.replace("/onboarding/companion/status");

      router.refresh();
    } catch (err) {
      console.error("Submit companion onboarding error:", err);

      setError("ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    // refs
    avatarInputRef,
    documentInputRef,

    // personal
    fullName,
    setFullName,
    email,
    phone,
    setPhone,

    // avatar
    avatarPreview,
    handleAvatarChange,

    // companion
    bio,
    setBio,
    experience,
    setExperience,

    // areas
    areas,
    selectedAreas,
    toggleArea,

    // availability
    availability,
    updateAvailability,

    // document
    documentFile,
    handleDocumentChange,

    // UI
    loading,
    submitting,
    error,

    // submit
    handleSubmit,
  };
}
