"use client";
import Container from "./ui/Container";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/10">
        <Container className="py-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <div className="flex items-center gap-2">
                <div className="relative h-8 w-8">
                    <Image
                        src="/logo.png"
                        alt="Logo TC Mudah"
                        fill
                        sizes="32px"
                        className="object-contain"
                    />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">TC Mudah</span>
                </div>
                <p className="mt-3 text-sm text-white/70">
                Tutoring online untuk Mahasiswa Baru IF ITS. Materi terstruktur, mentor berpengalaman, dan komunitas
                suportif.
                </p>
            </div>

            <div>
                <FooterTitle>Jelajah</FooterTitle>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                    <a href="#program" className="hover:text-white">
                    Program
                    </a>
                </li>
                <li>
                    <a href="#testimoni" className="hover:text-white">
                    Testimoni
                    </a>
                </li>
                <li>
                    <a href="/daftar-kelas" className="hover:text-white">
                    Daftar Kelas
                    </a>
                </li>
                <li>
                    <a href="#kontak" className="hover:text-white">
                    Kontak
                    </a>
                </li>
                </ul>
            </div>

            <div>
                <FooterTitle>Akun</FooterTitle>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                    <Link href="/register" className="hover:text-white">
                    Daftar
                    </Link>
                </li>
                <li>
                    <Link href="/login" className="hover:text-white">
                    Masuk
                    </Link>
                </li>
                <li>
                    <Link href="/daftar-kelas" className="hover:text-white">
                    Daftar Kelas
                    </Link>
                </li>
                </ul>
            </div>

            <div>
                <FooterTitle>Kontak</FooterTitle>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                    <a href="mailto:Badruzzamannafiz@gmail.com" className="hover:text-white">
                    Email
                    </a>
                </li>
                <li>
                    <a href="https://wa.me/6281519291757" target="_blank" rel="noreferrer" className="hover:text-white">
                    WhatsApp
                    </a>
                </li>
                <li>
                    <a href="https://www.instagram.com/tcmudah" target="_blank" rel="noreferrer" className="hover:text-white">
                    Instagram
                    </a>
                </li>
                </ul>
            </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
            <p>© {new Date().getFullYear()} TC Mudah. All rights reserved.</p>
            <div className="flex items-center gap-4">
                <Link href="#" className="hover:text-white">
                Syarat & Ketentuan
                </Link>
                <Link href="#" className="hover:text-white">
                Kebijakan Privasi
                </Link>
            </div>
            </div>
        </Container>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold text-white">{children}</h4>;
}
