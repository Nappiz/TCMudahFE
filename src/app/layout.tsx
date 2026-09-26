import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TC Mudah — Tutoring Informatika ITS",
  description:
    "Tutoring online untuk Mahasiswa Baru IF ITS. Materi terstruktur, mentor berpengalaman, dan komunitas suportif.",
  icons: { icon: "/favicon.ico" },
};

import { ErrorProvider } from "@/components/providers/ErrorProvider";
import MaintenanceGate from "@/components/providers/MaintenanceGate";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-950`}>
        <ErrorProvider>
          <MaintenanceGate>{children}</MaintenanceGate>
        </ErrorProvider>
      </body>
    </html>
  );
}
