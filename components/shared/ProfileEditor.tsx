"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ProfileEditorProps = {
  userId: string;
  initialName: string;
  email: string;
  initialPhone: string;
  initialAvatarUrl: string;
  createdAt: string;
};

export default function ProfileEditor({
  userId,
  initialName,
  email,
  initialPhone,
  initialAvatarUrl,
  createdAt,
}: ProfileEditorProps) {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const [savedName, setSavedName] = useState(initialName);
  const [savedPhone, setSavedPhone] = useState(initialPhone);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState(initialAvatarUrl);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialAvatarUrl);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [success]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดรูปต้องไม่เกิน 5 MB");
      return;
    }

    setError("");
    setSuccess("");
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancel = () => {
    setName(savedName);
    setPhone(savedPhone);
    setAvatarUrl(savedAvatarUrl);
    setPreviewUrl(savedAvatarUrl);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");

      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();

      if (!trimmedName) {
        setError("กรุณากรอกชื่อแสดงผล");
        return;
      }

      if (!/^0\d{9}$/.test(trimmedPhone)) {
        setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง 10 หลัก");
        return;
      }

      setIsSaving(true);

      let newAvatarUrl = avatarUrl;

      // ถ้ามีการเลือกรูปใหม่
      if (selectedFile) {
        const fileExtension =
          selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${userId}/avatar-${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload avatar error:", uploadError);
          setError("ไม่สามารถอัปโหลดรูปโปรไฟล์ได้");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        newAvatarUrl = publicUrlData.publicUrl;
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          phone: trimmedPhone,
          avatar_url: newAvatarUrl || null,
        })
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (updateError || !updatedProfile) {
        console.error("Update profile error:", updateError);
        setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบสิทธิ์การแก้ไขโปรไฟล์");
        return;
      }

      setName(trimmedName);
      setPhone(trimmedPhone);
      setAvatarUrl(newAvatarUrl);
      setPreviewUrl(newAvatarUrl);

      setSavedName(trimmedName);
      setSavedPhone(trimmedPhone);
      setSavedAvatarUrl(newAvatarUrl);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setIsEditing(false);
      setSuccess("บันทึกข้อมูลเรียบร้อยแล้ว");

      router.refresh();
    } catch (err) {
      console.error("Save profile error:", err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">ข้อมูลส่วนตัว</h2>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setIsEditing(true);
            }}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium px-3 py-1.5 rounded-lg hover:bg-sky-50 transition border border-sky-200 cursor-pointer"
          >
            แก้ไขข้อมูล
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-sm text-slate-600 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-lg transition border border-slate-200 cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="text-sm text-white bg-sky-600 hover:bg-sky-700 font-medium px-4 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Profile image - แสดงเฉพาะตอนแก้ไข */}
      {isEditing && (
        <div className="grid grid-cols-[220px_1fr] items-center py-4 border-b border-slate-100">
          <span className="font-medium text-slate-600">รูปโปรไฟล์</span>

          <div className="flex items-center gap-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={name || "Profile"}
                className="w-16 h-16 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xl font-bold">
                {(name || "C").charAt(0).toUpperCase()}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
            >
              เปลี่ยนรูป
            </button>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="grid grid-cols-[220px_1fr] items-center py-4 border-b border-slate-100">
        <span className="font-medium text-slate-600">ชื่อแสดงผล</span>

        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full max-w-md border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400"
          />
        ) : (
          <p className="font-semibold text-slate-800">{savedName || "-"}</p>
        )}
      </div>

      {/* Email - แก้ไม่ได้ */}
      <div className="grid grid-cols-[220px_1fr] items-center py-4 border-b border-slate-100">
        <span className="font-medium text-slate-600">อีเมล</span>

        <p className="text-slate-800">{email}</p>
      </div>

      {/* Phone */}
      <div className="grid grid-cols-[220px_1fr] items-center py-4 border-b border-slate-100">
        <span className="font-medium text-slate-600">เบอร์โทรศัพท์</span>

        {isEditing ? (
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setPhone(value);
            }}
            placeholder="0812345678"
            className="w-full max-w-md border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400"
          />
        ) : (
          <p className="text-slate-800">{savedPhone || "-"}</p>
        )}
      </div>

      {/* Created date - แก้ไม่ได้ */}
      <div className="grid grid-cols-[220px_1fr] items-center py-4">
        <span className="font-medium text-slate-600">วันที่สมัครสมาชิก</span>

        <p className="text-slate-800">{createdAt}</p>
      </div>
    </div>
  );
}
