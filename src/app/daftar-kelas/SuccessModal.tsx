"use client";

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
      title="Pembayaran diterima"
      variant="success"
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
          Terima kasih sudah mendaftar. Admin kami sedang memverifikasi datamu.
          Silakan tunggu update selanjutnya.
        </p>
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
