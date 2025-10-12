"use client";
export default function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string; }) {
  return (
    <div className="glass ring-shadow relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-gradient-to-b from-cyan-400/10 to-transparent" />
      <h1 className="relative text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="relative mt-2 text-sm text-white/70">{subtitle}</p>}
      <div className="relative mt-6">{children}</div>
    </div>
  );
}
