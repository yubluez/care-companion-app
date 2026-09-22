import Link from "next/link";
import { getUser, signOut } from "@/lib/actions/auth";
import NavBarCus from "@/components/customer/NavBarCus";

export default async function CustomerDashboard() {
  const user = await getUser();
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "คุณลูกค้า";

  return (
    <div className="max-full">
      <NavBarCus />
      Hi customer
    </div>
  );
}
