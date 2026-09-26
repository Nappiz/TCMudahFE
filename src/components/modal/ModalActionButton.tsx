"use client";

import { type ButtonHTMLAttributes, type ReactNode, useState } from "react";

export type ModalButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ModalActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  variant?: ModalButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
  onClick?: () => void | Promise<void>;
  children: ReactNode;
};

const buttonStyles: Record<ModalButtonVariant, string> = {
  primary:
    "border border-cyan-300/25 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/20 hover:bg-cyan-200",
  secondary:
    "border border-white/10 bg-white/[0.07] text-white hover:bg-white/[0.12]",
  ghost:
    "border border-transparent bg-transparent text-white/65 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border border-rose-300/20 bg-rose-400 text-slate-950 shadow-lg shadow-rose-950/20 hover:bg-rose-300",
};

export function ModalActionButton({
  variant = "secondary",
  loading = false,
  loadingLabel,
  disabled,
  onClick,
  children,
  className = "",
  type = "button",
  ...props
}: ModalActionButtonProps) {
  const [pending, setPending] = useState(false);
  const isLoading = loading || pending;

  async function handleClick() {
    if (!onClick || isLoading) return;
    const result = onClick();
    if (result && typeof result.then === "function") {
      setPending(true);
      try {
        await result;
      } finally {
        setPending(false);
      }
    }
  }

  return (
    <button
      {...props}
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current"
        />
      ) : null}
      {isLoading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
