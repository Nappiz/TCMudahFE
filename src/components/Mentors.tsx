"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/SectionHeader";

type Mentor = {
  id: string;
  name: string;
  angkatan: number;
  achievements: string[];
  visible: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function Mentors() {
  const [data, setData] = useState<Mentor[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/mentors`, { credentials: "include" });
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch {
        setData([]);
      }
    })();
  }, []);

  return (
    <section id="mentor" className="relative py-16">
      {/* soft BG */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_480px_at_18%_-10%,rgba(34,211,238,0.10),transparent_60%),radial-gradient(820px_480px_at_85%_0%,rgba(99,102,241,0.10),transparent_60%)]" />
      </div>

      <Container>
        <SectionHeader
          eyebrow="Mentor"
          title="Kenalan dengan Mentor TC Mudah"
          description="Kakak tingkat dan asisten dosen yang siap bantu kamu step-by-step."
          align="center"
        />

        {data && data.length === 0 && (
          <p className="mt-6 text-center text-white/60">(tidak ada data)</p>
        )}

        {!data && (
          <div className="mx-auto mt-6 max-w-2xl animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Memuat mentor…
          </div>
        )}

        {data && data.length > 0 && (
          <div className="mt-6 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-gradient-to-b from-cyan-400/10 to-transparent" />
                <div className="relative flex items-center gap-3">
                  <div className="grid h-12 w-12 flex-none place-items-center rounded-xl border border-white/10 bg-white/10 text-lg font-semibold text-white/90">
                    {initials(m.name)}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{m.name}</div>
                    <div className="text-xs text-white/60">Angkatan {m.angkatan}</div>
                  </div>
                </div>

                <ul className="relative mt-4 space-y-2 text-sm text-white/75">
                  {m.achievements.slice(0, 5).map((a, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-cyan-400/70" />
                      <span className="leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
