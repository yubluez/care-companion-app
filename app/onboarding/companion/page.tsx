"use client";

import PersonalInfoSection from "@/components/onboarding/companion/PersonalInfoSection";
import CompanionInfoSection from "@/components/onboarding/companion/CompanionInfoSection";
import ServiceAreaSection from "@/components/onboarding/companion/ServiceAreaSection";
import AvailabilitySection from "@/components/onboarding/companion/AvailabilitySection";
import IdentityDocumentSection from "@/components/onboarding/companion/IdentityDocumentSection";

import { useCompanionOnboarding } from "@/hooks/useCompanionOnboarding";

export default function CompanionOnboardingPage() {
  const form = useCompanionOnboarding();

  if (form.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            สมัครเป็น Companion
          </h1>

          <p className="text-slate-500 mt-2">
            กรอกข้อมูลเพื่อสมัครเป็นผู้ให้บริการ Care Companion
          </p>
        </div>

        {form.error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {form.error}
          </div>
        )}

        <form onSubmit={form.handleSubmit} className="space-y-6">
          <PersonalInfoSection
            fullName={form.fullName}
            setFullName={form.setFullName}
            email={form.email}
            phone={form.phone}
            setPhone={form.setPhone}
            avatarPreview={form.avatarPreview}
            avatarInputRef={form.avatarInputRef}
            onAvatarChange={form.handleAvatarChange}
          />

          <CompanionInfoSection
            bio={form.bio}
            setBio={form.setBio}
            experience={form.experience}
            setExperience={form.setExperience}
          />

          <ServiceAreaSection
            areas={form.areas}
            selectedAreas={form.selectedAreas}
            onToggleArea={form.toggleArea}
          />

          <AvailabilitySection
            availability={form.availability}
            onUpdateAvailability={form.updateAvailability}
          />

          <IdentityDocumentSection
            documentFile={form.documentFile}
            documentInputRef={form.documentInputRef}
            onDocumentChange={form.handleDocumentChange}
          />

          <button
            type="submit"
            disabled={form.submitting}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
          >
            {form.submitting ? "กำลังส่งใบสมัคร..." : "ส่งใบสมัคร"}
          </button>
        </form>
      </div>
    </main>
  );
}
