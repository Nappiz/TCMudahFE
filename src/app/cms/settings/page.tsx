"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { useModal } from "@/components/ui/useModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function fetchSetting(key: string) {
  const res = await fetch(`${API_BASE}/settings/${key}`);
  if (!res.ok) throw new Error("Failed to fetch setting");
  return res.json();
}

async function updateSetting(key: string, value: string) {
  const res = await fetch(`${API_BASE}/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update setting");
  return res.json();
}

export default function SettingsPage() {
  const [disableDaftarKelas, setDisableDaftarKelas] = useState(false);
  const [disabledDaftarKelasMsg, setDisabledDaftarKelasMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMsg, setSavingMsg] = useState(false);

  const successModal = useModal();
  const errorModal = useModal();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetchSetting("disable_daftar_kelas"),
      fetchSetting("disabled_daftar_kelas_msg").catch(() => ({ value: "Pendaftaran kelas ditutup sementara." }))
    ])
      .then(([statusData, msgData]) => {
        setDisableDaftarKelas(statusData.value === "true");
        setDisabledDaftarKelasMsg(msgData.value);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    const newValue = !disableDaftarKelas;
    setDisableDaftarKelas(newValue);
    setSaving(true);
    
    try {
      await updateSetting("disable_daftar_kelas", newValue ? "true" : "false");
    } catch (err) {
      console.error(err);
      setDisableDaftarKelas(!newValue);
      setErrorMsg("Gagal menyimpan pengaturan.");
      errorModal.onOpen();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMessage = async () => {
    setSavingMsg(true);
    try {
      await updateSetting("disabled_daftar_kelas_msg", disabledDaftarKelasMsg);
      setSuccessMsg("Pesan berhasil disimpan.");
      successModal.onOpen();
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menyimpan pesan.");
      errorModal.onOpen();
    } finally {
      setSavingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Konfigurasi global untuk aplikasi TC Mudah.</p>
      </div>

      <div className="bg-[#0B0E14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tampilan Frontend</h2>
          
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl transition-colors hover:bg-white/[0.04]">
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-200">Sembunyikan Tombol "Daftar Kelas"</div>
              <div className="text-xs text-slate-400">
                Jika diaktifkan, tombol "Daftar Kelas" di Navbar halaman utama tidak akan ditampilkan.
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0B0E14] disabled:opacity-50 ${
                disableDaftarKelas ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={disableDaftarKelas}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  disableDaftarKelas ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {disableDaftarKelas && (
            <div className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-slate-200 mb-2">Pesan Hover (Tooltip)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={disabledDaftarKelasMsg}
                  onChange={(e) => setDisabledDaftarKelasMsg(e.target.value)}
                  placeholder="Pendaftaran kelas ditutup sementara."
                  className="flex-1 bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <button
                  onClick={handleSaveMessage}
                  disabled={savingMsg}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors disabled:opacity-50"
                >
                  {savingMsg ? "Menyimpan..." : "Simpan Pesan"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Pesan ini akan muncul saat kursor diarahkan ke tombol yang dinonaktifkan.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={successModal.open}
        onClose={successModal.onClose}
        title="Berhasil"
        variant="success"
        actions={[
          {
            label: "Tutup",
            onClick: successModal.onClose,
            variant: "primary",
            autoFocus: true,
          },
        ]}
      >
        {successMsg}
      </Modal>

      <Modal
        open={errorModal.open}
        onClose={errorModal.onClose}
        title="Gagal"
        variant="error"
        actions={[
          {
            label: "Tutup",
            onClick: errorModal.onClose,
            variant: "danger",
            autoFocus: true,
          },
        ]}
      >
        {errorMsg}
      </Modal>
    </div>
  );
}
