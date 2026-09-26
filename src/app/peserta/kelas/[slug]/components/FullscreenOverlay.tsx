"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import Modal from "@/components/modal/Modal";

type FullscreenOverlayProps = {
  open: boolean;
  title: string;
  src: string | null;
  onClose: () => void;
};

export function FullscreenOverlay({
  open,
  title,
  src,
  onClose,
}: FullscreenOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const element = containerRef.current;
    const fullscreenRequest = element.requestFullscreen?.();
    void fullscreenRequest?.catch(() => undefined);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) onClose();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [open, onClose]);

  const closeAll = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().finally(onClose);
    } else {
      onClose();
    }
  }, [onClose]);

  if (!src) {
    return (
      <Modal open={false} onClose={onClose} size="full" showHeader={false} />
    );
  }

  return (
    <Modal
      open={open}
      onClose={closeAll}
      size="full"
      showHeader={false}
      bodyClassName="p-0 sm:p-0"
      className="rounded-2xl"
    >
      <div
        ref={containerRef}
        className="relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col bg-[#080b11] p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-4 text-white">
          <div className="line-clamp-1 text-sm text-white/75">{title}</div>
          <button
            type="button"
            onClick={closeAll}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.1] hover:text-white"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
            Tutup
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          <iframe
            title={title}
            src={src}
            className="h-full w-full"
            allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </Modal>
  );
}
