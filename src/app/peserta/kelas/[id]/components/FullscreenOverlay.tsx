"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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
    const el = containerRef.current;
    (async () => {
      try {
        await el.requestFullscreen?.();
      } catch {
        // ignore
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().finally(onClose);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const closeAll = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().finally(onClose);
    } else {
      onClose();
    }
  }, [onClose]);

  const onBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeAll();
      }
    },
    [closeAll]
  );

  return (
    <AnimatePresence>
      {open && src && (
        <motion.div
          className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={onBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(59,130,246,0.18),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_70%_30%,rgba(14,165,233,0.18),transparent_60%)]" />
          </div>

          <div
            className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col p-4"
            ref={containerRef}
          >
            <div className="mb-3 flex items-center justify-between text-white">
              <div className="line-clamp-1 text-sm opacity-80">{title}</div>
              <button
                onClick={closeAll}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
                Tutup
              </button>
            </div>

            <motion.div
              className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <iframe
                src={src}
                className="h-full w-full"
                allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
