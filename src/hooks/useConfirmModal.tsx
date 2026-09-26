"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import ConfirmModal from "@/components/modal/ConfirmModal";

type ConfirmOptions = {
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  onConfirm?: () => void | Promise<void>;
};

export function useConfirmModal() {
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current?.(false);
      resolveRef.current = resolve;
      setLoading(false);
      setRequest(options);
    });
  }, []);

  const settle = useCallback((confirmed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setLoading(false);
    setRequest(null);
    resolve?.(confirmed);
  }, []);

  const runConfirm = useCallback(async () => {
    if (!request || loading) return;
    setLoading(true);
    try {
      await request.onConfirm?.();
      settle(true);
    } catch {
      // The action owner reports request errors and leaves the dialog available.
      setLoading(false);
    }
  }, [loading, request, settle]);

  const modal = (
    <ConfirmModal
      open={request !== null}
      onClose={() => settle(false)}
      title={request?.title}
      message={request?.message}
      confirmText={request?.confirmText}
      cancelText={request?.cancelText}
      variant={request?.variant}
      onConfirm={runConfirm}
      loading={loading}
    />
  );

  return { confirm, modal };
}
