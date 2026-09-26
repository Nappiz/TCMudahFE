"use client";

import type { Mentor } from "../../../../../lib/mentors";

type Props = {
  list: Mentor[];
  isReadonly: boolean;
  actionsDisabled?: boolean;
  onEditRow: (mentor: Mentor) => void;
  onDeleteRow: (mentor: Mentor) => void;
};

export function MentorTable({
  list,
  isReadonly,
  actionsDisabled = false,
  onEditRow,
  onDeleteRow,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035]">
      <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Daftar mentor</h2>
          <p className="mt-1 text-xs text-white/45">
            {list.length} mentor siap dikelola
          </p>
        </div>
        <span className="text-xs text-white/35">
          {isReadonly
            ? "Hanya bisa melihat data"
            : "Perubahan tersimpan setelah disimpan"}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-white">Belum ada mentor</p>
          <p className="mt-1 text-sm text-white/45">
            Tambahkan mentor pertama dari tombol di atas.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {list.map((mentor) => {
            const achievements = (mentor.achievements ?? [])
              .map((item) => item.trim())
              .filter(Boolean);
            const displayName = mentor.name.trim() || "Mentor baru";

            return (
              <article
                key={mentor.id}
                className="p-5 transition hover:bg-white/[0.02]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/60">
                      Angkatan {mentor.angkatan || "-"}
                    </p>
                    <h3 className="mt-1 truncate text-base font-semibold text-white">
                      {displayName}
                    </h3>
                    <p className="mt-1 text-sm text-white/45">
                      {achievements.length} prestasi tercatat
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <span
                      className={
                        mentor.visible
                          ? "rounded-lg border border-emerald-300/20 bg-emerald-300/[0.08] px-2.5 py-1.5 text-xs font-medium text-emerald-200/80"
                          : "rounded-lg border border-white/[0.1] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-white/45"
                      }
                    >
                      {mentor.visible ? "Tampil" : "Disembunyikan"}
                    </span>
                    {!isReadonly ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditRow(mentor)}
                          disabled={actionsDisabled}
                          className="rounded-lg border border-cyan-300/20 px-3 py-1.5 text-xs font-medium text-cyan-100/80 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.08] hover:text-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRow(mentor)}
                          disabled={actionsDisabled}
                          className="rounded-lg border border-rose-400/20 px-3 py-1.5 text-xs font-medium text-rose-200/80 transition hover:border-rose-300/40 hover:bg-rose-300/[0.06] hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {achievements.slice(0, 4).map((achievement, index) => (
                    <div
                      key={`${mentor.id}-achievement-${index}`}
                      className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.07] bg-slate-950/25 px-3 py-2.5"
                    >
                      <span className="pt-0.5 text-[10px] font-semibold tracking-[0.12em] text-cyan-300/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 text-sm leading-relaxed text-white/65">
                        {achievement}
                      </span>
                    </div>
                  ))}
                  {achievements.length === 0 ? (
                    <p className="text-sm text-white/35">Belum ada prestasi.</p>
                  ) : null}
                  {achievements.length > 4 ? (
                    <p className="self-center text-xs text-white/35">
                      +{achievements.length - 4} prestasi lainnya
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
