"use client";
import { ReactNode } from "react";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-8 ${align === "center" ? "text-center" : ""}`}>
        {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            {eyebrow}
            </span>
        )}
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-gradient">
            {title}
        </h2>
        {description && (
            <p className={`mt-2 text-sm sm:text-base`} style={{ color: "var(--muted)" }}>
            <span className={`${align === "center" ? "mx-auto max-w-2xl block" : "max-w-xl block"}`}>
                {description}
            </span>
            </p>
        )}
    </div>
  );
}
