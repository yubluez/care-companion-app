"use client";

import { ReactNode } from "react";
import LocationSearchPicker from "../map/LocationSearchPicker";
import type { TravelData } from "./types";
import { Handshake, House, CarFront, MapPin, LucideIcon } from "lucide-react";

type Props = {
  value: TravelData;
  onChange: (data: TravelData) => void;
};

const inputStyle =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

function SectionTitle({
  icon: Icon,
  children,
  color = "blue",
}: {
  icon: LucideIcon;
  children: ReactNode;
  color?: "blue" | "violet" | "green" | "orange" | "pink";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <h3 className="flex items-center gap-3 font-semibold text-slate-800">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors[color]}`}
      >
        <Icon size={19} strokeWidth={2} />
      </span>

      {children}
    </h3>
  );
}

export default function TravelSection({ value, onChange }: Props) {
  function update(changes: Partial<TravelData>) {
    onChange({ ...value, ...changes });
  }

  const showTransport = value.meetingType === "pickup" || value.returnRequired;

  return (
    <section className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          การเดินทางและสถานที่
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          เลือกรูปแบบการเดินทางและปักหมุดสถานที่
        </p>
      </div>

      {/* รูปแบบการนัดพบ */}
      <div className="space-y-3">
        <SectionTitle icon={Handshake} color="green">รูปแบบการนัดพบ</SectionTitle>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="cursor-pointer rounded-xl border border-slate-200 p-4">
            <input
              type="radio"
              name="meetingType"
              checked={value.meetingType === "pickup"}
              onChange={() =>
                update({
                  meetingType: "pickup",
                })
              }
            />
            <span className="ml-2 font-semibold">ให้ Companion มารับ</span>
            <p className="mt-2 text-sm text-slate-500">
              Companion มารับ Customer แล้วเดินทางไปด้วยกัน
            </p>
          </label>

          <label className="cursor-pointer rounded-xl border border-slate-200 p-4">
            <input
              type="radio"
              name="meetingType"
              checked={value.meetingType === "destination"}
              onChange={() =>
                update({
                  meetingType: "destination",
                  origin: null,
                  transportType: "taxi",
                })
              }
            />
            <span className="ml-2 font-semibold">พบกันที่จุดหมาย</span>
            <p className="mt-2 text-sm text-slate-500">
              Customer เดินทางไปเองและพบ Companion ที่สถานที่ทำธุระ
            </p>
          </label>
        </div>
      </div>

      {/* การส่งกลับ */}
      <div className="space-y-3">
        <SectionTitle icon={House}>หลังเสร็จธุระ</SectionTitle>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={value.returnRequired}
            onChange={(event) =>
              update({
                returnRequired: event.target.checked,
                returnLocation: event.target.checked
                  ? value.returnLocation
                  : null,
              })
            }
          />
          <span className="font-medium text-slate-700">
            ให้ Companion พาไปส่งหลังเสร็จธุระ
          </span>
        </label>
      </div>

      {/* วิธีเดินทาง */}
      {showTransport && (
        <div className="space-y-3">
          <SectionTitle icon={CarFront} color="violet">วิธีเดินทาง</SectionTitle>

          <select
            value={value.transportType}
            onChange={(event) =>
              update({
                transportType: event.target
                  .value as TravelData["transportType"],
              })
            }
            className={inputStyle}
          >
            <option value="taxi">แท็กซี่ / รถโดยสารผ่านแอป</option>
            <option value="private_car">รถยนต์ส่วนตัวของ Customer</option>
            <option value="public_transport">ขนส่งสาธารณะ</option>
            <option value="other">อื่น ๆ</option>
          </select>

          <p className="text-sm text-slate-500">
            ค่าโดยสาร ค่าทางด่วน และค่าใช้จ่ายอื่น ยังไม่รวมอยู่ในค่าบริการ
            Companion
          </p>
        </div>
      )}

      {/* จุดรับ */}
      {value.meetingType === "pickup" && (
        <LocationSearchPicker
          title="จุดรับ Customer"
          value={value.origin}
          onChange={(place) => update({ origin: place })}
        />
      )}

      {/* จุดหมาย */}
      <LocationSearchPicker
        title={
          value.meetingType === "pickup"
            ? "สถานที่ทำธุระ"
            : "สถานที่ทำธุระ / จุดนัดพบ"
        }
        value={value.destination}
        onChange={(place) => update({ destination: place })}
      />

      {/* จุดส่งกลับ */}
      {value.returnRequired && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-800">จุดส่งกลับ</h3>

          {value.meetingType === "pickup" && value.origin && (
            <button
              type="button"
              onClick={() =>
                update({
                  returnLocation: {
                    ...value.origin!,
                  },
                })
              }
              className="rounded-xl border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
            >
              ใช้ตำแหน่งเดียวกับจุดรับ
            </button>
          )}

          <LocationSearchPicker
            title="เลือกสถานที่ส่งกลับ"
            value={value.returnLocation}
            onChange={(place) =>
              update({
                returnLocation: place,
              })
            }
          />
        </div>
      )}

      {/* รายละเอียดจุดนัดพบ */}
      <div>
        <label className="mb-2 block font-semibold text-slate-800">
          รายละเอียดจุดนัดพบ
        </label>

        <textarea
          value={value.meetingDetail}
          onChange={(event) =>
            update({
              meetingDetail: event.target.value,
            })
          }
          maxLength={500}
          rows={3}
          placeholder="เช่น รอที่ทางเข้าอาคาร A ชั้น 1"
          className={inputStyle}
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {value.meetingDetail.length}/500
        </p>
      </div>
    </section>
  );
}
