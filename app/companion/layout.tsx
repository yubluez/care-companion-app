import type { ReactNode } from "react";

import CompanionNavbar from "@/components/companion/layout/CompanionNavbar";

export default function CompanionLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CompanionNavbar />

      {children}
    </>
  );
}
