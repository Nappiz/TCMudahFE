"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="md:col-span-2">
                    <Link href="/" className="flex items-center gap-2 mb-4">
                        <div className="relative h-8 w-8">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-xl text-white">TC Mudah</span>
                    </Link>
                    <p className="text-slate-400 max-w-sm leading-relaxed">
                        TC Mudah adalah tutoring online untuk Mahasiswa Baru Teknik Informatika ITS. Materi terstruktur, mentor berpengalaman, dan dukungan komunitas membuat belajarmu fokus serta menyenangkan.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-4">Platform</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="#program" className="hover:text-cyan-400 transition-colors">Kurikulum</Link></li>
                        <li><Link href="#features" className="hover:text-cyan-400 transition-colors">Fitur</Link></li>
                        <li><Link href="/daftar-kelas" className="hover:text-cyan-400 transition-colors">Daftar Kelas</Link></li>
                        <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Masuk Member</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Connect</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="https://wa.me/6281519291757" className="hover:text-cyan-400 transition-colors">WhatsApp Admin</a></li>
                        <li><a href="https://instagram.com/tcmudah" className="hover:text-cyan-400 transition-colors">Instagram</a></li>
                        <li><a href="mailto:support@tcmudah.com" className="hover:text-cyan-400 transition-colors">Email Support</a></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>© {new Date().getFullYear()} TC Mudah. All rights reserved.</p>
            </div>
        </div>
    </footer>
  );
}