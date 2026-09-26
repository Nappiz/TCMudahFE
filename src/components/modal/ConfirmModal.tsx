"use client";

import { type ReactNode, useEffect, useState } from "react";
import Modal from "./Modal";

export type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loadingLabel?: string;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
  variant?: "danger" | "primary";
};

export default function ConfirmModal({
  open,
  onClose,
  title = "Konfirmasi",
  message = "Yakin ingin melanjutkan?",
  confirmText = "Ya, lanjutkan",
  cancelText = "Batal",
  loadingLabel,
  onConfirm,
  loading = false,
  variant = "primary",
}: ConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;

  useEffect(() => {
    if (!open) setInternalLoading(false);
  }, [open]);

  async function handleConfirm() {
    if (isLoading) return;
    if (!onConfirm) {
      onClose();
      return;
    }

    setInternalLoading(true);
    try {
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !isLoading && onClose()}
      title={title}
      variant={variant === "danger" ? "warn" : "info"}
      dismissible={!isLoading}
      size="sm"
      actions={[
        {
          label: cancelText,
          variant: "ghost",
          onClick: () => {
            if (!isLoading) onClose();
          },
          disabled: isLoading,
        },
        {
          label: confirmText,
          loadingLabel:
            loadingLabel ??
            (variant === "danger" ? "Menghapus..." : "Memproses..."),
          onClick: handleConfirm,
          variant: variant === "danger" ? "danger" : "primary",
          disabled: isLoading,
          loading: isLoading,
          autoFocus: true,
        },
      ]}
    >
      <div className="text-sm leading-relaxed text-white/65">{message}</div>
    </Modal>
  );
}
