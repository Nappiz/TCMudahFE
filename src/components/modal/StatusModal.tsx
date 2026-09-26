"use client";

import type { ReactNode } from "react";
import Modal, { type ModalVariant } from "./Modal";

type StatusModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: Exclude<ModalVariant, "default">;
  closeText?: string;
};

export function StatusModal({
  open,
  onClose,
  title,
  children,
  variant = "info",
  closeText = "Tutup",
}: StatusModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      actions={[
        {
          label: closeText,
          variant: variant === "error" ? "danger" : "primary",
          onClick: onClose,
          autoFocus: true,
        },
      ]}
    >
      {children}
    </Modal>
  );
}
