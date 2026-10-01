"use client";

import Link from "next/link";
import Modal from "@/components/modal/Modal";

export default function SuccessModal({
  open,
  onClose,
  groupLink,
}: {
  open: boolean;
  onClose: () => void;
  groupLink: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bukti pembayaran terkirim"
      variant="info"
      size="sm"
      actions={[
        {
          label: "Tutup",
          onClick: onClose,
          variant: "ghost",
          autoFocus: true,
        },
      ]}
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-white/60">
          Terima kasih sudah mendaftar. Admin kami sedang memverifikasi bukti
          transfermu. Kamu bisa melihat status pesanan dari halaman riwayat.
        </p>
        <Link
          href="/peserta/pesanan"
          className="flex w-full items-center justify-center rounded-xl bg-cyan-200 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          Lihat status pesanan
        </Link>
        <a
          href={groupLink}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-950/20 transition hover:bg-[#20bd5a]"
        >
          Gabung Grup WhatsApp
        </a>
      </div>
    </Modal>
  );
}
