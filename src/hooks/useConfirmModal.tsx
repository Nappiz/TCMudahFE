"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";

type ConfirmOptions = {
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
};

export function useConfirmModal() {
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current?.(false);
      resolveRef.current = resolve;
      setRequest(options);
    });
  }, []);

  const settle = useCallback((confirmed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setRequest(null);
    resolve?.(confirmed);
  }, []);

  const modal = (
    <ConfirmModal
      open={request !== null}
      onClose={() => settle(false)}
      title={request?.title}
      message={request?.message}
      confirmText={request?.confirmText}
      cancelText={request?.cancelText}
      variant={request?.variant}
      onConfirm={() => settle(true)}
    />
  );

  return { confirm, modal };
}
