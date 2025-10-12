"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Label from "../../../components/ui/Label";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

const API_BASE = "";

async function apiLogin(payload: { email: string; password: string }) {
  const res = await fetch(`/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg || "Gagal masuk.");
  }
  return res.json();
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setLoading(false);
      setErr("Email dan password wajib diisi.");
      return;
    }

    try {
      await apiLogin({ email, password });
      router.replace("/");
    } catch (error: any) {
      setErr(error?.message ?? "Gagal masuk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Masuk ke akun"
        subtitle="Gunakan email dan password yang telah kamu daftarkan."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@student.its.ac.id"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {err && <p className="text-sm text-red-300">{err}</p>}

          <Button type="submit" variant="secondary" size="lg" disabled={loading} className="w-full">
            {loading ? "Memproses..." : "Masuk"}
          </Button>

          <div className="text-center text-sm text-white/70">
            Belum punya akun?{" "}
            <Link href="/register" className="text-white underline underline-offset-4 hover:no-underline">
              Daftar
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
