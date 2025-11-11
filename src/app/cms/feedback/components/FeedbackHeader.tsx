"use client";

import Link from "next/link";
import type { ClassItem } from "../../../../../lib/classes";

type Props = {
  classes: ClassItem[];
  selectedClassId: string;
  onChangeClass: (id: string) => void;
  err: string | null;
};

export function FeedbackHeader({
  classes,
  selectedClassId,
  onChangeClass,
  err,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">
            Ringkasan Feedback
          </div>
          <h1 className="text-xl font-bold text-white">
            Feedback Peserta (Anonim)
          </h1>
        </div>
        <Link
          href="/cms"
          className="text-sm text-white/70 hover:text-white underline"
        >
          ← Kembali ke CMS
        </Link>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs text-white/70">
            Filter Kelas
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => onChangeClass(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white focus:outline-none"
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && (
        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {err}
        </div>
      )}
    </div>
  );
}
