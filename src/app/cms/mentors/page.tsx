"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Lock } from "lucide-react";

import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useModal } from "@/components/ui/useModal";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = { id: string; email: string; full_name: string; role: Role };

type Mentor = {
  id: string;
  name: string;
  angkatan: number;
  achievements: string[];
  visible: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json() as Promise<T>;
}

export default function MentorsCMS() {
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [list, setList] = useState<Mentor[] | null>(null);

  // MODALS
  const successModal = useModal(); // tampilkan pesan sukses
  const errorModal = useModal();   // tampilkan pesan error
  const confirmModal = useModal(); // konfirmasi hapus
  const [successMsg, setSuccessMsg] = useState<string>("Berhasil");
  const [errorMsg, setErrorMsg] = useState<string>("Terjadi kesalahan");
  const [pendingDelete, setPendingDelete] = useState<Mentor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isReadonly = useMemo(() => me?.role === "mentor", [me]);

  useEffect(() => {
    (async () => {
      try {
        const u = await api<User>("/me");
        if (u.role === "peserta") {
          router.replace("/");
          return;
        }
        setMe(u);
      } catch {
        router.replace("/");
        return;
      }
      try {
        const rows = await api<Mentor[]>("/admin/mentors");
        setList(rows);
      } catch (e: any) {
        setErrorMsg(String(e));
        errorModal.onOpen();
        setList([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!list || !me) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
        Memuat data mentor…
      </div>
    );
  }

  const handleAdd = () => {
    if (isReadonly) return;
    setList((prev) => [
      {
        id: "new-" + Math.random().toString(36).slice(2),
        name: "",
        angkatan: new Date().getFullYear(),
        achievements: [""],
        visible: true,
      },
      ...(prev ?? []),
    ]);
  };

  const saveRow = async (m: Mentor) => {
    if (isReadonly) return;
    // validasi achievements 1..5 dan tidak kosong
    const clean = (m.achievements || []).map((s) => s.trim()).filter(Boolean);
    if (clean.length < 1 || clean.length > 5) {
      setErrorMsg("Prestasi harus diisi 1 sampai 5 item.");
      errorModal.onOpen();
      return;
    }
    const payload = {
      name: m.name.trim(),
      angkatan: Number(m.angkatan),
      achievements: clean,
      visible: !!m.visible,
    };
    try {
      let saved: Mentor;
      if (m.id.startsWith("new-")) {
        saved = await api<Mentor>("/admin/mentors", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setList((prev) => prev!.map((x) => (x.id === m.id ? saved : x)));
        setSuccessMsg("Mentor berhasil ditambahkan.");
      } else {
        saved = await api<Mentor>(`/admin/mentors/${m.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setList((prev) => prev!.map((x) => (x.id === m.id ? saved : x)));
        setSuccessMsg("Perubahan mentor berhasil disimpan.");
      }
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(String(e));
      errorModal.onOpen();
    }
  };

  const askDelete = (m: Mentor) => {
    if (isReadonly) return;
    if (m.id.startsWith("new-")) {
      // baris baru yang belum tersimpan -> hapus lokal tanpa konfirmasi
      setList((prev) => prev!.filter((x) => x.id !== m.id));
      setSuccessMsg("Baris baru dibatalkan.");
      successModal.onOpen();
      return;
    }
    setPendingDelete(m);
    confirmModal.onOpen();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api(`/admin/mentors/${pendingDelete.id}`, { method: "DELETE" });
      setList((prev) => prev!.filter((x) => x.id !== pendingDelete.id));
      setSuccessMsg("Mentor berhasil dihapus.");
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(String(e));
      errorModal.onOpen();
    } finally {
      setDeleting(false);
      confirmModal.onClose();
      setPendingDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Mentor</h2>
            <p className="text-sm text-white/60">
              Kelola daftar mentor.{" "}
              {isReadonly
                ? "Mode read-only untuk role mentor."
                : "Admin & Superadmin dapat menambah/mengubah/menghapus."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isReadonly ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                <Lock className="h-3.5 w-3.5" /> Read-only
              </span>
            ) : (
              <button
                onClick={handleAdd}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
              >
                <Plus className="h-4 w-4" /> Tambah Mentor
              </button>
            )}
          </div>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nama</th>
                <th className="px-4 py-3 text-left font-medium">Angkatan</th>
                <th className="px-4 py-3 text-left font-medium">Prestasi (1–5)</th>
                <th className="px-4 py-3 text-left font-medium">Tampil</th>
                <th className="px-4 py-3 text-left font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {list.map((row) => {
                const disabled = isReadonly;
                return (
                  <tr key={row.id} className="bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <input
                        className="w-56 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-white/90 outline-none placeholder:text-white/40 disabled:opacity-60"
                        value={row.name}
                        onChange={(e) =>
                          setList((prev) =>
                            prev!.map((x) => (x.id === row.id ? { ...x, name: e.target.value } : x))
                          )
                        }
                        placeholder="Nama"
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-28 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-white/90 outline-none disabled:opacity-60"
                        value={row.angkatan}
                        onChange={(e) =>
                          setList((prev) =>
                            prev!.map((x) =>
                              x.id === row.id ? { ...x, angkatan: Number(e.target.value) } : x
                            )
                          )
                        }
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {row.achievements.map((a, i) => (
                          <input
                            key={i}
                            className="w-64 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-white/90 outline-none placeholder:text-white/40 disabled:opacity-60"
                            value={a}
                            onChange={(e) =>
                              setList((prev) =>
                                prev!.map((x) =>
                                  x.id === row.id
                                    ? {
                                        ...x,
                                        achievements: x.achievements.map((y, yi) =>
                                          yi === i ? e.target.value : y
                                        ),
                                      }
                                    : x
                                )
                              )
                            }
                            placeholder={`Prestasi ${i + 1}`}
                            disabled={disabled}
                          />
                        ))}
                        {!disabled && row.achievements.length < 5 && (
                          <button
                            onClick={() =>
                              setList((prev) =>
                                prev!.map((x) =>
                                  x.id === row.id
                                    ? { ...x, achievements: [...x.achievements, ""] }
                                    : x
                                )
                              )
                            }
                            className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/15"
                          >
                            + Tambah
                          </button>
                        )}
                        {!disabled && row.achievements.length > 1 && (
                          <button
                            onClick={() =>
                              setList((prev) =>
                                prev!.map((x) =>
                                  x.id === row.id
                                    ? { ...x, achievements: x.achievements.slice(0, -1) }
                                    : x
                                )
                              )
                            }
                            className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/15"
                          >
                            − Hapus terakhir
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-cyan-400"
                        checked={row.visible}
                        onChange={(e) =>
                          setList((prev) =>
                            prev!.map((x) =>
                              x.id === row.id ? { ...x, visible: e.target.checked } : x
                            )
                          )
                        }
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={disabled}
                          onClick={() => saveRow(row)}
                          className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-white/90 hover:bg-white/15 disabled:opacity-60"
                          title="Simpan"
                        >
                          <Save className="h-4 w-4" /> Simpan
                        </button>
                        <button
                          disabled={disabled}
                          onClick={() => askDelete(row)}
                          className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-white/90 hover:bg-white/15 disabled:opacity-60"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== MODALS ====== */}

      {/* Success */}
      <Modal
        open={successModal.open}
        onClose={successModal.onClose}
        title="Berhasil"
        variant="success"
        actions={[{ label: "Tutup", onClick: successModal.onClose, variant: "primary", autoFocus: true }]}
      >
        {successMsg}
      </Modal>

      {/* Error */}
      <Modal
        open={errorModal.open}
        onClose={errorModal.onClose}
        title="Gagal"
        variant="error"
        actions={[{ label: "Tutup", onClick: errorModal.onClose, variant: "danger", autoFocus: true }]}
      >
        {errorMsg}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => {
          if (!deleting) {
            confirmModal.onClose();
            setPendingDelete(null);
          }
        }}
        title="Hapus mentor?"
        message={
          <div>
            {pendingDelete ? (
              <>
                Data mentor <span className="font-semibold text-white">{pendingDelete.name || "(tanpa nama)"}</span>{" "}
                akan dihapus. Aksi ini tidak bisa dibatalkan.
              </>
            ) : (
              "Aksi ini tidak bisa dibatalkan."
            )}
          </div>
        }
        confirmText={deleting ? "Menghapus…" : "Hapus"}
        variant="danger"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
}
