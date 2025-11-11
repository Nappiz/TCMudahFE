"use client";

import { Plus, Lock } from "lucide-react";

type Props = {
  isReadonly: boolean;
  onAdd: () => void;
};

export function MentorHeader({ isReadonly, onAdd }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Mentor</h2>
        <p className="text-sm text-white/60">
          Kelola daftar mentor.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isReadonly ? (
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            <Lock className="h-3.5 w-3.5" /> Read-only
          </span>
        ) : (
          <button
            onClick={onAdd}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
          >
            <Plus className="h-4 w-4" /> Tambah Mentor
          </button>
        )}
      </div>
    </header>
  );
}
