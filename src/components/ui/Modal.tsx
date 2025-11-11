"use client";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type Variant = "success" | "error" | "info" | "warn" | "default";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    autoFocus?: boolean;
    disabled?: boolean;
  }>;
  variant?: Variant;
  dismissible?: boolean; 
  size?: "sm" | "md" | "lg";
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  actions = [],
  variant = "default",
  dismissible = true,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  const iconMap: Record<Variant, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <XCircle className="h-5 w-5 text-rose-400" />,
    info: <Info className="h-5 w-5 text-cyan-400" />,
    warn: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    default: null,
  };

  const glowMap: Record<Variant, string> = {
    success: "from-emerald-400/20",
    error: "from-rose-400/20",
    info: "from-cyan-400/20",
    warn: "from-amber-400/20",
    default: "from-white/10",
  };

  const widthClass =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  const root = (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      onMouseDown={(e) => {
        if (!dismissible) return;
        // klik backdrop: close
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        className={`relative ${widthClass} w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl`}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-px rounded-2xl bg-[conic-gradient(var(--tw-gradient-stops))] from-transparent via-transparent to-transparent`}
          style={{
            maskImage:
              "radial-gradient(300px 160px at 10% -10%, black, transparent), radial-gradient(300px 160px at 110% 40%, black, transparent)",
          }}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-28 -left-28 h-56 w-56 rounded-full blur-3xl bg-gradient-to-r ${glowMap[variant]}`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -bottom-28 -right-28 h-56 w-56 rounded-full blur-3xl bg-gradient-to-r ${glowMap[variant]}`}
        />

        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            {iconMap[variant]}
            {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
          </div>
          {dismissible && (
            <button
              aria-label="Tutup"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/10 p-1 text-white/70 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative p-5 text-white/80">{children}</div>

        {actions.length > 0 && (
          <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3">
            {actions.map((a, i) => (
              <button
                key={i}
                autoFocus={a.autoFocus}
                disabled={a.disabled}
                onClick={a.onClick}
                className={btnClass(a.variant)}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(root, document.body);
}

function btnClass(variant: "primary" | "secondary" | "ghost" | "danger" = "secondary") {
  const base =
    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition";
  const map: Record<string, string> = {
    primary:
      `${base} border-cyan-500/40 bg-cyan-500/20 text-white hover:bg-cyan-500/30`,
    secondary:
      `${base} border-white/10 bg-white/10 text-white hover:bg-white/15`,
    ghost:
      `${base} border-transparent bg-transparent text-white/80 hover:bg-white/10`,
    danger:
      `${base} border-rose-500/40 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25`,
  };
  return map[variant];
}
