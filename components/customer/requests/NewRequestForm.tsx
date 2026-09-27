"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TravelSection from "@/components/customer/requests/travel/TravelSection";
import {
  initialTravelData,
  type TravelData,
} from "@/components/customer/requests/travel/types";
import RouteSummary, {
  type RouteDistances,
} from "@/components/customer/requests/travel/RouteSummary";
import PricingSummary from "@/components/customer/requests/pricing/PricingSummary";
import { calculateServicePrice } from "@/lib/pricing/servicePricing";
import { createServiceRequest } from "@/lib/actions/customerRequests";
import { createClient } from "@/lib/supabase/client";
import Swal from "sweetalert2";

import SelectedCompanion from "@/components/customer/requests/SelectedCompanion";

import RequestDetails from "./RequestDetails";
import RequestTravel from "./RequestTravel";
import RequestPricing from "./RequestPricing";
import RequestNotes from "./RequestNotes";

type Category = { id: string; name: string };
type Area = { id: string; province: string; district: string };
type Companion = { full_name: string | null; avatar_url: string | null };
type CompanionStats = {
  rating_avg: number | null;
  rating_count: number | null;
};

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-500";

export default function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companionId, setCompanionId] = useState(searchParams.get("companion"));
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [stats, setStats] = useState<CompanionStats | null>(null);
  const [loadingCompanion, setLoadingCompanion] = useState(
    Boolean(searchParams.get("companion")),
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [originAreaId, setOriginAreaId] = useState("");
  const [destinationAreaId, setDestinationAreaId] = useState("");

  const [originAreaStatus, setOriginAreaStatus] = useState<
    "idle" | "loading" | "matched" | "manual"
  >("idle");

  const [destinationAreaStatus, setDestinationAreaStatus] = useState<
    "idle" | "loading" | "matched" | "manual"
  >("idle");

  const [originAreaLabel, setOriginAreaLabel] = useState("");
  const [destinationAreaLabel, setDestinationAreaLabel] = useState("");

  const [travel, setTravel] = useState<TravelData>(initialTravelData);
  const [distances, setDistances] = useState<RouteDistances | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    async function load() {
      const [categoryResult, areaResult] = await Promise.all([
        supabase
          .from("service_categories")
          .select("id,name")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("areas")
          .select("id,province,district")
          .order("province")
          .order("district"),
      ]);
      if (!active) return;
      if (categoryResult.error || areaResult.error) {
        setError("โหลดประเภทบริการหรือพื้นที่ไม่สำเร็จ กรุณาตรวจสอบ RLS");
      }
      setCategories(categoryResult.data ?? []);
      setAreas(areaResult.data ?? []);
      setLoadingOptions(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setCompanion(null);
    setStats(null);

    if (!companionId) {
      setLoadingCompanion(false);
      return;
    }

    setLoadingCompanion(true);

    const supabase = createClient();

    async function loadCompanion() {
      try {
        const [profile, companionProfile] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name,avatar_url")
            .eq("id", companionId)
            .maybeSingle(),

          supabase
            .from("companion_profiles")
            .select("rating_avg,rating_count")
            .eq("user_id", companionId)
            .eq("verification_status", "approved")
            .maybeSingle(),
        ]);

        if (!active) return;

        if (
          !profile.error &&
          !companionProfile.error &&
          profile.data &&
          companionProfile.data
        ) {
          setCompanion(profile.data);
          setStats(companionProfile.data);
        } else {
          setError("ไม่พบ Companion ที่ได้รับการอนุมัติ กรุณาเลือกใหม่");
        }
      } catch {
        if (active) {
          setError("โหลดข้อมูล Companion ไม่สำเร็จ");
        }
      } finally {
        if (active) {
          setLoadingCompanion(false);
        }
      }
    }

    void loadCompanion();

    return () => {
      active = false;
    };
  }, [companionId]);

  useEffect(() => {
    if (travel.meetingType !== "pickup" || !travel.origin) {
      return;
    }

    const { lat, lng } = travel.origin;
    const controller = new AbortController();

    async function resolveOriginArea() {
      setOriginAreaId("");
      setOriginAreaLabel("");
      setOriginAreaStatus("loading");

      try {
        const response = await fetch(
          `/api/locations/resolve-area?lat=${lat}&lng=${lng}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("ไม่สามารถค้นหาพื้นที่ได้");
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (data.matched && data.areaId) {
          setOriginAreaId(data.areaId);
          setOriginAreaLabel(`${data.province} / ${data.district}`);
          setOriginAreaStatus("matched");
        } else {
          setOriginAreaStatus("manual");
        }
      } catch {
        if (!controller.signal.aborted) {
          setOriginAreaStatus("manual");
        }
      }
    }

    void resolveOriginArea();

    return () => controller.abort();
  }, [travel.meetingType, travel.origin?.lat, travel.origin?.lng]);

  useEffect(() => {
    if (!travel.destination) return;

    const { lat, lng } = travel.destination;
    const controller = new AbortController();

    async function resolveDestinationArea() {
      setDestinationAreaId("");
      setDestinationAreaLabel("");
      setDestinationAreaStatus("loading");

      try {
        const response = await fetch(
          `/api/locations/resolve-area?lat=${lat}&lng=${lng}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("ไม่สามารถค้นหาพื้นที่ได้");
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (data.matched && data.areaId) {
          setDestinationAreaId(data.areaId);
          setDestinationAreaLabel(`${data.province} / ${data.district}`);
          setDestinationAreaStatus("matched");
        } else {
          setDestinationAreaStatus("manual");
        }
      } catch {
        if (!controller.signal.aborted) {
          setDestinationAreaStatus("manual");
        }
      }
    }

    void resolveDestinationArea();

    return () => controller.abort();
  }, [travel.destination?.lat, travel.destination?.lng]);

  const travelValid =
    Boolean(travel.destination?.name.trim()) &&
    (travel.meetingType !== "pickup" || Boolean(travel.origin?.name.trim())) &&
    (!travel.returnRequired || Boolean(travel.returnLocation?.name.trim()));

  const targetAreaId =
    travel.meetingType === "pickup" ? originAreaId : destinationAreaId;
  const targetAreaStatus =
    travel.meetingType === "pickup"
      ? originAreaStatus
      : destinationAreaStatus;
  const targetAreaLabel =
    travel.meetingType === "pickup" ? originAreaLabel : destinationAreaLabel;
  const setTargetAreaId =
    travel.meetingType === "pickup" ? setOriginAreaId : setDestinationAreaId;
  const setTargetAreaStatus =
    travel.meetingType === "pickup"
      ? setOriginAreaStatus
      : setDestinationAreaStatus;
  const setTargetAreaLabel =
    travel.meetingType === "pickup"
      ? setOriginAreaLabel
      : setDestinationAreaLabel;

  const areaValid =
    travel.meetingType === "pickup"
      ? Boolean(originAreaId) && originAreaStatus !== "loading"
      : Boolean(destinationAreaId) && destinationAreaStatus !== "loading";

  // Public OSRM supports driving routes, not public transport itineraries.
  const needsTransport =
    travel.meetingType === "pickup" || travel.returnRequired;

  const supportedTransport =
    !needsTransport || travel.transportType !== "public_transport";
    
  const price =
    travelValid && distances && supportedTransport
      ? calculateServicePrice({
          durationMinutes,
          outboundDistanceKm: distances.outboundDistanceKm,
          returnDistanceKm: distances.returnDistanceKm,
        })
      : null;

  function changeTravel(next: TravelData) {
    const locationChanged = (
      a: TravelData["origin"],
      b: TravelData["origin"],
    ) => a?.lat !== b?.lat || a?.lng !== b?.lng;

    const routeChanged =
      travel.meetingType !== next.meetingType ||
      travel.returnRequired !== next.returnRequired ||
      locationChanged(travel.origin, next.origin) ||
      locationChanged(travel.destination, next.destination) ||
      locationChanged(travel.returnLocation, next.returnLocation);

    if (routeChanged) {
      setDistances(null);
    }

    setTravel(next);
    setError("");
  }

  function removeCompanion() {
    setCompanionId(null);
    setCompanion(null);
    setStats(null);
    setLoadingCompanion(false);
    setError("");

    // ลบ UUID ออกจาก URL ด้วย
    const url = new URL(window.location.href);
    url.searchParams.delete("companion");

    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search + url.hash,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    if (
      !companionId ||
      !companion ||
      !stats ||
      !categoryId ||
      !serviceDate ||
      !startTime ||
      !areaValid ||
      !travelValid ||
      !supportedTransport ||
      !price ||
      !travel.destination
    ) {
      setError("กรุณาเลือก Companion และกรอกข้อมูลให้ครบ พร้อมรอผลคำนวณราคา");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createServiceRequest({
        companionId,
        categoryId,
        serviceDate,
        startTime,
        durationMinutes,
        meetingType: travel.meetingType,
        transportType: travel.transportType,
        returnRequired: travel.returnRequired,
        originAreaId: travel.meetingType === "pickup" ? originAreaId : null,
        destinationAreaId: destinationAreaId || null,
        origin: travel.meetingType === "pickup" ? travel.origin : null,
        destination: travel.destination,
        returnLocation: travel.returnRequired ? travel.returnLocation : null,
        meetingDetail: travel.meetingDetail,
        note,
      });
      if (!result.success) {
        setError(result.error ?? "ไม่สามารถส่งคำขอได้");
        await Swal.fire({
          icon: "error",
          title: "ไม่สามารถส่งคำขอได้",
          text: result.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
          confirmButtonColor: "#0284c7",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "ส่งคำขอสำเร็จ",
        text: "ส่งคำขอใช้บริการเรียบร้อยแล้ว รอ Companion ตอบรับคำขอ",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });

      // The server recalculates the route. Its final fee is authoritative.
      router.push("/customer/requests");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <SelectedCompanion
        companionId={companionId}
        companion={companion}
        stats={stats}
        loading={loadingCompanion}
        onRemove={removeCompanion}
      />

      <RequestDetails
        categories={categories}
        loadingOptions={loadingOptions}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        serviceDate={serviceDate}
        onDateChange={setServiceDate}
        startTime={startTime}
        onTimeChange={setStartTime}
        durationMinutes={durationMinutes}
        onDurationChange={setDurationMinutes}
      />

      <RequestTravel
        travel={travel}
        onTravelChange={changeTravel}
        supportedTransport={supportedTransport}
      />

      {/* ส่วนแสดง/เลือกเขตพื้นที่ให้บริการ */}
      <section className="border-b border-slate-100 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          พื้นที่ให้บริการ (เขต) *
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          ระบุเขตพื้นที่สำหรับ
          {travel.meetingType === "pickup" ? " จุดรับ Customer" : " สถานที่ทำธุระ"}
        </p>

        {targetAreaStatus === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
            กำลังตรวจจับเขตพื้นที่จากพิกัดแผนที่อัตโนมัติ...
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={targetAreaId}
              onChange={(e) => {
                const val = e.target.value;
                setTargetAreaId(val);
                const found = areas.find((a) => a.id === val);
                if (found) {
                  setTargetAreaLabel(`${found.province} / ${found.district}`);
                  setTargetAreaStatus("matched");
                }
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-500"
            >
              <option value="">-- เลือกเขตพื้นที่ให้บริการ --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.province} - เขต{a.district}
                </option>
              ))}
            </select>

            {targetAreaLabel ? (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ เขตที่เลือก: {targetAreaLabel}
              </p>
            ) : (
              <p className="text-xs text-amber-600">
                * หากระบบไม่พบเขตอัตโนมัติ สามารถเลือกเขตจากรายการด้านบนได้โดยตรง
              </p>
            )}
          </div>
        )}
      </section>

      <RequestPricing
        travel={travel}
        durationMinutes={durationMinutes}
        distances={distances}
        travelValid={travelValid}
        supportedTransport={supportedTransport}
        onCalculated={setDistances}
      />

      <RequestNotes note={note} onNoteChange={setNote} />
      {error && (
        <p
          role="alert"
          className="mx-6 mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-6">
        <div className="text-xs text-slate-500 w-full sm:w-auto">
          {(!categoryId ||
            !serviceDate ||
            !startTime ||
            !areaValid ||
            !price) && (
            <div className="space-y-1 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <span className="font-semibold block mb-0.5">
                สิ่งที่ยังต้องระบุให้ครบก่อนส่งคำขอ:
              </span>
              {!categoryId && <div>• กรุณาเลือกประเภทบริการด้านบน</div>}
              {!serviceDate && <div>• กรุณาระบุวันที่รับบริการ</div>}
              {!startTime && <div>• กรุณาระบุเวลาเริ่ม</div>}
              {!areaValid && (
                <div>
                  • กรุณาเลือกพื้นที่ (เขต) ให้บริการในหัวข้อ &ldquo;พื้นที่ให้บริการ (เขต)&rdquo;
                </div>
              )}
              {!price && <div>• กำลังรอผลการคำนวณเส้นทางและราคาค่าบริการ</div>}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 w-full sm:w-auto shrink-0 self-end sm:self-auto">
          <a
            href="/customer"
            className="cursor-pointer rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100 transition text-slate-700 font-semibold"
          >
            ยกเลิก
          </a>
          <button
            type="submit"
            disabled={
              submitting ||
              !companion ||
              !stats ||
              !categoryId ||
              !serviceDate ||
              !startTime ||
              !areaValid ||
              !price
            }
            className="cursor-pointer rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 shadow-sm"
          >
            {submitting ? "กำลังส่งคำขอ..." : "ส่งคำขอใช้บริการ"}
          </button>
        </div>
      </div>
    </form>
  );
}
