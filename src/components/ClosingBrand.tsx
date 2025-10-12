"use client";
import Container from "./ui/Container";
import Image from "next/image";

export default function ClosingBrand() {
  return (
    <section className="relative py-24 sm:py-28 lg:py-32">
        <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_15%_0%,rgba(34,211,238,0.10),transparent_60%),radial-gradient(1100px_560px_at_85%_20%,rgba(99,102,241,0.10),transparent_60%)]" />
            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(120deg,rgba(255,255,255,0.65),transparent_30%,transparent_70%,rgba(255,255,255,0.65))]" />
        </div>

        <Container>
            <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto relative h-40 w-40 sm:h-48 sm:w-48 lg:h-56 lg:w-56">
                <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl"
                style={{
                    background:
                    "radial-gradient(closest-side, rgba(34,211,238,0.45), rgba(59,130,246,0.32), rgba(99,102,241,0.22), transparent 70%)",
                    filter: "saturate(1.1)",
                }}
                />
                <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-full"
                style={{
                    boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 18px 90px rgba(59,130,246,0.20)",
                }}
                />
                <Image src="/logo.png" alt="Logo TC Mudah" fill sizes="(max-width: 640px) 10rem, (max-width: 1024px) 12rem, 14rem" className="object-contain drop-shadow-[0_18px_90px_rgba(59,130,246,0.22)]" priority/>
            </div>

            <h3 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                TC <span className="text-brand">Mudah</span>
            </h3>

            <p className="mt-3 text-base sm:text-lg lg:text-xl text-white/75 mx-auto max-w-3xl">
                <span className="text-white/90">Raih prestasi gemilang bersama</span>{" "}
                <span className="text-brand font-semibold">TC Mudah</span>.
            </p>

            <div className="mx-auto mt-10 h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
        </Container>
    </section>
  );
}
