import Link from "next/link";
import { getUser, getUserRole } from "@/lib/actions/auth";
import {
  HeartHandshake,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  MapPin,
  Building2,
  Landmark,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";

export default async function LandingPage() {
  const user = await getUser();
  const role = await getUserRole();

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (role === "customer") return "/customer";
    if (role === "companion") return "/companion";
    return "/onboarding/role";
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      {/* ─── Top Navbar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
                Care Companion
              </span>
              <span className="text-[11px] font-medium text-sky-600 block -mt-0.5">
                เพื่อนร่วมทางที่คุณไว้วางใจ
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-sky-600 transition">
              บริการของเรา
            </a>
            <a href="#how-it-works" className="hover:text-sky-600 transition">
              วิธีใช้งาน
            </a>
            <a href="#why-us" className="hover:text-sky-600 transition">
              จุดเด่น
            </a>
          </nav>

          {/* User Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={getDashboardHref()}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition shadow-sm shadow-sky-600/20"
              >
                <span>ไปยังหน้าหลัก</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-sky-700 px-3 py-2 rounded-xl transition hover:bg-slate-100"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition shadow-sm shadow-sky-600/20"
                >
                  <span>เริ่มต้นใช้งาน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Soft background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-tr from-sky-200/40 via-sky-100/30 to-sky-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/90 px-4 py-1.5 text-xs sm:text-sm font-semibold text-sky-800 shadow-xs mb-6 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>เพื่อนร่วมทางคู่ใจ อุ่นใจทุกการเดินทาง</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.18] tracking-tight mb-6">
            อุ่นใจทุกการเดินทาง <br />
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              มีเพื่อนคู่คิดช่วยทำธุระข้างกาย
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed mb-10">
            บริการเพื่อนร่วมเดินทางพาไปโรงพยาบาล พบแพทย์ ธนาคาร หรือติดต่อหน่วยงานต่าง ๆ
            ให้ผู้สูงอายุและบุคคลทั่วไปเดินทางได้อย่างสะดวก ปลอดภัย และไร้ความกังวล
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href={user ? getDashboardHref() : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-md shadow-sky-600/25 hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>ค้นหา Companion ทันที</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/onboarding/role"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-2xl border border-slate-200 transition hover:border-slate-300 shadow-xs"
            >
              <Users className="w-4 h-4 text-sky-600" />
              <span>สมัครเป็น Companion</span>
            </Link>
          </div>

          {/* Reassurance Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-14 pt-8 border-t border-slate-200/60 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ตรวจยืนยันตัวตนทุกคน</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>ประเมินระยะทางและราคาจริง</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>ระบบรีวิวโปร่งใสจากลูกค้า</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Section ───────────────────────────────────── */}
      <section id="services" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              บริการที่ตอบโจทย์ทุกความต้องการ
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              ไม่ว่าจะไปโรงพยาบาลหรือทำธุระสำคัญ มีผู้ช่วยมืออาชีพคอยดูแลเคียงข้างตลอดเส้นทาง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-sky-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                พาไปโรงพยาบาล & พบแพทย์
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                ช่วยพาไปพบแพทย์ รอต่อคิวตรวจ ช่วยถือเอกสารและยา พร้อมช่วยสรุปข้อแนะนำของแพทย์ให้ญาติทราบ
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-sky-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                พาไปทำธุระ & ติดต่อราชการ
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                เป็นเพื่อนร่วมทางไปธนาคาร สำนักงานเขต ที่ว่าการอำเภอ หรือธุระส่วนตัว ช่วยอำนวยความสะดวกอย่างอุ่นใจ
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-sky-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                เพื่อนร่วมทางในชีวิตประจำวัน
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                เดินตลาด ซื้อของใช้ส่วนตัว ร่วมกิจกรรมชมรม หรือออกกำลังกาย โดยมีเพื่อนที่คอยช่วยเหลือระมัดระวังความปลอดภัย
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works Section ───────────────────────────────── */}
      <section id="how-it-works" className="py-18 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2 block">
            ขั้นตอนง่าย ๆ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            3 ขั้นตอนในการเริ่มต้นใช้งาน
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            ออกแบบให้ใช้งานสะดวก ไม่ซับซ้อน ได้รับการดูแลอย่างรวดเร็ว
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                1
              </div>
              <CalendarDays className="w-5 h-5 text-sky-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              ระบุวัน เวลา และธุระ
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              เลือกสถานที่รับ จุดหมายปลายทาง วัน เวลา และระบุรายละเอียดความช่วยเหลือที่คุณต้องการ
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                2
              </div>
              <Users className="w-5 h-5 text-sky-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              เลือก Companion ที่ตรงใจ
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              ดูประวัติ ความเชี่ยวชาญ พื้นที่ให้บริการ และคะแนนรีวิวจากผู้ใช้จริงก่อนตัดสินใจส่งคำขอ
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                3
              </div>
              <ShieldCheck className="w-5 h-5 text-sky-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              เดินทางปลอดภัย สบายใจ
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              พบกันตามเวลานัดหมาย ได้รับการดูแลอย่างใกล้ชิด และชำระเงินค่าบริการเมื่อภารกิจเสร็จสิ้น
            </p>
          </div>
        </div>
      </section>

      {/* ─── Why Care Companion Section ─────────────────────────── */}
      <section id="why-us" className="py-16 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            {/* Subtle light effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-2 block">
                จุดเด่นของเรา
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
                เพราะความปลอดภัยและความสบายใจของคุณ คือหัวใจหลักของเรา
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                เราตั้งใจสร้างพื้นที่ที่เชื่อมโยงผู้ที่ต้องการความช่วยเหลือกับผู้ดูแลที่มีจิตใจรักการบริการอย่างแท้จริง
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span>ยืนยันตัวตนด้วยบัตรประชาชนทุกคน</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span>คำนวณราคาโปร่งใสตามระยะทางจริง</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span>มีระบบแจ้งเตือนและติดตามสถานะงาน</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <span>รีวิวจริงจากผู้รับบริการหลังเสร็จงาน</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ──────────────────────────────────── */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50/70 to-white p-8 sm:p-12 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            พร้อมให้เราเป็นเพื่อนร่วมทางของคุณหรือยัง?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base mb-8">
            เริ่มต้นค้นหา Companion หรือสมัครเป็นผู้ช่วยดูแลเพื่อสร้างรายได้เสริมได้แล้ววันนี้
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={user ? getDashboardHref() : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-md shadow-sky-600/20"
            >
              <span>เริ่มต้นใช้งานเลย</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-10 text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
              CC
            </div>
            <span className="font-bold text-slate-800">Care Companion</span>
            <span className="text-xs text-slate-400">© 2026 สงวนลิขสิทธิ์</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-sky-600 transition">
              ข้อกำหนดการใช้งาน
            </Link>
            <Link href="/privacy" className="hover:text-sky-600 transition">
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}