"use client";
import Container from "./ui/Container";
import { Button } from "./ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

const videoInput = "https://youtu.be/Gp495cTLFKo?si=d8Y6gPCUR0wZAgWN";

const WHATSAPP_URL = `https://wa.me/6281519291757?text=${encodeURIComponent(
  "Halo TC Mudah, saya mengalami kendala login. Mohon bantuannya ya 🙏"
)}`;

function extractYouTubeId(input: string): string | null {
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  try {
    const u = new URL(input);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const seg = u.pathname.split("/").filter(Boolean);
      return seg[0] || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const seg = u.pathname.split("/").filter(Boolean);
      const idx = seg[0] === "embed" || seg[0] === "shorts" ? 1 : -1;
      if (idx >= 0 && seg[idx]) return seg[idx];
    }
  } catch {}
  const m = input.match(/[A-Za-z0-9_-]{11}/);
  return m ? m[0] : null;
}

const videoId = extractYouTubeId(videoInput) ?? "Gp495cTLFKo";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.22),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_30%,transparent_70%,rgba(255,255,255,0.06))]" />
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)] opacity-40">
          <svg className="h-full w-full text-white/10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="aurora" />
      </div>

      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              TC Mudah
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Belajar{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Mata Kuliah</span>{" "}
              TC jadi{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Mudah</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              TC Mudah adalah tutoring online untuk Mahasiswa Baru Teknik Informatika ITS. Materi
              terstruktur, mentor berpengalaman, dan dukungan komunitas membuat belajarmu fokus serta menyenangkan.
            </p>

            <div className="relative mt-8 flex flex-wrap items-center gap-3">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 blur-2xl">
                <div className="mx-6 h-16 rounded-full bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-indigo-400/30" />
              </div>
              <Link href="/daftar-kelas">
                <Button variant="secondary">Daftar Kelas Sekarang</Button>
              </Link>
              <a
                href={`https://drive.google.com/file/d/1iUxvc9C-_8lNf8aIx3FZN_wFjXfsbnox/view?usp=sharing`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="primary">Guidebook</Button>
              </a>
            </div>

            <ul className="mt-8 grid max-w-xl grid-cols-2 gap-3 text-sm text-white/70">
              {[
                "Materi terstruktur & rangkuman",
                "Mentor asisten dosen & kakak tingkat",
                "Rekaman sesi",
                "Diskusi & tanya-jawab setiap saat",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 max-w-xl"
            >
              <div className="relative rounded-2xl p-[1px]">
                <div
                  className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_40deg,rgba(34,211,238,0.35),rgba(59,130,246,0.35),rgba(99,102,241,0.35),rgba(34,211,238,0.35))] opacity-70 blur-md"
                  aria-hidden
                />
                <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                  <div className="flex items-start gap-3 p-4">
                    {/* Icon chip with gradient ring */}
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-400/30 to-indigo-400/30 blur-sm"
                        aria-hidden
                      />
                      <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-900/60 ring-1 ring-white/10">
                        <svg className="h-5 w-5 text-cyan-300" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" />
                          Bantuan
                        </span>
                      </div>

                      <h3 className="mt-2 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-base font-semibold text-transparent">
                        Ada kendala login?
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/70">
                        Apabila kamu mengalami masalah <span className="text-white/90">login</span>, hubungi kami melalui
                        WhatsApp.
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                          <Button
                            variant="secondary"
                            className="!bg-emerald-500/20 !text-emerald-200 hover:!bg-emerald-500/30"
                          >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M20.5 11.5a8.5 8.5 0 1 1-15.08 5.03L4 20l3.6-.94A8.5 8.5 0 1 1 20.5 11.5Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8.8 9.7c.2-1 .9-1.1 1.3-1.1.3 0 .6 0 .9.6.3.7 1 2 1.1 2.1.1.2.2.4 0 .7-.2.3-.3.5-.6.7-.2.2-.5.5.2 1.1.7.6 1.4 1 2.4 1.4 1 .3 1.2 0 1.4-.2.2-.2.7-.8.9-1 .2-.2.3-.2.6-.1.3.1 1.9.9 2.1 1 .2.1.3.2.3.4 0 .2.1 1.3-.5 1.9-.6.6-1.6 1.1-3 1-1.4 0-3.1-.6-4.5-1.5-1.4-.9-2.5-2.3-3.1-3.3-.6-1-.8-1.8-.9-2.6 0-.8.1-1.4.3-1.6Z"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Chat via WhatsApp
                          </Button>
                        </a>

                        <Link href="#faq" className="text-xs text-white/60 underline underline-offset-4 hover:text-white/80">
                          Lihat FAQ
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* ====== /Lapor Kendala ====== */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-1 shadow-2xl backdrop-blur">
              <div className="relative h-full w-full rounded-2xl bg-black">
                <iframe
                  className="h-full w-full rounded-2xl"
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                  title="Preview Tutoring TC Mudah"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
