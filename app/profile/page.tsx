import { getUser, signOut } from "@/lib/actions/auth";
import NavBarCus from "@/components/customer/NavBarCus";

export default async function Page() {
  const user = await getUser();
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "คุณลูกค้า";

  const email = user?.email || "-";
  const phone = user?.user_metadata?.phone || "-";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen">
      <NavBarCus />
      <div className="max-w-3xl mx-auto space-y-6 py-10 px-4 sm:px-6 lg:px-8">
        {/* Header Card: ข้อมูลผู้ใช้หลัก + ปุ่มออกจากระบบ */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-5">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-15 h-15 rounded-full border border-sky-200 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <p className="mb-2 text-xl font-bold text-slate-800">
                {displayName}
              </p>
              <span className="text-xs text-sky-800 font-semibold">
                ผู้ต้องการผู้ช่วย (Customer)
              </span>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 hover:border-rose-200 px-3.5 py-2 rounded-xl transition cursor-pointer font-medium"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>

        {/*  */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                ข้อมูลส่วนตัว
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                ข้อมูลบัญชีและช่องทางการติดต่อสำหรับการใช้งาน Care Companion
              </p>
            </div>
            <button className="text-sm text-sky-600 hover:text-sky-700 font-medium px-3 py-1.5 rounded-lg hover:bg-sky-50 transition border border-sky-200 cursor-pointer">
              แก้ไขข้อมูล
            </button>
          </div>

          {/* แสดงข้อมูล */}
          <div className="mt-5">
            {/* ชื่อแสดงผล */}
            <div className="grid grid-cols-[220px_1fr] items-center py-4 border-b border-slate-100">
              <span className="font-medium text-slate-600">ชื่อแสดงผล</span>

              <p className="font-semibold text-slate-800">{displayName}</p>
            </div>

            {/* อีเมล */}
            <div className="grid grid-cols-[220px_1fr] items-center py-4 border-b border-slate-100">
              <span className="font-medium text-slate-600">อีเมล</span>

              <p className="text-slate-800">{email}</p>
            </div>

            {/* เบอร์โทร */}
            <div className="grid grid-cols-[220px_1fr] items-center py-4 border-b border-slate-100">
              <span className="font-medium text-slate-600">เบอร์โทรศัพท์</span>

              <p className="text-slate-800">{phone}</p>
            </div>

            {/* วันที่สมัคร */}
            <div className="grid grid-cols-[220px_1fr] items-center py-4">
              <span className="font-medium text-slate-600">
                วันที่สมัครสมาชิก
              </span>

              <p className="text-slate-800">{createdAt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
