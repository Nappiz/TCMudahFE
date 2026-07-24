import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TC Mudah — Tutoring Informatika ITS",
  description:
    "Tutoring online untuk Mahasiswa Baru IF ITS. Materi terstruktur, mentor berpengalaman, dan komunitas suportif.",
  icons: { icon: "/favicon.ico" },
};

import { ErrorProvider } from "@/components/providers/ErrorProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-950`}>
        <ErrorProvider>
          {children}
        </ErrorProvider>
      </body>
    </html>
  );
}
