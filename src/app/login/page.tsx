"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Coffee, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    // Simulate auth — ganti dengan API call nyata
    await new Promise((r) => setTimeout(r, 1200));

    // Contoh validasi sederhana (ganti dengan backend auth)
    if (form.username === "admin" && form.password === "arunika123") {
      // Set cookie session sebelum redirect
      document.cookie = "arunika_session=demo_token; path=/; max-age=86400";
      router.push("/");
    } else {
      setError("Username atau password salah.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-bean flex-col justify-between p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-crema/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <Coffee className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-primary-foreground">Arunika</p>
            <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Bean POS &amp; Warehouse</p>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 space-y-6">
          <blockquote className="font-display text-3xl font-semibold leading-snug text-primary-foreground text-balance">
            Setiap biji kopi punya cerita. Sistem kami mencatat semuanya.
          </blockquote>
          <p className="text-sm text-primary-foreground/70 max-w-sm">
            Kelola gudang, lacak stok, dan jalankan kasir Arunika dalam satu platform yang terintegrasi.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["Kasir POS", "Manajemen Stok", "Laporan Real-time", "Multi-user"].map((f) => (
              <Badge
                key={f}
                className="bg-primary-foreground/15 text-primary-foreground border-0 backdrop-blur text-xs"
              >
                {f}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 border-t border-primary-foreground/20 pt-6">
          {[
            { label: "Transaksi/hari", value: "200+" },
            { label: "SKU Aktif", value: "50+" },
            { label: "Stok Gudang", value: "1.247 kg" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-2xl font-semibold text-primary-foreground">{s.value}</p>
              <p className="text-xs text-primary-foreground/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-bean shadow-warm">
              <Coffee className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-semibold">Arunika</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Bean POS &amp; Warehouse</p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold">Selamat datang kembali</h1>
            <p className="text-sm text-muted-foreground">Masuk ke akun Arunika kamu untuk melanjutkan.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  className="pl-9"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <button
                  type="button"
                  className="text-xs text-accent hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className="pl-9 pr-9"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-bean text-primary-foreground shadow-warm hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Masuk...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <Card className="border-border/50 bg-secondary/40">
            <CardContent className="p-4 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Akun Demo</p>
              <p className="text-xs text-muted-foreground">
                Username: <span className="font-mono text-foreground">admin</span>
                {" · "}
                Password: <span className="font-mono text-foreground">arunika123</span>
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            © 2025 Arunika · Bean POS &amp; Warehouse Management
          </p>
        </div>
      </div>
    </div>
  );
}