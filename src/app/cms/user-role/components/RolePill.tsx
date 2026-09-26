import type { Role } from "../../../../../lib/admin";
import { labelRole } from "./roleLabel";

const COLORS: Record<Role, string> = {
  superadmin: "border-violet-300/15 bg-violet-300/[0.08] text-violet-200",
  admin: "border-cyan-300/15 bg-cyan-300/[0.08] text-cyan-100",
  mentor: "border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-200",
  peserta: "border-white/[0.09] bg-white/[0.035] text-white/60",
};

export function RolePill({ role }: { role: Role }) {
  return (
    <span
      className={
        "inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none tracking-wide " +
        COLORS[role]
      }
    >
      {labelRole(role)}
    </span>
  );
}
