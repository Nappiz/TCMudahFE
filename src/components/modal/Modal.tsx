"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ModalActionButton,
  type ModalButtonVariant,
} from "./ModalActionButton";

export type ModalVariant = "success" | "error" | "info" | "warn" | "default";
export type ModalSize = "sm" | "md" | "lg" | "full";

export type ModalAction = {
  label: string;
  onClick?: () => void | Promise<void>;
  variant?: ModalButtonVariant;
  autoFocus?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ModalAction[];
  variant?: ModalVariant;
  dismissible?: boolean;
  size?: ModalSize;
  mobilePosition?: "center" | "bottom";
  className?: string;
  bodyClassName?: string;
  showHeader?: boolean;
};

const statusStyles: Record<
  ModalVariant,
  { icon: typeof CheckCircle2 | null; iconClass: string; lineClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-300",
    lineClass: "via-emerald-300/60",
  },
  error: {
    icon: XCircle,
    iconClass: "text-rose-300",
    lineClass: "via-rose-300/60",
  },
  info: {
    icon: Info,
    iconClass: "text-cyan-300",
    lineClass: "via-cyan-300/60",
  },
  warn: {
    icon: AlertTriangle,
    iconClass: "text-amber-300",
    lineClass: "via-amber-300/60",
  },
  default: { icon: null, iconClass: "", lineClass: "via-white/20" },
};

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  full: "h-[min(92dvh,56rem)] max-w-[min(96vw,88rem)]",
};

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let activeScrollLocks = 0;
let originalBodyOverflow = "";
const activeModalStack: Array<{
  token: symbol;
  dialog: HTMLDivElement | null;
}> = [];

function lockBodyScroll() {
  if (activeScrollLocks === 0) {
    originalBodyOverflow = document.body.style.overflow;
  }
  activeScrollLocks += 1;
  document.body.style.overflow = "hidden";

  return () => {
    activeScrollLocks = Math.max(0, activeScrollLocks - 1);
    if (activeScrollLocks === 0) {
      document.body.style.overflow = originalBodyOverflow;
    }
  };
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions = [],
  variant = "default",
  dismissible = true,
  size = "md",
  mobilePosition = "center",
  className = "",
  bodyClassName = "",
  showHeader = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();
  onCloseRef.current = onClose;
  dismissibleRef.current = dismissible;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const releaseBodyScroll = lockBodyScroll();
    const modalEntry = { token: Symbol("modal"), dialog: dialogRef.current };
    activeModalStack.push(modalEntry);

    const focusFrame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      const initialTarget = dialog?.querySelector<HTMLElement>(
        "[data-modal-autofocus], [autofocus]",
      );
      const firstFocusable =
        dialog?.querySelector<HTMLElement>(focusableSelector);
      (initialTarget ?? firstFocusable ?? dialog)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (activeModalStack[activeModalStack.length - 1] !== modalEntry) return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (event.key === "Escape" && dismissibleRef.current) {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      releaseBodyScroll();
      const stackIndex = activeModalStack.indexOf(modalEntry);
      const wasTopModal = stackIndex === activeModalStack.length - 1;
      if (stackIndex >= 0) activeModalStack.splice(stackIndex, 1);
      if (wasTopModal) {
        const nextDialog = activeModalStack.at(-1)?.dialog;
        const nextFocus = nextDialog?.querySelector<HTMLElement>(
          "[data-modal-autofocus], [autofocus]",
        );
        (nextFocus ?? nextDialog)?.focus();
        if (!nextDialog) previouslyFocused?.focus();
      }
    };
  }, [mounted, open]);

  if (!mounted) return null;

  const status = statusStyles[variant];
  const StatusIcon = status.icon;
  const alignment =
    mobilePosition === "bottom" ? "items-end sm:items-center" : "items-center";
  const popTransition = reduceMotion
    ? { duration: 0.12 }
    : { type: "spring" as const, stiffness: 360, damping: 28, mass: 0.72 };

  return createPortal(
    <AnimatePresence>
      {open
        ? [
            <motion.div
              key="modal-backdrop"
              className="fixed inset-0 z-[1000] bg-slate-950/75 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.18 }}
              onMouseDown={(event) => {
                if (dismissible && event.target === event.currentTarget)
                  onClose();
              }}
            />,
            <motion.div
              key="modal-position"
              className={`pointer-events-none fixed inset-0 z-[1001] flex justify-center overflow-y-auto px-4 py-5 ${alignment}`}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 14 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97, y: 8 }
              }
              transition={popTransition}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-label={title ? undefined : "Dialog"}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                onMouseDown={(event) => event.stopPropagation()}
                className={`pointer-events-auto relative my-auto flex w-full flex-col overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#0b111a] text-white shadow-[0_28px_100px_rgba(0,0,0,0.6)] ${mobilePosition === "bottom" ? "mt-auto mb-0 sm:my-auto" : "my-auto"} ${sizeStyles[size]} ${className}`}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent ${status.lineClass} to-transparent`}
                />
                {showHeader && (title || dismissible) && (
                  <header className="flex items-start justify-between gap-5 border-b border-white/[0.07] px-5 py-4 sm:px-6 sm:py-5">
                    {title ? (
                      <div className="flex min-w-0 items-start gap-3">
                        {StatusIcon ? (
                          <StatusIcon
                            aria-hidden="true"
                            className={`mt-0.5 h-5 w-5 shrink-0 ${status.iconClass}`}
                            strokeWidth={1.8}
                          />
                        ) : null}
                        <div className="min-w-0">
                          <h2
                            id={titleId}
                            className="text-base font-semibold tracking-tight text-white sm:text-lg"
                          >
                            {title}
                          </h2>
                          {description ? (
                            <p
                              id={descriptionId}
                              className="mt-1 text-sm leading-relaxed text-white/45"
                            >
                              {description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <span />
                    )}
                    {dismissible ? (
                      <button
                        type="button"
                        aria-label="Tutup dialog"
                        onClick={onClose}
                        className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-2xl leading-none text-white/40 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    ) : null}
                  </header>
                )}

                <div
                  className={`min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm leading-relaxed text-white/70 sm:px-6 ${bodyClassName}`}
                >
                  {children}
                </div>

                {actions.length ? (
                  <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.07] bg-white/[0.015] px-5 py-4 sm:px-6">
                    {actions.map((action, index) => (
                      <ModalActionButton
                        key={`${action.label}-${index}`}
                        data-modal-autofocus={action.autoFocus || undefined}
                        variant={action.variant}
                        disabled={action.disabled}
                        loading={action.loading}
                        loadingLabel={action.loadingLabel}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </ModalActionButton>
                    ))}
                  </footer>
                ) : null}
              </div>
            </motion.div>,
          ]
        : null}
    </AnimatePresence>,
    document.body,
  );
}
