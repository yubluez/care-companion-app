import type { UserRole } from "./types";

type Props = {
  role: UserRole;
};

export default function RoleBadge({ role }: Props) {
  if (role === "companion") {
    return (
      <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
        Companion
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
      Customer
    </span>
  );
}
