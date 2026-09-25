import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import RequestCard, {
  type CompanionRequest,
} from "@/components/companion/requests/RequestCard";

export default async function CompanionRequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ตรวจ Role + KYC
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "companion") {
    if (profile.role === "customer") {
      redirect("/customer");
    }

    redirect("/onboarding/role");
  }

  const { data: companion } = await supabase
    .from("companion_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!companion) {
    redirect("/onboarding/companion");
  }

  if (companion.verification_status !== "approved") {
    redirect("/onboarding/companion/status");
  }

  // โหลดคำขอที่ส่งมาหา Companion คนนี้
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      `
      id,
      service_date,
      start_time,
      duration_minutes,
      destination_name,
      offered_fee,
      status,

      customer:profiles!service_requests_customer_id_fkey (
        full_name,
        avatar_url
      ),

      category:service_categories (
        name
      )
    `,
    )
    .eq("companion_id", user.id)
    .eq("status", "pending")
    .order("service_date", {
      ascending: true,
    })
    .order("start_time", {
      ascending: true,
    });

  if (error) {
    console.error("Load companion requests error:", error);
  }

  const requests: CompanionRequest[] = (data ?? []).map((row) => {
    const customer = Array.isArray(row.customer)
      ? (row.customer[0] ?? null)
      : (row.customer ?? null);

    const category = Array.isArray(row.category)
      ? (row.category[0] ?? null)
      : (row.category ?? null);

    return {
      id: row.id,
      serviceDate: row.service_date ?? "",
      startTime: row.start_time ?? "",
      durationMinutes: row.duration_minutes ?? null,
      destinationName: row.destination_name ?? null,
      offeredFee: row.offered_fee ?? null,
      status: row.status,

      customer: customer
        ? {
            fullName: customer.full_name ?? null,
            avatarUrl: customer.avatar_url ?? null,
          }
        : null,

      category: category
        ? {
            name: category.name,
          }
        : null,
    };
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">คำของาน</h1>

            <p className="text-slate-500 mt-1">
              คำขอใช้บริการที่กำลังรอการตอบรับจากคุณ
            </p>
          </div>

          <Link
            href="/companion"
            className="text-sm font-semibold text-slate-600 hover:text-sky-600"
          >
            ← หน้าหลัก
          </Link>
        </div>

        {error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-600">
            ไม่สามารถโหลดคำของานได้
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl py-16 px-6 text-center shadow-sm">
            <div className="text-5xl mb-4">📭</div>

            <h2 className="text-lg font-bold text-slate-700">
              ยังไม่มีคำขอใหม่
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              เมื่อมีลูกค้าส่งคำขอถึงคุณ คำขอจะแสดงที่นี่
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
