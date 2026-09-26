"use client";

import FadeIn from "./ui/FadeIn";

type Mentor = {
  id: string;
  name: string;
  angkatan: number;
  achievements: string[];
};

function cleanAchievements(achievements: string[]) {
  return achievements.map((achievement) => achievement.trim()).filter(Boolean);
}

export default function MentorsClient({ data }: { data: Mentor[] | null }) {
  return (
    <section
      id="mentor"
      className="relative scroll-mt-20 overflow-hidden bg-slate-950 py-24 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.08),transparent_34%),radial-gradient(circle_at_90%_52%,rgba(14,165,233,0.06),transparent_30%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 border-b border-white/[0.08] pb-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
              Tim pengajar
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Mentor &amp; Asisten Dosen
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Belajar dari mereka yang sudah melewati tantangan akademik dan
              memahami cara menjelaskan konsep dengan jelas.
            </p>
          </div>
        </div>

        <div className="mt-10">
          {!data ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {["one", "two", "three", "four"].map((key) => (
                <div
                  key={key}
                  className="h-72 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.035]"
                />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-6 py-12 text-center text-sm text-slate-500">
              Data mentor belum tersedia.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {data.map((mentor, index) => {
                const achievements = cleanAchievements(mentor.achievements);

                return (
                  <FadeIn key={mentor.id} delay={index * 100}>
                    <article className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] transition duration-500 hover:border-cyan-300/35 hover:bg-white/[0.05]">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-300/[0.08] via-transparent to-transparent opacity-60 transition duration-500 group-hover:opacity-100"
                      />

                      <div className="relative flex h-full flex-col p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-6">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/65">
                              Mentor
                            </p>
                            <h3 className="mt-2 truncate text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-cyan-100 sm:text-2xl">
                              {mentor.name}
                            </h3>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                              Angkatan
                            </p>
                            <p className="mt-1 text-sm font-medium text-white/75">
                              {mentor.angkatan}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex-1 border-t border-white/[0.08] pt-5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                              Rekam jejak
                            </p>
                            <span className="text-xs text-white/35">
                              {achievements.length} prestasi
                            </span>
                          </div>

                          {achievements.length > 0 ? (
                            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                              {achievements.map(
                                (achievement, achievementIndex) => (
                                  <li
                                    key={`${mentor.id}-achievement-${achievementIndex}`}
                                    className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.07] bg-slate-950/25 px-3 py-3"
                                  >
                                    <span className="pt-0.5 text-[10px] font-semibold tracking-[0.12em] text-cyan-300/60">
                                      {String(achievementIndex + 1).padStart(
                                        2,
                                        "0",
                                      )}
                                    </span>
                                    <span className="min-w-0 text-sm leading-relaxed text-slate-300/75 transition-colors group-hover:text-slate-200">
                                      {achievement}
                                    </span>
                                  </li>
                                ),
                              )}
                            </ol>
                          ) : (
                            <p className="mt-4 text-sm text-white/35">
                              Belum ada prestasi yang ditambahkan.
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
