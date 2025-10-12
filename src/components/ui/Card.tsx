"use client";
import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
  fixedHeight,
}: {
  children: ReactNode;
  className?: string;
  fixedHeight?: number | string;
}) {
  const style =
    fixedHeight !== undefined
      ? { minHeight: typeof fixedHeight === "number" ? `${fixedHeight}px` : fixedHeight }
      : undefined;

  return (
    <div className={`card ring-shadow flex flex-col ${className}`} style={style}>
        {children}
    </div>
  );
}
