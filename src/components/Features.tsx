"use client";
import SectionHeader from "./SectionHeader";
import Card from "./ui/Card";
import { motion } from "framer-motion";

const features = [
  { title: "Mentor Berpengalaman", desc: "Asisten dosen & kakak tingkat terbaik, materi tepat sasaran.", icon: "👨‍🏫" },
  { title: "Materi Terstruktur", desc: "Silabus mingguan, rangkuman, dan latihan berjenjang.", icon: "📚" },
  { title: "Rekaman & Catatan", desc: "Setiap sesi terekam, disertai catatan praktis yang mudah direview.", icon: "🎥" },
  { title: "Forum Tanya-Jawab", desc: "Diskusi aktif setiap pekan untuk memastikan konsep benar-benar paham.", icon: "💬" },
];

export default function Features() {
  return (
    <section className="relative py-16">
        <SectionHeader
            eyebrow="Keunggulan"
            title="Kenapa memilih TC Mudah?"
            description="Fokus kami adalah pengalaman belajar yang efektif, konsisten, dan ramah pemula."
            align="center"
        />

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.35, delay: i * 0.05 }}>
                <Card fixedHeight={200}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-white/10">
                    <span className="text-lg">{f.icon}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{f.desc}</p>
                <div className="mt-auto" />
                </Card>
            </motion.div>
            ))}
        </div>
    </section>
  );
}