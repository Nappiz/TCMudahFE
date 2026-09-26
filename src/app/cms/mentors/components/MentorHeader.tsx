type Props = {
  isReadonly: boolean;
  onAdd: () => void;
  total: number;
  visibleCount: number;
};

export function MentorHeader({
  isReadonly,
  onAdd,
  total,
  visibleCount,
}: Props) {
  return (
    <header className="border-b border-white/[0.08] pb-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/70">
            CMS / Mentor
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Mentor
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/50">
            Atur daftar mentor, prestasi, dan visibilitas profil publik.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6 sm:gap-8">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-white">
              {total}
            </p>
            <p className="mt-1 text-xs text-white/40">total mentor</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight text-white">
              {visibleCount}
            </p>
            <p className="mt-1 text-xs text-white/40">tampil publik</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {isReadonly ? (
          <span className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/50">
            Mode baca saja
          </span>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Tambah mentor
          </button>
        )}
      </div>
    </header>
  );
}
