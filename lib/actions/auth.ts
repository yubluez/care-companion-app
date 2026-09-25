"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRole = "customer" | "companion";

// ดึงข้อมูลผู้ใช้ที่ Login อยู่
export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

// ดึง Role จาก Database
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // อ่าน Role จากตาราง profiles เป็นหลัก
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Get user role error:", profileError);
    return null;
  }

  if (profile?.role === "customer" || profile?.role === "companion") {
    return profile.role;
  }

  return null;
}

// บันทึก Role ลง Supabase
export async function setUserRole(role: UserRole) {
  try {
    const supabase = await createClient();

    // 1. ตรวจสอบ Role ที่เลือก
    if (role !== "customer" && role !== "companion") {
      return {
        success: false,
        error: "Role ไม่ถูกต้อง",
      };
    }

    // 2. ตรวจสอบผู้ใช้ที่ Login อยู่
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง",
      };
    }

    // 3. ตรวจสอบข้อมูลผู้ใช้ในตาราง profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);

      return {
        success: false,
        error: "ไม่พบข้อมูลผู้ใช้ในตาราง profiles",
      };
    }

    // 4. ตรวจสอบว่าผู้ใช้เคยเลือก Role แล้วหรือยัง
    if (profile.role !== null) {
      return {
        success: false,
        error: "บัญชีนี้มี Role อยู่แล้ว ไม่สามารถเปลี่ยนได้",
      };
    }

    // 5. บันทึก Role ลง Database
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        role: role,
      })
      .eq("id", user.id)
      .is("role", null)
      .select("id, role")
      .single();

    // 6. ตรวจสอบผลการบันทึก
    if (updateError || !updatedProfile) {
      console.error("Database update error:", updateError);

      return {
        success: false,
        error: updateError?.message || "ไม่สามารถบันทึก Role ลง Database ได้",
      };
    }

    // 7. บันทึก Role ลง Supabase Auth
    // const { error: authError } = await supabase.auth.updateUser({
    //   data: {
    //     role: role,
    //   },
    // });

    // if (authError) {
    //   console.error("Auth update error:", authError);

    //   return {
    //     success: false,
    //     error: "บันทึก Role ลง Database แล้ว แต่ไม่สามารถอัปเดต Auth ได้",
    //   };
    // }

    // 8. บันทึกสำเร็จ
    // บันทึก Role ลง Database สำเร็จ
    return {
      success: true,
      role: role,
    };
  } catch (error) {
    console.error("Set user role error:", error);

    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึก Role",
    };
  }
}

// ออกจากระบบ
export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}
