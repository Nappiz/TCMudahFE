"use client";
import Container from "./ui/Container";
import { Button } from "./ui/Button";
import Link from "next/link";

export default function ClosingCTA() {
  return (
    <section className="relative py-16 sm:py-20">
        <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_20%_0%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(99,102,241,0.14),transparent_60%)]" />
            <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(120deg,rgba(255,255,255,0.6),transparent_30%,transparent_70%,rgba(255,255,255,0.6))]" />
        </div>

        <Container>
            <div className="glass ring-shadow relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)] bg-gradient-to-b from-cyan-400/10 to-transparent" />

            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Ready to level up?
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    Mulai belajar bareng <span className="text-brand">TC Mudah</span> hari ini.
                </h2>
                <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: "var(--muted)" }}>
                    Daftar sekarang untuk akses modul, latihan, rekaman, dan sesi tanya-jawab setiap pekan.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link href="/daftar-kelas">
                    <Button variant="secondary" size="lg">Daftar Sekarang</Button>
                    </Link>
                    <Link href="#kontak">
                    <Button variant="primary" size="lg">Kontak Kami</Button>
                    </Link>
                </div>

                <dl className="mt-6 grid grid-cols-3 gap-4 max-w-md">
                    <Stat label="Peserta" value="100+" />
                    <Stat label="Modul" value="12" />
                    <Stat label="Kepuasan" value="90%+" />
                </dl>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white">Yang kamu dapat</h3>
                <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
                    {[
                    "Silabus terstruktur semester 1–2",
                    "Latihan mingguan + pembahasan",
                    "Rekaman setiap sesi + catatan",
                    "Forum diskusi & tanya-jawab",
                    ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{t}</span>
                    </li>
                    ))}
                </ul>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    {[
                    { k: "Platform", v: "Online" },
                    { k: "Durasi", v: "8–12 pekan" },
                    { k: "Bahasa", v: "Indonesia" },
                    ].map((x) => (
                    <div key={x.k} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                        <div className="text-[11px] text-white/60">{x.k}</div>
                        <div className="text-sm font-medium text-white">{x.v}</div>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            </div>
        </Container>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
        <dt className="text-[11px] text-white/60">{label}</dt>
        <dd className="text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
