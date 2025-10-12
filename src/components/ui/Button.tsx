"use client";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };
  const variants: Record<string, string> = {
    secondary:
      "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 shadow-lg hover:shadow-xl hover:translate-y-[-1px]",
    primary:
      "glass text-white hover:bg-white/10 border-white/15",
    ghost:
      "text-white/80 hover:text-white border border-white/15 bg-transparent hover:bg-white/5",
  };
  return (
    <button className={`cursor-pointer ${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />
  );
}
