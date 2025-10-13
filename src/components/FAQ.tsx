"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "./ui/Container";
import SectionHeader from "./SectionHeader";

type Item = { q: string; a: string };

const faqs: Item[] = [
  {
    q: "Apa itu TC Mudah?",
    a: "TC Mudah adalah program tutoring untuk mahasiswa baru Informatika ITS (semester 1–2). Kamu dapat materi terstruktur, sesi pembahasan mingguan, rekaman, serta rangkuman praktis.",
  },
  {
    q: "Apakah materi mengikuti kurikulum Teknik Informatika ITS?",
    a: "Ya. Silabus disusun mengikuti mata kuliah dasar Teknik Informatika ITS seperti Dasar Pemrograman, Kalkulus, Struktur Data, dan lainnya. Fokus pada konsep inti + latihan soal.",
  },
  {
    q: "Bagaimana format pertemuannya?",
    a: "Sesi live mingguan via online meeting. Setelahnya tersedia rekaman, catatan ringkas, dan latihan yang dapat kamu akses kapan saja.",
  },
  {
    q: "Bagaimana jika aku tidak bisa menghadiri kelas karena ada urusan?",
    a: "Setiap sesi kelas online akan direkam dan diberikan kepada setiap mahasiswa, sehingga kamu dapat mengikuti materi yang terlewat pada waktu yang lebih sesuai.",
  },
  {
    q: "Apakah dapat bertanya kepada mentor walaupun diluar jam kelas?",
    a: "Boleh banget dong! tapi dengan catatan tidak boleh menanyakan disaat sedang Kuis/EAS berlangsung yaa!!",
  },
  {
    q: "Apakah ada kelas offline?",
    a: "Untuk saat ini, kami hanya menyediakan kelas online!",
  },
  {
    q: "Kok saya tidak dapat login?",
    a: "Untuk saat ini, Website kami kurang support untuk IOS, MAC, atau Mode Incognito. Apabila masih terkendala, silahkan hubungi kontak dibawah ini.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_-10%,rgba(34,211,238,0.08),transparent_60%),radial-gradient(800px_500px_at_85%_0%,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(120deg,rgba(255,255,255,0.6),transparent_30%,transparent_70%,rgba(255,255,255,0.6))]" />
      </div>

      <Container>
        <SectionHeader
          eyebrow="FAQ"
          title="Pertanyaan yang Sering Diajukan"
          description="Kalau masih ada yang ingin ditanyakan, hubungi kami via WhatsApp ya."
          align="center"
        />

        <ul className="mx-auto mt-6 max-w-3xl divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
          {faqs.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <li key={item.q}>
                <button
                  className="cursor-pointer group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.03] sm:px-5"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                >
                  <span
                    className={`mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-md border text-[11px] transition-all
                    ${
                      isOpen
                        ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300 rotate-45"
                        : "border-white/15 bg-white/5 text-white/60 group-hover:text-white/80"
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                  <span className="flex-1 text-base font-medium text-white/90 sm:text-lg">
                    {item.q}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="px-4 pb-4 pt-0 text-white/70 sm:px-5">
                        <p className="leading-relaxed">{item.a}</p>
                        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto mt-8 max-w-3xl text-center text-sm text-white/60">
          Tidak menemukan jawaban?{" "}
          <a
            href="https://wa.me/6281519291757"
            className="text-white underline underline-offset-4 hover:no-underline"
          >
            Hubungi kami
          </a>
          .
        </div>
      </Container>
    </section>
  );
}
