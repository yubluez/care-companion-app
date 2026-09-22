'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type UserRole = 'customer' | 'companion';

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }

  // 1. Check user_metadata
  if (user.user_metadata?.role) {
    return user.user_metadata.role as UserRole;
  }

  // 2. Check profiles table if it exists
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role) {
      return profile.role as UserRole;
    }
  } catch {
    // ignore if table doesn't exist
  }

  return null;
}

export async function setUserRole(role: UserRole) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: 'ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง' };
  }

  // 1. Update user_metadata in Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    data: { role },
  });

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 2. Best-effort update or insert into profiles table if present
  try {
    await supabase.from('profiles').upsert({
      id: user.id,
      role,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      updated_at: new Date().toISOString(),
    });
  } catch {
    // ignore if table does not exist
  }

  return { success: true, role };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
