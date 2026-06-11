"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanBarcode, Package, LogIn, Settings, UserRoundCog } from "lucide-react";

type ActivityType = "transaksi" | "inventory" | "login" | "settings" | "user";

interface Activity {
  id: string;
  type: ActivityType;
  desc: string;
  time: string;
  meta?: string;
}

const activities: Activity[] = [
  { id: "1", type: "transaksi", desc: "Memproses transaksi TRX-2049", time: "2 menit lalu", meta: "Rp 184.000" },
  { id: "2", type: "inventory", desc: "Rekonsiliasi stok Gayo Wine Natural", time: "1 jam lalu", meta: "142 kg" },
  { id: "3", type: "login", desc: "Login dari perangkat baru", time: "3 jam lalu", meta: "Jakarta" },
  { id: "4", type: "transaksi", desc: "Memproses transaksi TRX-2031", time: "5 jam lalu", meta: "Rp 320.000" },
  { id: "5", type: "settings", desc: "Memperbarui profil akun", time: "Kemarin, 16.30", meta: undefined },
  { id: "6", type: "inventory", desc: "Tambah stok Ethiopia Yirgacheffe", time: "Kemarin, 14.15", meta: "+50 kg" },
  { id: "7", type: "user", desc: "Menambahkan kasir Dewi Lestari", time: "2 hari lalu", meta: undefined },
];

const typeConfig: Record<ActivityType, { icon: React.ElementType; color: string; label: string }> = {
  transaksi: { icon: ScanBarcode, color: "bg-primary/10 text-primary", label: "Transaksi" },
  inventory: { icon: Package, color: "bg-emerald-500/10 text-emerald-700", label: "Inventory" },
  login:     { icon: LogIn, color: "bg-blue-500/10 text-blue-700", label: "Login" },
  settings:  { icon: Settings, color: "bg-crema/30 text-roast", label: "Pengaturan" },
  user:      { icon: UserRoundCog, color: "bg-purple-500/10 text-purple-700", label: "User" },
};

export function RecentActivity() {
  return (
    <Card className="shadow-soft border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="font-display">Aktivitas Terkini</CardTitle>
        <p className="text-xs text-muted-foreground">Log tindakan akun Anda dalam 7 hari terakhir</p>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.map((a) => {
          const cfg = typeConfig[a.type];
          const Icon = cfg.icon;
          return (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-secondary/40 transition-colors"
            >
              <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${cfg.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">{a.desc}</span>
                  {a.meta && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/60">
                      {a.meta}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                  <span className="text-xs text-muted-foreground/50">·</span>
                  <span className="text-xs text-muted-foreground">{cfg.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}