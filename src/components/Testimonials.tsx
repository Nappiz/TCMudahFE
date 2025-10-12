"use client";
import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
import Card from "./ui/Card";
import { motion } from "framer-motion";

type Item = { id: string; name: string; text: string; visible: boolean; created_at?: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function Testimonials() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/testimonials`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(await safeText(res));
        const data = (await res.json()) as Item[];
        if (!cancel) setItems(data ?? []);
      } catch (e: any) {
        console.warn("Testimonials fetch error:", e?.message || e);
        if (!cancel) {
          setErr(e?.message ?? "Gagal memuat testimoni.");
          setItems([]); // empty state
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <section id="testimoni" className="relative py-16">
      <SectionHeader eyebrow="Testimoni" title="Kata mereka tentang TC Mudah" align="center" />
      {err && <p className="mb-4 text-center text-sm text-red-300">{err}</p>}

      {!items ? (
        // skeleton
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden" fixedHeight={210}>
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-5/6 rounded bg-white/10" />
                <div className="h-4 w-4/5 rounded bg-white/10" />
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-6 h-4 w-1/3 rounded bg-white/10" />
              </div>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        // empty state
        <div className="mx-auto mt-4 max-w-2xl">
          <Card className="text-center py-10">
            <div className="text-white/70 text-sm">Tidak ada testimoni.</div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Card className="relative overflow-hidden" fixedHeight={210}>
                <div className="pointer-events-none absolute -top-10 -left-6 text-8xl text-white/10">“</div>
                <p className="text-white/80">{q.text}</p>
                <div className="mt-auto" />
                <footer className="mt-4 text-sm text-white/60">— {q.name}</footer>
                <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:linear-gradient(to_bottom,black,transparent_80%)] bg-gradient-to-b from-cyan-400/10 to-transparent" />
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

async function safeText(res: Response) {
  try {
    const t = await res.text();
    return t || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}
