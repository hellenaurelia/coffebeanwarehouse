"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "./profile-client";
import {
  User,
  Lock,
  Bell,
  Monitor,
  Eye,
  EyeOff,
  CheckCircle2,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useTheme } from "next-themes";
import { updateUserAction } from "@/app/(dashboard)/users/_data/actions";

type SettingsTab = "profil" | "keamanan" | "notifikasi" | "tampilan";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profil", label: "Info Profil", icon: User },
  { id: "keamanan", label: "Keamanan", icon: Lock },
  { id: "notifikasi", label: "Notifikasi", icon: Bell },
  { id: "tampilan", label: "Tampilan", icon: Monitor },
];

function ProfilPanel() {
  const { user, setUser } = useUser();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    phone: "+62 812-3456-7890",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let cleaned = val.replace(/(?!^\+)[^\d]/g, "");
    if (cleaned.startsWith("0")) cleaned = "+62" + cleaned.slice(1);
    else if (cleaned.startsWith("62")) cleaned = "+" + cleaned;
    let digits = cleaned.replace(/\D/g, "");
    if (digits.length > 2) {
      let f = "+" + digits.substring(0, 2);
      if (digits.length > 2) f += " " + digits.substring(2, 5);
      if (digits.length > 5) f += "-" + digits.substring(5, 9);
      if (digits.length > 9) f += "-" + digits.substring(9, 14);
      setForm((p) => ({ ...p, phone: f }));
    } else {
      setForm((p) => ({ ...p, phone: cleaned }));
    }
  };

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      const updated = await updateUserAction(user.id, {
        name: form.name,
        username: form.username,
        email: form.email,
        role: user.role as any,
        outlet: user.outlet as any,
        status: user.status,
        password: "",
      });

      setUser({
        ...user,
        name: updated.name,
        username: updated.username,
        email: updated.email,
        avatar: updated.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setForm({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: form.phone,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Lengkap</Label>
          <Input value={form.name} onChange={set("name")} className="bg-secondary/50 border-border/60" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Username</Label>
          <Input value={form.username} onChange={set("username")} className="bg-secondary/50 border-border/60" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
          <Input value={form.email} onChange={set("email")} type="email" className="bg-secondary/50 border-border/60" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">No. Telepon</Label>
          <Input
            value={form.phone}
            onChange={handlePhoneChange}
            placeholder="+62 8XX-XXXX-XXXX"
            maxLength={18}
            className="bg-secondary/50 border-border/60"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Outlet</Label>
          <Input value="Senopati" disabled className="bg-secondary/30 border-border/40 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
          <Input value={user.role} disabled className="bg-secondary/30 border-border/40 text-muted-foreground capitalize" />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>Batalkan</Button>
        <Button size="sm" onClick={handleSave} disabled={loading} className="gradient-bean text-primary-foreground border-0">
          {saved ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Tersimpan
            </span>
          ) : loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}

function KeamananPanel() {
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const toggle = (k: keyof typeof show) => setShow((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Ganti Password</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Gunakan kombinasi huruf, angka, dan simbol</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: "old" as const, label: "Password Lama" },
            { key: "new" as const, label: "Password Baru" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
              <div className="relative">
                <Input
                  type={show[key] ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-secondary/50 border-border/60 pr-10"
                />
                <button
                  onClick={() => toggle(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input
                type={show.confirm ? "text" : "password"}
                placeholder="••••••••"
                className="bg-secondary/50 border-border/60 pr-10"
              />
              <button
                onClick={() => toggle("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" className="gradient-bean text-primary-foreground border-0">
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotifikasiPanel() {
  const [prefs, setPrefs] = useState({
    transaksi: true,
    stok: true,
    laporan: false,
    login: true,
    promosi: false,
  });

  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const items = [
    { key: "transaksi" as const, label: "Notifikasi Transaksi", desc: "Setiap transaksi baru masuk" },
    { key: "stok" as const, label: "Peringatan Stok", desc: "Saat stok biji kopi menipis atau kritis" },
    { key: "laporan" as const, label: "Laporan Harian", desc: "Ringkasan penjualan dikirim tiap pukul 22.00" },
    { key: "promosi" as const, label: "Info & Promo", desc: "Pembaruan fitur dan penawaran dari Arunika" },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3.5 hover:bg-secondary/40 transition-colors"
        >
          <div>
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs[item.key]}
            onClick={() => toggle(item.key)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              prefs[item.key] ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
                prefs[item.key] ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

function TampilanPanel() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "light" as const, label: "Terang", icon: Sun },
    { id: "dark" as const, label: "Gelap", icon: Moon },
    { id: "system" as const, label: "Sistem", icon: Laptop },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Tema Warna</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Pilih tampilan antarmuka Arunika</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 py-4 px-3 transition-all ${
                theme === id
                  ? "border-primary bg-primary/5"
                  : "border-border/60 hover:border-border hover:bg-secondary/40"
              }`}
            >
              <Icon className={`h-5 w-5 ${theme === id ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${theme === id ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border/60" />
    </div>
  );
}

export function SettingsPanel() {
  const [active, setActive] = useState<SettingsTab>("profil");

  const panels: Record<SettingsTab, React.ReactNode> = {
    profil: <ProfilPanel />,
    keamanan: <KeamananPanel />,
    notifikasi: <NotifikasiPanel />,
    tampilan: <TampilanPanel />,
  };

  return (
    <Card className="shadow-soft border-border/60">
      <CardHeader className="pb-0">
        <CardTitle className="font-display">Pengaturan Akun</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Kelola informasi, keamanan, dan preferensi Anda</p>

        <div className="flex gap-1 mt-4 border-b border-border/60 -mx-6 px-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-1.5 px-3 pb-3 pt-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6">{panels[active]}</CardContent>
    </Card>
  );
}