"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import { useModal } from "@/components/ui/useModal";
import { apiMe } from "../../../../lib/api";
import {
  fetchAdminSettings,
  updateCheckoutSettings,
  updateSetting,
} from "../../../../lib/settings";
import { getSettingsAccessView } from "./settingsPageLogic";

const SETTING_KEYS = [
  "disable_daftar_kelas",
  "disabled_daftar_kelas_msg",
  "checkout_bank_name",
  "checkout_bank_account",
  "checkout_bank_holder",
  "checkout_group_link",
  "maintenance_mode",
  "maintenance_message",
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10";

export default function SettingsPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [disableDaftarKelas, setDisableDaftarKelas] = useState(false);
  const [disabledDaftarKelasMsg, setDisabledDaftarKelasMsg] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [groupLink, setGroupLink] = useState("");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const [savingRegistration, setSavingRegistration] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [savingMaintenanceMessage, setSavingMaintenanceMessage] =
    useState(false);

  const successModal = useModal();
  const errorModal = useModal();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const me = await apiMe();
      const canManage = me.role === "admin" || me.role === "superadmin";
      setAuthorized(canManage);
      if (!canManage) return;

      const settings = await fetchAdminSettings(SETTING_KEYS);
      setDisableDaftarKelas(settings.disable_daftar_kelas === "true");
      setDisabledDaftarKelasMsg(
        settings.disabled_daftar_kelas_msg ||
          "Pendaftaran kelas ditutup sementara.",
      );
      setBankName(settings.checkout_bank_name || "");
      setBankAccount(settings.checkout_bank_account || "");
      setBankHolder(settings.checkout_bank_holder || "");
      setGroupLink(settings.checkout_group_link || "");
      setMaintenanceMode(settings.maintenance_mode === "true");
      setMaintenanceMessage(
        settings.maintenance_message ||
          "Situs sedang dalam maintenance. Silakan coba lagi nanti.",
      );
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error ? error.message : "Gagal memuat pengaturan.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function saveSetting(key: string, value: string) {
    await updateSetting(key, value);
  }

  async function handleToggleRegistration() {
    const next = !disableDaftarKelas;
    setDisableDaftarKelas(next);
    setSavingRegistration(true);
    try {
      await saveSetting("disable_daftar_kelas", next ? "true" : "false");
    } catch (error: unknown) {
      setDisableDaftarKelas(!next);
      setErrorMsg(
        error instanceof Error ? error.message : "Gagal menyimpan pengaturan.",
      );
      errorModal.onOpen();
    } finally {
      setSavingRegistration(false);
    }
  }

  async function handleSaveRegistrationMessage() {
    setSavingRegistration(true);
    try {
      await saveSetting(
        "disabled_daftar_kelas_msg",
        disabledDaftarKelasMsg.trim(),
      );
      setSuccessMsg("Pesan penutupan pendaftaran berhasil disimpan.");
      successModal.onOpen();
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error ? error.message : "Gagal menyimpan pesan.",
      );
      errorModal.onOpen();
    } finally {
      setSavingRegistration(false);
    }
  }

  async function handleSavePayment() {
    setSavingPayment(true);
    try {
      await updateCheckoutSettings({
        bank_name: bankName,
        bank_account: bankAccount,
        bank_holder: bankHolder,
        group_link: groupLink,
      });
      setSuccessMsg("Informasi pembayaran berhasil disimpan.");
      successModal.onOpen();
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan informasi pembayaran.",
      );
      errorModal.onOpen();
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleToggleMaintenance() {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    setSavingMaintenance(true);
    try {
      await saveSetting("maintenance_mode", next ? "true" : "false");
      setSuccessMsg(
        next ? "Maintenance mode diaktifkan." : "Maintenance mode dimatikan.",
      );
      successModal.onOpen();
    } catch (error: unknown) {
      setMaintenanceMode(!next);
      setErrorMsg(
        error instanceof Error ? error.message : "Gagal menyimpan mode.",
      );
      errorModal.onOpen();
    } finally {
      setSavingMaintenance(false);
    }
  }

  async function handleSaveMaintenanceMessage() {
    setSavingMaintenanceMessage(true);
    try {
      await saveSetting("maintenance_message", maintenanceMessage.trim());
      setSuccessMsg("Pesan maintenance berhasil disimpan.");
      successModal.onOpen();
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error ? error.message : "Gagal menyimpan pesan.",
      );
      errorModal.onOpen();
    } finally {
      setSavingMaintenanceMessage(false);
    }
  }

  const accessView = getSettingsAccessView(loading, authorized, loadError);

  if (accessView === "loading") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (accessView === "error") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-8 text-center">
          <p className="text-sm font-medium text-white">
            Pengaturan gagal dimuat
          </p>
          <p className="mt-2 text-sm text-red-200/80">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadSettings()}
            className="mt-5 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (accessView === "denied") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-sm font-medium text-white">Akses terbatas</p>
          <p className="mt-2 text-sm text-slate-400">
            Pengaturan aplikasi hanya dapat dikelola oleh admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Kelola pengaturan operasional yang tampil dan digunakan aplikasi.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0E14] shadow-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white">Pendaftaran</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kontrol akses peserta ke katalog kelas.
          </p>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Tutup pendaftaran kelas
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Tombol Daftar Kelas disembunyikan dari halaman peserta saat
                aktif.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleRegistration}
              disabled={savingRegistration}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition disabled:cursor-not-allowed disabled:opacity-50 ${disableDaftarKelas ? "bg-cyan-500" : "bg-slate-700"}`}
              role="switch"
              aria-checked={disableDaftarKelas}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition ${disableDaftarKelas ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {disableDaftarKelas && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <label
                htmlFor="disabled-registration-message"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Pesan saat pendaftaran ditutup
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="disabled-registration-message"
                  value={disabledDaftarKelasMsg}
                  onChange={(event) =>
                    setDisabledDaftarKelasMsg(event.target.value)
                  }
                  className={inputClass}
                  placeholder="Pendaftaran kelas ditutup sementara."
                />
                <button
                  type="button"
                  onClick={handleSaveRegistrationMessage}
                  disabled={savingRegistration}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
                >
                  {savingRegistration ? "Menyimpan..." : "Simpan pesan"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0E14] shadow-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white">Pembayaran</h2>
          <p className="mt-1 text-sm text-slate-500">
            Informasi ini tampil di modal checkout peserta.
          </p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Nama bank</span>
            <input
              value={bankName}
              onChange={(event) => setBankName(event.target.value)}
              className={inputClass}
              placeholder="Contoh: BCA"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Nomor rekening</span>
            <input
              value={bankAccount}
              onChange={(event) => setBankAccount(event.target.value)}
              className={inputClass}
              placeholder="Nomor rekening"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Nama pemilik rekening</span>
            <input
              value={bankHolder}
              onChange={(event) => setBankHolder(event.target.value)}
              className={inputClass}
              placeholder="Nama pemilik rekening"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Link grup WhatsApp (opsional)</span>
            <input
              type="url"
              value={groupLink}
              onChange={(event) => setGroupLink(event.target.value)}
              className={inputClass}
              placeholder="https://chat.whatsapp.com/..."
            />
          </label>
          <div className="flex justify-end sm:col-span-2">
            <button
              type="button"
              onClick={handleSavePayment}
              disabled={savingPayment}
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingPayment ? "Menyimpan..." : "Simpan pembayaran"}
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0E14] shadow-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white">Maintenance</h2>
          <p className="mt-1 text-sm text-slate-500">
            Jeda sementara alur peserta tanpa menutup akses CMS dan login.
          </p>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Aktifkan maintenance mode
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Peserta akan melihat halaman maintenance dan tidak dapat
                checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleMaintenance}
              disabled={savingMaintenance}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition disabled:cursor-not-allowed disabled:opacity-50 ${maintenanceMode ? "bg-cyan-500" : "bg-slate-700"}`}
              role="switch"
              aria-checked={maintenanceMode}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition ${maintenanceMode ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <label
              htmlFor="maintenance-message"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Pesan maintenance
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                id="maintenance-message"
                rows={2}
                value={maintenanceMessage}
                onChange={(event) => setMaintenanceMessage(event.target.value)}
                className={`${inputClass} resize-y`}
                placeholder="Situs sedang dalam maintenance. Silakan coba lagi nanti."
              />
              <button
                type="button"
                onClick={handleSaveMaintenanceMessage}
                disabled={savingMaintenanceMessage}
                className="self-start rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                {savingMaintenanceMessage ? "Menyimpan..." : "Simpan pesan"}
              </button>
            </div>
          </div>
        </div>
      </section>

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
