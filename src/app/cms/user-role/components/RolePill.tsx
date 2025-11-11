import type { Role } from "../../../../../lib/admin";
import { labelRole } from "./roleLabel";

const COLORS: Record<Role, string> = {
  superadmin: "bg-pink-500/20 text-pink-300",
  admin: "bg-amber-500/20 text-amber-300",
  mentor: "bg-emerald-500/20 text-emerald-300",
  peserta: "bg-slate-500/20 text-slate-300",
};

export function RolePill({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${COLORS[role]}`}
    >
      {labelRole(role)}
    </span>
  );
}
