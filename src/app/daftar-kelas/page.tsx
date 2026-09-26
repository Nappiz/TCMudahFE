"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type {
  Catalog,
  ClassItem,
  Curriculum,
  Me,
  Mentor,
  PackageItem,
} from "@/types/catalog";
import { api, fetchCatalog } from "../../../lib/api";
import CartButton from "./CartButton";
import CartDrawer from "./CartDrawer";
import ClassCard from "./ClassCard";

export default function DaftarKelasPage() {
  const authChecked = useRequireAuth();
  const router = useRouter();
  const { confirm, modal: confirmModal } = useConfirmModal();

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!authChecked) return;
    let cancel = false;

    const refreshCatalog = async () => {
      try {
        const data = await fetchCatalog();
        if (!cancel) {
          setCatalog(data);
          setErr(null);
        }
      } catch (error: unknown) {
        if (!cancel) {
          setErr(
            error instanceof Error ? error.message : "Gagal memuat katalog",
          );
        }
      }
    };

    const handleFocus = () => {
      void refreshCatalog();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshCatalog();
      }
    };

    (async () => {
      try {
        const [meRes, settingRes] = await Promise.all([
          api<Me>("/me"),
          fetch("/api/settings/disable_daftar_kelas"),
        ]);

        const isStaff = meRes.role === "admin" || meRes.role === "superadmin";

        let disabled = false;
        if (settingRes.ok) {
          const settingData = await settingRes.json();
          disabled = settingData.value === "true";
        }

        if (disabled && !isStaff && !cancel) {
          router.replace("/");
          return;
        }

        await refreshCatalog();
      } catch (error: unknown) {
        if (!cancel) {
          setErr(
            error instanceof Error ? error.message : "Gagal memuat katalog",
          );
        }
      }
    })();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancel = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authChecked, router]);

  const allItems = useMemo(() => {
    if (!catalog) return [];
    return [...(catalog.packages || []), ...(catalog.classes || [])];
  }, [catalog]);

  const { lines, totalCount, addClass, addPackage, remove, clear } =
    useLocalCart();

  const idxMentor = useMemo(() => {
    const m = new Map<string, Mentor>();
    catalog?.mentors.forEach((x) => {
      m.set(x.id, x);
    });
    return m;
  }, [catalog]);

  const idxCur = useMemo(() => {
    const m = new Map<string, Curriculum>();
    catalog?.curriculum.forEach((x) => {
      m.set(x.id, x);
    });
    return m;
  }, [catalog]);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const s = q.trim().toLowerCase();

    if (!s) return allItems;

    return allItems.filter((item: ClassItem | PackageItem) => {
      const mentorIds = "mentor_ids" in item ? item.mentor_ids : [];
      const curriculumIds = "curriculum_ids" in item ? item.curriculum_ids : [];
      const mentorsTxt = mentorIds
        .map((id: string) => idxMentor.get(id)?.name?.toLowerCase() ?? "")
        .join(" ");
      const curs = curriculumIds
        .map((id: string) => {
          const cur = idxCur.get(id);
          return (cur?.name || cur?.code || "").toLowerCase();
        })
        .join(" ");

      return (
        item.title.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s) ||
        mentorsTxt.includes(s) ||
        curs.includes(s)
      );
    });
  }, [catalog, allItems, q, idxMentor, idxCur]);

  const total = useMemo(() => {
    if (!catalog) return 0;
    const classById = new Map(catalog.classes.map((item) => [item.id, item]));
    const packageById = new Map(
      catalog.packages.map((item) => [item.id, item]),
    );
    return lines.reduce((sum, line) => {
      if (line.itemType === "package") {
        return sum + (packageById.get(line.itemId)?.price ?? 0);
      }
      const klass = classById.get(line.itemId);
      return (
        sum +
        (klass?.offers.find((offer) => offer.id === line.offerId)?.price ?? 0)
      );
    }, 0);
  }, [catalog, lines]);

  async function selectClassOffer(classId: string, offerId: string) {
    const conflictingPackages = lines.filter((line) => {
      if (line.itemType !== "package") return false;
      return catalog?.packages
        .find((item) => item.id === line.itemId)
        ?.class_ids.includes(classId);
    });
    if (
      conflictingPackages.length > 0 &&
      !(await confirm({
        title: "Ganti bundle dengan kelas satuan?",
        message:
          "Kelas ini sudah termasuk dalam bundle di keranjang. Hapus bundle dan ambil kelas satuan?",
        confirmText: "Ambil kelas satuan",
      }))
    ) {
      return;
    }
    conflictingPackages.forEach((line) => {
      remove(line.key);
    });
    addClass(classId, offerId);
  }

  async function selectPackage(packageId: string) {
    const selectedPackage = catalog?.packages.find(
      (item) => item.id === packageId,
    );
    const conflictingClasses = lines.filter(
      (line) =>
        line.itemType === "class" &&
        selectedPackage?.class_ids.includes(line.itemId),
    );
    if (
      conflictingClasses.length > 0 &&
      !(await confirm({
        title: "Ganti kelas satuan dengan bundle?",
        message:
          "Sebagian kelas di bundle ini sudah ada di keranjang. Hapus kelas satuan dan ambil bundle?",
        confirmText: "Ambil bundle",
      }))
    ) {
      return;
    }
    conflictingClasses.forEach((line) => {
      remove(line.key);
    });
    addPackage(packageId);
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071114] text-white">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-cyan-100"
          />
          Menyiapkan ruang belajar...
        </div>
      </main>
    );
  }

  const classCount = catalog?.classes.length;
  const packageCount = catalog?.packages.length;

  return (
    <main className="min-h-screen overflow-hidden bg-[#071114] text-white selection:bg-cyan-200/20">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-56 h-[38rem] w-[38rem] rounded-full bg-cyan-600/[0.075] blur-[140px]" />
        <div className="absolute -bottom-72 -left-48 h-[40rem] w-[40rem] rounded-full bg-blue-800/[0.08] blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <section
          aria-labelledby="daftar-kelas-title"
          className="relative overflow-hidden rounded-[30px] border border-white/[0.085] bg-[linear-gradient(125deg,rgba(16,35,39,0.96),rgba(10,22,27,0.97)_58%,rgba(12,24,30,0.94))] shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:rounded-[36px]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-40 h-[30rem] w-[30rem] rounded-full border border-cyan-100/[0.04]"
          >
            <div className="absolute inset-8 rounded-full border border-cyan-100/[0.045]" />
            <div className="absolute inset-16 rounded-full border border-cyan-100/[0.05]" />
          </div>

          <div className="relative grid gap-10 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center lg:gap-14 lg:px-14 lg:py-14">
            <div>
              <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/70 sm:text-[11px]">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-cyan-100/80"
                />
                Ruang belajar TC Mudah
              </p>
              <h1
                id="daftar-kelas-title"
                className="mt-5 max-w-2xl text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.4rem]"
              >
                Belajar lebih terarah,
                <span className="mt-1 block text-cyan-100/80">
                  dengan pendamping yang tepat.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300/65 sm:text-base">
                Pilih kelas satuan atau bundle belajar, lalu pahami materi
                kuliah bersama mentor TC Mudah dengan ritme yang lebih nyaman.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-md rounded-[24px] border border-white/[0.08] bg-[#081316]/55 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Pilihan belajar
                </span>
                <span className="text-[10px] font-medium tracking-wide text-cyan-100/55">
                  TC / ITS
                </span>
              </div>
              <div className="mt-5 divide-y divide-white/[0.07]">
                <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-xs text-cyan-100/45">
                      01
                    </span>
                    <span className="text-sm font-medium text-white/85">
                      Kelas satuan
                    </span>
                  </div>
                  <span className="font-mono text-sm text-white/75">
                    {classCount === undefined ? "—" : classCount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-xs text-cyan-100/45">
                      02
                    </span>
                    <span className="text-sm font-medium text-white/85">
                      Bundle belajar
                    </span>
                  </div>
                  <span className="font-mono text-sm text-white/75">
                    {packageCount === undefined ? "—" : packageCount}
                  </span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                <p className="max-w-[210px] text-xs leading-5 text-slate-400">
                  Materi terarah, sesi bersama mentor, pilihan yang fleksibel.
                </p>
                <div aria-hidden="true" className="flex h-8 items-end gap-1">
                  <span className="h-3 w-1 rounded-full bg-cyan-100/25" />
                  <span className="h-5 w-1 rounded-full bg-cyan-100/40" />
                  <span className="h-7 w-1 rounded-full bg-cyan-100/65" />
                  <span className="h-4 w-1 rounded-full bg-cyan-100/30" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="catalog-heading" className="mt-12">
          <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/55">
                Katalog kelas
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2
                  id="catalog-heading"
                  className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]"
                >
                  Semua pilihan belajar
                </h2>
                {catalog ? (
                  <span
                    aria-live="polite"
                    className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[11px] tabular-nums text-slate-400"
                  >
                    {filtered.length.toLocaleString("id-ID")} program
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-400/75">
                Temukan materi yang sesuai dengan kebutuhan belajarmu.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-[430px] lg:justify-end">
              <label className="group relative block min-w-0 flex-1">
                <span className="sr-only">Cari kelas, mentor, atau materi</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-100/80"
                  strokeWidth={1.8}
                />
                <input
                  type="search"
                  autoComplete="off"
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Cari kelas, mentor, materi..."
                  className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#0b171a]/80 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-white/[0.14] focus:border-cyan-100/35 focus:ring-4 focus:ring-cyan-100/[0.06]"
                />
              </label>
              <div className="shrink-0">
                <CartButton count={totalCount} />
              </div>
            </div>
          </div>
        </section>

        {!catalog && !err ? (
          <div
            aria-busy="true"
            className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            <p className="sr-only">Memuat katalog kelas...</p>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="min-h-[330px] animate-pulse rounded-[26px] border border-white/[0.06] bg-white/[0.025] p-6"
              >
                <div className="h-3 w-24 rounded-full bg-white/[0.07]" />
                <div className="mt-7 h-6 w-3/4 rounded-md bg-white/[0.07]" />
                <div className="mt-3 h-3 w-1/2 rounded-full bg-white/[0.05]" />
                <div className="mt-8 h-3 w-full rounded-full bg-white/[0.045]" />
                <div className="mt-2 h-3 w-5/6 rounded-full bg-white/[0.045]" />
                <div className="mt-16 h-11 rounded-xl bg-white/[0.05]" />
              </div>
            ))}
          </div>
        ) : !catalog && err ? (
          <div
            role="alert"
            className="mt-8 rounded-[26px] border border-rose-200/[0.12] bg-rose-200/[0.035] px-6 py-10 text-center sm:py-14"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100/55">
              Katalog belum tersedia
            </p>
            <h3 className="mt-3 text-lg font-semibold text-white">
              Kelas belum dapat dimuat
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300/60">
              {err}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 h-10 cursor-pointer rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/40"
            >
              Muat ulang halaman
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[26px] border border-dashed border-white/[0.11] bg-white/[0.018] px-6 py-8 sm:flex-row sm:items-center sm:px-8">
            <div>
              <h3 className="text-base font-semibold text-white">
                Belum ada hasil yang cocok
              </h3>
              <p className="mt-1.5 text-sm text-slate-400">
                Coba kata kunci lain atau tampilkan kembali semua pilihan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQ("")}
              className="h-10 shrink-0 cursor-pointer rounded-xl border border-cyan-100/20 bg-cyan-100/[0.06] px-4 text-sm font-medium text-cyan-50/85 transition hover:bg-cyan-100/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/40"
            >
              Hapus pencarian
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((k) => {
              const mentorIds = "mentor_ids" in k ? k.mentor_ids : [];
              const mentorObjs = mentorIds
                .map((id: string) => idxMentor.get(id))
                .filter(Boolean) as Mentor[];

              const combinedMentor: Mentor | undefined = mentorObjs.length
                ? {
                    id: mentorObjs.map((m) => m.id).join(","),
                    name: mentorObjs.map((m) => m.name).join(" & "),
                    angkatan: mentorObjs[0]?.angkatan ?? 0,
                    visible: true,
                  }
                : undefined;
              const selectedLine = lines.find(
                (line) => line.itemType === "class" && line.itemId === k.id,
              );

              return (
                <ClassCard
                  key={k.id}
                  item={k}
                  mentor={combinedMentor}
                  idxCur={idxCur}
                  selectedOfferId={
                    selectedLine?.itemType === "class"
                      ? selectedLine.offerId
                      : undefined
                  }
                  selected={lines.some((line) => line.itemId === k.id)}
                  onSelectClass={selectClassOffer}
                  onSelectPackage={selectPackage}
                  onRemove={(item) =>
                    remove(
                      `${"class_ids" in item ? "package" : "class"}:${item.id}`,
                    )
                  }
                />
              );
            })}
          </div>
        )}

        <CartDrawer
          openButtonSelector="#cart-floating"
          lines={lines}
          classes={catalog?.classes ?? []}
          packages={catalog?.packages ?? []}
          onRemove={remove}
          onClear={clear}
          total={total}
        />
      </div>
      {confirmModal}
    </main>
  );
}
