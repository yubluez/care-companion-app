import EmergencyContactButton from "@/components/customer/EmergencyContactButton";
import NavBarCus from "@/components/customer/NavBarCus";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBarCus />

      {children}

      <EmergencyContactButton />
    </div>
  );
}
