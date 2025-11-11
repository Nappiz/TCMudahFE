"use client";

import { Search, Users } from "lucide-react";
import type { User } from "../api/admin";

type Props = {
  loading: boolean;
  users: User[];
  filteredUsers: User[];
  selectedUserId: string;
  q: string;
  onQueryChange: (value: string) => void;
  onSelectUser: (id: string) => void;
};

export default function UsersSidebar({
  loading,
  users,
  filteredUsers,
  selectedUserId,
  q,
  onQueryChange,
  onSelectUser,
}: Props) {
  const hasAnyUser = users.length > 0;

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
          <Users className="h-4 w-4" /> Peserta Approved
        </div>
      </div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari nama / email…"
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
        />
      </div>

      <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/60">
            Memuat…
          </div>
        ) : !hasAnyUser ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/60">
            Tidak ada peserta.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/60">
            Tidak ada hasil untuk pencarian ini.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const active = selectedUserId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onSelectUser(u.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition
                ${
                  active
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="font-medium text-white">{u.full_name}</div>
                <div className="text-xs text-white/60">{u.email}</div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
