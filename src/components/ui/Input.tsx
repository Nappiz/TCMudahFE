"use client";
import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

const Input = forwardRef<HTMLInputElement, Props>(function Input({ className = "", invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-xl bg-white/[.06] border px-3.5 py-3 text-sm text-white placeholder-white/40 outline-none transition
      ${invalid ? "border-red-400/60 focus:border-red-300/70" : "border-white/15 focus:border-white/30"}
      ${className}`}
      {...props}
    />
  );
});
export default Input;
