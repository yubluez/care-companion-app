"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelRequestByAdmin,
  reassignRequestByAdmin,
  getAvailableCompanionsForRequest,
  type AvailableCompanion,
} from "@/lib/actions/adminRequests";
import type { RequestStatus } from "./types";
import Swal from "sweetalert2";

type Props = {
  requestId: string;
  currentStatus: RequestStatus;
  currentCompanionName: string | null;
  serviceDate: string;
  startTime: string;
  destinationName: string | null;
  offeredFee: number | null;
  customerName: string | null;
  compact?: boolean;
};

export default function AdminRequestActions({
  requestId,
  currentStatus,
  currentCompanionName,
  serviceDate,
  startTime,
  destinationName,
  offeredFee,
  customerName,
  compact = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRebookModal, setShowRebookModal] = useState(false);

  // Cancel form state
  const [cancelReasonPreset, setCancelReasonPreset] = useState("ลูกค้าติดต่อผู้ดูแลไม่ได้");
  const [customReason, setCustomReason] = useState("");
  const [rebookAfterCancel, setRebookAfterCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Re-book form state
  const [companions, setCompanions] = useState<AvailableCompanion[]>([]);
  const [loadingCompanions, setLoadingCompanions] = useState(false);
  const [companionError, setCompanionError] = useState("");
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<"pending" | "accepted">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "time" | "area">("all");
  const [rebookError, setRebookError] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  // Load available companions when Rebook Modal opens
  useEffect(() => {
    if (!showRebookModal) return;

    let active = true;
    setLoadingCompanions(true);
    setCompanionError("");

    getAvailableCompanionsForRequest(requestId).then((res) => {
      if (!active) return;
      setLoadingCompanions(false);
      if (res.success && res.data) {
        setCompanions(res.data);
      } else {
        setCompanionError(res.error || "ไม่สามารถโหลดรายชื่อผู้ดูแลได้");
      }
    });

    return () => {
      active = false;
    };
  }, [showRebookModal, requestId]);

  // Handle Cancel Request
  const handleCancelSubmit = async () => {
    setCancelError("");
    const finalReason =
      cancelReasonPreset === "อื่นๆ"
        ? customReason.trim() || "ติดต่อผู้ดูแลไม่ได้"
        : cancelReasonPreset;

    startTransition(async () => {
      const res = await cancelRequestByAdmin({
        requestId,
        reason: finalReason,
      });

      if (!res.success) {
        setCancelError(res.error || "เกิดข้อผิดพลาดในการยกเลิกคำขอ");
        await Swal.fire({
          title: "ยกเลิกไม่สำเร็จ",
          text: res.error || "เกิดข้อผิดพลาดในการยกเลิกคำขอ",
          icon: "error",
          confirmButtonColor: "#e11d48",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      setShowCancelModal(false);

      if (rebookAfterCancel) {
        setShowRebookModal(true);
      } else {
        await Swal.fire({
          title: "ยกเลิกงานเรียบร้อยแล้ว",
          text: "ระบบได้ทำการปรับสถานะคำขอเป็น 'ยกเลิก' เรียบร้อยแล้ว",
          icon: "success",
          confirmButtonColor: "#0284c7",
          confirmButtonText: "ตกลง",
        });
        router.refresh();
      }
    });
  };

  // Handle Express Re-booking
  const handleRebookSubmit = async () => {
    if (!selectedCompanionId) {
      setRebookError("กรุณาเลือกผู้ดูแลที่ต้องการมอบหมายงาน");
      await Swal.fire({
        title: "กรุณาเลือกผู้ดูแล",
        text: "กรุณาคลิกเลือกผู้ดูแล 1 ท่านจากรายการก่อนดำเนินการ",
        icon: "warning",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    setRebookError("");

    startTransition(async () => {
      const res = await reassignRequestByAdmin({
        requestId,
        newCompanionId: selectedCompanionId,
        targetStatus,
      });

      if (!res.success) {
        setRebookError(res.error || "เกิดข้อผิดพลาดในการมอบหมายงาน");
        await Swal.fire({
          title: "มอบหมายงานไม่สำเร็จ",
          text: res.error || "เกิดข้อผิดพลาดในการมอบหมายงาน",
          icon: "error",
          confirmButtonColor: "#e11d48",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      setShowRebookModal(false);
      setSelectedCompanionId(null);
      await Swal.fire({
        title: "จองด่วนสำเร็จ!",
        text:
          targetStatus === "accepted"
            ? "มอบหมายงานให้ผู้ดูแลคนใหม่เรียบร้อยแล้ว (สถานะ: รับงานแล้ว)"
            : "ส่งคำขอไปยังผู้ดูแลคนใหม่เรียบร้อยแล้ว (สถานะ: รอตอบรับ)",
        icon: "success",
        confirmButtonColor: "#0284c7",
        confirmButtonText: "ตกลง",
      });
      router.refresh();
    });
  };

  // Filter companions
  const filteredCompanions = companions.filter((comp) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = comp.fullName?.toLowerCase().includes(q);
      const matchPhone = comp.phone?.includes(q);
      if (!matchName && !matchPhone) return false;
    }

    if (filterMode === "time" && !comp.isTimeAvailable) return false;
    if (filterMode === "area" && !comp.isAreaMatch) return false;

    return true;
  });

  const canCancel =
    currentStatus === "pending" ||
    currentStatus === "accepted" ||
    currentStatus === "in_progress";
  const canRebook =
    currentStatus === "accepted" ||
    currentStatus === "in_progress" ||
    currentStatus === "cancelled" ||
    currentStatus === "pending";

  if (!canCancel && !canRebook) {
    return null;
  }

  return (
    <>
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-sky-600 px-5 py-3 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-lg">✓</span>
          <span className="text-sm font-medium">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex flex-wrap items-center justify-between ${compact ? "mt-3 w-full" : ""}`}>
        {canRebook && (
          <button
            type="button"
            onClick={() => setShowRebookModal(true)}
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 p-3 text-xs font-semibold text-white transition
                        hover:bg-sky-700 cursor-pointer shadow-sm"
          >
            <span>⚡</span>
            <span>เลือก Companion ใหม่</span>
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs
                        font-semibold text-rose-700 transition hover:bg-rose-100 hover:border-rose-300 cursor-pointer shadow-sm"
          >
            <span>🚫</span>
            <span>ยกเลิกงาน</span>
          </button>
        )}
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* Modal 1: Cancel Request */}
      {/* ───────────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 font-bold">
                  !
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    ยกเลิกคำขอใช้บริการ
                  </h3>
                  <p className="text-xs text-slate-500">
                    สำหรับกรณีที่ลูกค้าขอยกเลิก ไม่มีผู้รับงาน หรือติดต่อไม่ได้
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current details */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
              <p>
                <strong>ลูกค้า:</strong> {customerName || "ไม่ระบุ"}
              </p>
              <p>
                <strong>ผู้ดูแลปัจจุบัน:</strong>{" "}
                <span className="text-rose-600 font-semibold">
                  {currentCompanionName || "ยังไม่มีผู้รับงาน (รอรับงาน)"}
                </span>
              </p>
              <p>
                <strong>สถานที่:</strong> {destinationName || "-"}
              </p>
            </div>

            {/* Preset reasons */}
            <div className="mt-5 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                เหตุผลในการยกเลิก
              </label>

              <div className="space-y-2">
                {[
                  "ลูกค้าขอยกเลิกคำขอ",
                  "ไม่มีผู้ดูแลรับงาน / เกินเวลานัดหมาย",
                  "ลูกค้าติดต่อผู้ดูแลไม่ได้",
                  "ผู้ดูแลขอสละสิทธิ์กะทันหัน",
                  "อื่นๆ",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-medium cursor-pointer transition ${
                      cancelReasonPreset === reason
                        ? "border-sky-500 bg-sky-50/40 text-slate-900 font-semibold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={cancelReasonPreset === reason}
                      onChange={() => setCancelReasonPreset(reason)}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReasonPreset === "อื่นๆ" && (
                <textarea
                  rows={2}
                  placeholder="ระบุเหตุผลในการยกเลิก..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-sky-500"
                />
              )}
            </div>

            {/* Quick Rebook checkbox */}
            <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rebookAfterCancel}
                  onChange={(e) => setRebookAfterCancel(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-sky-900">
                    เปิดระบบจองด่วนเลือก Companion ใหม่ให้ลูกค้าทันที
                  </span>
                  <p className="mt-0.5 text-[11px] text-sky-700">
                    หลังจากยกเลิก จะเปิดหน้าต่างให้คุณเลือกผู้ดูแลที่ว่างเพื่อมอบหมายงานนี้ให้ลูกค้าต่อทันที
                  </p>
                </div>
              </label>
            </div>

            {cancelError && (
              <p className="mt-4 text-xs font-medium text-rose-600">
                {cancelError}
              </p>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isPending}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                ย้อนกลับ
              </button>

              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={isPending}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isPending
                  ? "กำลังยกเลิก..."
                  : rebookAfterCancel
                  ? "ยกเลิกและจองด่วนต่อ"
                  : "ยืนยันยกเลิกงาน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────── */}
      {/* Modal 2: Express Re-booking (จองด่วนเลือก Companion ใหม่) */}
      {/* ───────────────────────────────────────────── */}
      {showRebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-lg font-bold text-sky-700">
                  ⚡
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    จองด่วนเลือก Companion ใหม่ให้ลูกค้า
                  </h3>
                  <p className="text-xs text-slate-500">
                    ข้อมูลคำขอเดิมของลูกค้าจะยังคงเดิมทั้งหมด โดยระบบจะเปลี่ยนผู้ดูแลเป็นคนใหม่ที่คุณเลือกให้ทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRebookModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Job summary bar */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2 mb-2">
                  <span className="font-semibold text-slate-600">
                    รายละเอียดคำขอเดิมของลูกค้า:{" "}
                    <strong className="text-slate-900">{customerName}</strong>
                  </span>
                  <span className="font-bold text-sky-700">
                    ค่าบริการ {offeredFee != null ? `${offeredFee.toLocaleString()} บาท` : "-"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500">วันที่: </span>
                    <strong>{serviceDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">เวลา: </span>
                    <strong>{startTime?.slice(0, 5)} น.</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">ปลายทาง: </span>
                    <strong>{destinationName || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ หรือเบอร์โทรศัพท์ Companion..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-sky-500"
                  />

                  {/* Filter tabs */}
                  <div className="flex shrink-0 gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterMode("all")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                        filterMode === "all"
                          ? "bg-white text-sky-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ทั้งหมด ({companions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("time")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                        filterMode === "time"
                          ? "bg-white text-sky-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ตรงเวลาว่าง
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("area")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                        filterMode === "area"
                          ? "bg-white text-sky-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ตรงพื้นที่
                    </button>
                  </div>
                </div>
              </div>

              {/* Companions List */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  เลือกผู้ดูแล (Companion) ที่พร้อมให้บริการ ({filteredCompanions.length})
                </p>

                {loadingCompanions ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    กำลังโหลดรายชื่อผู้ดูแลและตรวจสอบตารางเวลา...
                  </div>
                ) : companionError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                    {companionError}
                  </div>
                ) : filteredCompanions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-400">
                    ไม่พบผู้ดูแลที่ตรงตามเงื่อนไข ลองเปลี่ยนตัวกรองหรือคำค้นหา
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {filteredCompanions.map((comp) => {
                      const isSelected = selectedCompanionId === comp.id;
                      return (
                        <div
                          key={comp.id}
                          onClick={() => setSelectedCompanionId(comp.id)}
                          className={`flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                            isSelected
                              ? "border-sky-600 bg-sky-50/50 shadow-xs ring-1 ring-sky-600"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                          }`}
                        >
                          <input
                            type="radio"
                            name="selected_companion"
                            checked={isSelected}
                            onChange={() => setSelectedCompanionId(comp.id)}
                            className="mt-1 text-sky-600 focus:ring-sky-500"
                          />

                          {/* Avatar */}
                          {comp.avatarUrl ? (
                            <img
                              src={comp.avatarUrl}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                              {(comp.fullName || "C").charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-slate-900 text-sm truncate">
                                {comp.fullName || "ไม่ระบุชื่อ"}
                              </p>
                              {comp.ratingAvg > 0 && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                                  ★ {comp.ratingAvg.toFixed(1)}
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-xs text-slate-500">
                              เบอร์โทร: {comp.phone || "-"}
                            </p>

                            {/* Match Badges */}
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {comp.isTimeAvailable && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                                  ✓ ตารางเวลาว่างตรงกัน
                                </span>
                              )}

                              {comp.isAreaMatch && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                                  📍 ให้บริการพื้นที่นี้
                                </span>
                              )}

                              {comp.hasConflict && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                  ⚠️ มีคิวงานอื่นในวันเดียวกัน
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status selection after booking */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  สถานะคำขอหลังทำการจองด่วน
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                      targetStatus === "pending"
                        ? "border-sky-600 bg-white shadow-xs font-semibold text-sky-900"
                        : "border-slate-200 bg-slate-100/60 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="target_status"
                      checked={targetStatus === "pending"}
                      onChange={() => setTargetStatus("pending")}
                      className="mt-0.5 text-sky-600"
                    />
                    <div>
                      <p className="font-bold">รอ Companion ตอบรับ (Pending)</p>
                      <p className="mt-0.5 text-[11px] font-normal text-slate-500">
                        ส่งคำขอเข้ากล่องงานของผู้ดูแลใหม่ เพื่อให้ผู้ดูแลกดรับงาน
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                      targetStatus === "accepted"
                        ? "border-sky-600 bg-white shadow-xs font-semibold text-sky-900"
                        : "border-slate-200 bg-slate-100/60 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="target_status"
                      checked={targetStatus === "accepted"}
                      onChange={() => setTargetStatus("accepted")}
                      className="mt-0.5 text-sky-600"
                    />
                    <div>
                      <p className="font-bold">รับงานทันที (Accepted)</p>
                      <p className="mt-0.5 text-[11px] font-normal text-slate-500">
                        สำหรับกรณีแอดมินโทรประสานงานและคอนเฟิร์มกับ Companion แล้ว
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {rebookError && (
                <p className="text-xs font-medium text-rose-600">{rebookError}</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 p-5">
              <span className="text-xs text-slate-400">
                {selectedCompanionId
                  ? "เลือกผู้ดูแลแล้ว พร้อมส่งคำขอ"
                  : "กรุณาคลิกเลือกผู้ดูแล 1 ท่านจากรายการ"}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRebookModal(false)}
                  disabled={isPending}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleRebookSubmit}
                  disabled={isPending || !selectedCompanionId}
                  className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isPending ? "กำลังบันทึก..." : "ยืนยันจองด่วนให้ลูกค้า"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
