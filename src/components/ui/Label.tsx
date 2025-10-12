"use client";
export default function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="pb-2 block text-xs font-medium text-white/80">{children}</label>;
}
