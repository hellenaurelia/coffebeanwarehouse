"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type SettingsTab = "profil" | "keamanan" | "notifikasi" | "tampilan";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profil", label: "Info Profil", icon: User },
  { id: "keamanan", label: "Keamanan", icon: Lock },
  { id: "notifikasi", label: "Notifikasi", icon: Bell },
  { id: "tampilan", label: "Tampilan", icon: Monitor },
];

// ─── Sub-panels ─────────────────────────────────────────────────────────────

function ProfilPanel() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Lengkap</Label>
          <Input defaultValue="Arif Rahman" className="bg-secondary/50 border-border/60" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Username</Label>
          <Input defaultValue="arif.rahman" className="bg-secondary/50 border-border/60" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
          <Input defaultValue="arif@arunika.id" type="email" className="bg-secondary/50 border-border/60" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">No. Telepon</Label>
          <Input defaultValue="+62 812-3456-7890" className="bg-secondary/50 border-border/60" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Outlet Utama</Label>
          <Select defaultValue="senopati">
            <SelectTrigger className="bg-secondary/50 border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="senopati">Senopati</SelectItem>
              <SelectItem value="kemang">Kemang</SelectItem>
              <SelectItem value="sudirman">Sudirman</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
          <Input value="Owner" disabled className="bg-secondary/30 border-border/40 text-muted-foreground" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
        <Button variant="outline" size="sm">Batalkan</Button>
        <Button size="sm" onClick={handleSave} className="gradient-bean text-primary-foreground border-0">
          {saved ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Tersimpan
            </span>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </div>
  );
}

function KeamananPanel() {
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const toggle = (k: keyof typeof show) => setShow((p) => ({ ...p, [k]: !p[k] }));

  const sessions = [
    { device: "MacBook Pro 14\"", location: "Jakarta, ID", time: "Aktif sekarang", current: true },
    { device: "iPhone 14 Pro", location: "Jakarta, ID", time: "2 jam lalu", current: false },
    { device: "Chrome · Windows", location: "Tangerang, ID", time: "Kemarin, 19.45", current: false },
  ];

  return (
    <div className="space-y-8">
      {/* Change password */}
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

      <div className="border-t border-border/60" />

      {/* Active sessions */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Sesi Aktif</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Perangkat yang sedang login ke akun Anda</p>
        </div>
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 hover:bg-secondary/40 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{s.device}</span>
                  {s.current && (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px] px-1.5 py-0">
                      Perangkat ini
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{s.location} · {s.time}</div>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                  Cabut Akses
                </Button>
              )}
            </div>
          ))}
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
    { key: "login" as const, label: "Login Baru", desc: "Saat akun diakses dari perangkat baru" },
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
          {/* Custom toggle switch */}
          <button
            onClick={() => toggle(item.key)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              prefs[item.key] ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
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
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [lang, setLang] = useState("id");

  const themes = [
    { id: "light" as const, label: "Terang", icon: Sun },
    { id: "dark" as const, label: "Gelap", icon: Moon },
    { id: "system" as const, label: "Sistem", icon: Laptop },
  ];

  return (
    <div className="space-y-8">
      {/* Theme */}
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

      {/* Language */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Bahasa</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Bahasa antarmuka aplikasi</p>
        </div>
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="bg-secondary/50 border-border/60 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

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

        {/* Tab bar */}
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