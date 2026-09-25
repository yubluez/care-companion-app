"use client";

import { useState } from "react";
import CompanionCard from "@/components/customer/compsearch/CompanionCard";
import CompanionFilter from "@/components/customer/compsearch/CompanionFilter";
import CompanionProfileModal from "@/components/customer/compsearch/CompanionProfileModal";

export type Companion = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  jobs: number;
  types: string[];
  avatar: string;
};

const companions: Companion[] = [
  {
    id: "1",
    name: "สมชาย ใจดี",
    location: "กรุงเทพมหานคร",
    rating: 4.9,
    reviews: 32,
    jobs: 24,
    types: ["โรงพยาบาล", "ทำธุระทั่วไป"],
    avatar: "",
  },
  {
    id: "2",
    name: "พิมพ์ชนก ดีงาม",
    location: "กรุงเทพมหานคร",
    rating: 4.8,
    reviews: 21,
    jobs: 18,
    types: ["ธนาคาร", "โรงพยาบาล"],
    avatar: "",
  },
  {
    id: "3",
    name: "ธนกร มีสุข",
    location: "นนทบุรี",
    rating: 4.7,
    reviews: 18,
    jobs: 15,
    types: ["ซื้อของ", "ทำธุระทั่วไป"],
    avatar: "",
  },
];

export default function CompanionSearch() {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedCompanion, setSelectedCompanion] =
    useState<Companion | null>(null);

  const filteredCompanions = companions.filter((companion) => {
    const keyword = search.toLowerCase();

    return (
      companion.name.toLowerCase().includes(keyword) ||
      companion.location.toLowerCase().includes(keyword) ||
      companion.types.some((type) =>
        type.toLowerCase().includes(keyword)
      )
    );
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sky-600 font-semibold mb-1">
            ค้นหาผู้ร่วมเดินทาง
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            ค้นหา Companion ที่เหมาะกับคุณ
          </h1>

          <p className="text-slate-500 mt-2">
            ค้นหาจากชื่อ สถานที่ หรือกำหนดรายละเอียดของธุระที่คุณต้องการ
          </p>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">

          <div className="flex gap-3">

            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                🔎
              </span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ Companion, สถานที่ หรือประเภทของธุระ..."
                className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <button
              onClick={() => setShowFilter(!showFilter)}
              className="border border-slate-300 px-5 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              ⚙ ตัวกรอง
            </button>

          </div>

          {showFilter && <CompanionFilter />}

        </div>

        {/* Result */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">
              Companion
            </h2>

            <p className="text-sm text-slate-500">
              พบ {filteredCompanions.length} คน
            </p>
          </div>
        </div>

        <div className="space-y-4">

          {filteredCompanions.map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              onViewProfile={() =>
                setSelectedCompanion(companion)
              }
            />
          ))}

        </div>

        {filteredCompanions.length === 0 && (
          <div className="bg-white border rounded-2xl py-16 text-center">
            <div className="text-4xl mb-3">
              🔎
            </div>

            <h3 className="font-bold">
              ไม่พบ Companion
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              ลองเปลี่ยนคำค้นหาหรือตัวกรองของคุณ
            </p>
          </div>
        )}

      </div>

      {/* Modal */}
      {selectedCompanion && (
        <CompanionProfileModal
          companion={selectedCompanion}
          onClose={() => setSelectedCompanion(null)}
        />
      )}

    </main>
  );
}