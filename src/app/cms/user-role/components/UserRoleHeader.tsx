// src/app/cms/user-role/components/UserRoleHeader.tsx
import type { User } from "../../../../../lib/admin";
import { RolePill } from "./RolePill";

type Props = {
  me: User | null;
  search: string;
  onSearchChange: (value: string) => void;
};

export function UserRoleHeader({ me, search, onSearchChange }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Kelola Role Pengguna</h2>
          <p className="text-sm text-white/60">Settings role tiap user</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/70">Role aktif:</div>
          {me && <RolePill role={me.role} />}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama / email / NRP / role…"
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 pr-9 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            ⌘K
          </span>
        </div>
      </div>
    </div>
  );
}
