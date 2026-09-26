"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE, fetchCatalog } from "../../../lib/api";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type Me = { id: string; email: string; full_name: string; role: Role };
type Enrollment = {
  id: string;
  user_id: string;
  class_id: string;
  active: boolean;
};
type ClassItem = {
  id: string;
  title: string;
  description: string;
  visible?: boolean;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
  if (!response.ok)
    throw new Error((await response.text()) || response.statusText);
  return (await response.json()) as T;
}

function getClassHref(title: string) {
  return `/peserta/kelas/${encodeURIComponent(title.replace(/\s+/g, "-").toLowerCase())}`;
}

export default function PesertaIndex() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [myClasses, setMyClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const currentUser = await api<Me>("/me");
        if (cancelled) return;
        setMe(currentUser);

        if (currentUser.role === "peserta") {
          const accessResponse = await fetch(`${API_BASE}/me/has-access`, {
            credentials: "include",
          });
          const { has_access: hasAccess } = await accessResponse.json();

          if (!hasAccess) {
            router.replace("/");
            return;
          }

          const enrollments = await api<Enrollment[]>("/enrollments/me");
          const activeIds = enrollments
            .filter((enrollment) => enrollment.active)
            .map((enrollment) => enrollment.class_id);

          if (activeIds.length > 0) {
            const catalog = await fetchCatalog();
            const enrolledClasses = catalog.classes.filter((classItem) =>
              activeIds.includes(classItem.id),
            );
            setMyClasses(enrolledClasses);
          }
        } else {
          const classes = await api<ClassItem[]>("/admin/classes");
          setMyClasses(classes || []);
        }
      } catch (errorValue: unknown) {
        console.error(errorValue);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-3 border-b border-white/[0.08] pb-8">
          <div className="h-3 w-32 rounded-full bg-white/[0.08]" />
          <div className="h-9 w-72 max-w-full rounded-full bg-white/[0.08]" />
          <div className="h-4 w-[30rem] max-w-full rounded-full bg-white/[0.06]" />
        </div>
        <div className="h-5 w-36 rounded-full bg-white/[0.08]" />
        <div className="grid gap-5 md:grid-cols-2">
          {["one", "two", "three", "four"].map((key) => (
            <div
              key={key}
              className="h-60 rounded-2xl border border-white/[0.08] bg-white/[0.035]"
            />
          ))}
        </div>
      </div>
    );
  }

  const firstName = me?.full_name?.split(" ")[0] || "Peserta";

  return (
    <div className="space-y-8 pb-10">
      <header className="relative border-b border-white/[0.08] pb-8 pt-4">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-400/[0.07] blur-3xl"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
              Dashboard peserta
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Halo, {firstName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Lanjutkan kelas yang sedang kamu ikuti dan buka materi yang ingin
              dipelajari hari ini.
            </p>
          </div>

          <div className="shrink-0 md:text-right">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {myClasses.length}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
              kelas aktif
            </p>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035]">
        <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/60">
              Ruang belajar
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              Kelas kamu
            </h2>
          </div>
          <p className="text-xs text-white/35">
            Pilih kelas untuk membuka materi
          </p>
        </div>

        {myClasses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-white">
              Belum ada kelas aktif
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Daftar kelas yang tersedia untuk mulai membangun rutinitas belajar
              kamu.
            </p>
            <Link
              href="/daftar-kelas"
              className="mt-5 inline-flex rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Cari kelas
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 p-5 md:grid-cols-2">
            {myClasses.map((classItem, index) => (
              <Link
                key={classItem.id}
                href={getClassHref(classItem.title)}
                className="group block h-full"
              >
                <motion.article
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="relative flex h-full min-h-60 flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-slate-950/35 p-6 transition duration-300 hover:border-cyan-300/35 hover:bg-white/[0.045]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-300/[0.08] via-transparent to-transparent opacity-60 transition duration-300 group-hover:opacity-100"
                  />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/65">
                        Kelas aktif
                      </span>
                      <span className="text-xs font-medium text-white/25">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-5 line-clamp-2 text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-cyan-100">
                      {classItem.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-400">
                      {classItem.description ||
                        "Materi pembelajaran dan pertemuan kelas tersedia di sini."}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
                      <span className="text-xs text-white/35">
                        Materi kelas
                      </span>
                      <span className="text-sm font-semibold text-white transition-colors group-hover:text-cyan-200">
                        Buka kelas
                      </span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
