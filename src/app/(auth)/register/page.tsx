"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { apiRegister } from "../../../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const full_name = String(form.get("fullName") ?? "");
    const nim = String(form.get("nim") ?? "") || undefined;
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");

    if (password.length < 6) {
      setLoading(false);
      setErr("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setLoading(false);
      setErr("Konfirmasi password tidak sama.");
      return;
    }

    try {
      await apiRegister({ full_name, nim, email, password });
      router.push("/login");
    } catch (e: any) {
      setErr(e.message || "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Buat akun baru"
        subtitle="Daftar untuk mengakses materi, latihan, rekaman, dan dashboard peserta."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" name="fullName" placeholder="Nama lengkap" required />
            </div>
            <div>
              <Label htmlFor="nim">NRP</Label>
              <Input id="nim" name="nim" placeholder="5025251xxx" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@gmail.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Min: 6 karakter"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Ulangi password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {err && <p className="text-sm text-red-300">{err}</p>}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </Button>

          <div className="text-center text-sm text-white/70">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-white underline underline-offset-4 hover:no-underline"
            >
              Masuk
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
