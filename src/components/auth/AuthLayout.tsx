"use client";
import Container from "../ui/Container";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative min-h-[calc(100vh-64px)] py-14 sm:py-20">
      {/* background accent */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_520px_at_12%_0%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(1000px_520px_at_88%_20%,rgba(99,102,241,0.14),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(120deg,rgba(255,255,255,0.6),transparent_30%,transparent_70%,rgba(255,255,255,0.6))]" />
      </div>

      <Container>
        <div className="mx-auto w-full max-w-md">
          {children}
          <p className="mt-6 text-center text-xs text-white/60">
            Dengan melanjutkan, kamu menyetujui{" "}
            <Link href="#" className="text-white/80 hover:text-white underline underline-offset-4">Syarat & Ketentuan</Link>{" "}
            dan{" "}
            <Link href="#" className="text-white/80 hover:text-white underline underline-offset-4">Kebijakan Privasi</Link>.
          </p>
        </div>
      </Container>
    </section>
  );
}
