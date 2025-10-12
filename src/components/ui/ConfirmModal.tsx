"use client";
import Modal from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
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
  onConfirm,
  loading = false,
  variant = "primary",
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      variant={variant === "danger" ? "warn" : "info"}
      actions={[
        { label: cancelText, variant: "ghost", onClick: onClose },
        {
          label: loading ? "Memproses…" : confirmText,
          onClick: onConfirm,
          variant: variant === "danger" ? "danger" : "primary",
          disabled: loading,
          autoFocus: true,
        },
      ]}
    >
      <div className="text-white/80">{message}</div>
    </Modal>
  );
}
