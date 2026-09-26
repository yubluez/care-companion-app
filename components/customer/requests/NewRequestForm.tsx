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
        return;
      }
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
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
        <a
          href="/customer"
          className="rounded-xl border border-slate-300 px-5 py-3"
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
          className="rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "กำลังส่งคำขอ..." : "ส่งคำขอใช้บริการ"}
        </button>
      </div>
    </form>
  );
}
