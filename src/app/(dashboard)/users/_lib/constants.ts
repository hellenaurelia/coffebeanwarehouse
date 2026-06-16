import { ShieldCheck, ScanBarcode, Package, BarChart3 } from "lucide-react";
import type { Role, Status, Outlet, User, UserForm } from "./types";

export const ROLE_META: Record<
  Role,
  { label: string; icon: React.ElementType; color: string; desc: string }
> = {
  owner: {
    label: "Owner",
    icon: ShieldCheck,
    color: "bg-primary/10 text-primary border-primary/20",
    desc: "Akses penuh ke semua fitur dan pengaturan sistem.",
  },
  manajer: {
    label: "Manajer",
    icon: BarChart3,
    color: "bg-accent/10 text-roast border-accent/20",
    desc: "Akses laporan, inventory, dan manajemen tim.",
  },
  kasir: {
    label: "Kasir",
    icon: ScanBarcode,
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    desc: "Akses POS, riwayat transaksi, dan produk.",
  },
  gudang: {
    label: "Gudang",
    icon: Package,
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    desc: "Akses inventory, supplier, dan rekonsiliasi stok.",
  },
};

export const STATUS_META: Record<Status, { label: string; color: string }> = {
  aktif: { label: "Aktif", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  nonaktif: { label: "Nonaktif", color: "bg-muted text-muted-foreground border-border" },
};

export const OUTLETS: Outlet[] = ["Senopati"];

export const SEED_USERS: User[] = [
  { id: "USR-001", name: "Arif Rahman",   username: "arif.rahman",   email: "arif@arunika.id",  role: "owner",   outlet: "Senopati", status: "aktif",    lastLogin: "Hari ini, 08.14",       avatar: "AR" },
  { id: "USR-002", name: "Dewi Lestari",  username: "dewi.lestari",  email: "dewi@arunika.id",  role: "kasir",   outlet: "Senopati", status: "aktif",    lastLogin: "Hari ini, 09.02",       avatar: "DL" },
  { id: "USR-003", name: "Budi Santoso",  username: "budi.santoso",  email: "budi@arunika.id",  role: "gudang",  outlet: "Senopati", status: "aktif",    lastLogin: "Kemarin, 17.30",        avatar: "BS" },
  { id: "USR-004", name: "Siti Rahayu",   username: "siti.rahayu",   email: "siti@arunika.id",  role: "manajer", outlet: "Senopati", status: "aktif",    lastLogin: "Hari ini, 07.55",       avatar: "SR" },
  { id: "USR-005", name: "Fajar Nugroho", username: "fajar.nugroho", email: "fajar@arunika.id", role: "manajer", outlet: "Senopati", status: "nonaktif", lastLogin: "6 Juni 2024, 14.20",    avatar: "FN" },
  { id: "USR-006", name: "Rina Kusuma",   username: "rina.kusuma",   email: "rina@arunika.id",  role: "kasir",   outlet: "Senopati", status: "aktif",    lastLogin: "Hari ini, 10.22",       avatar: "RK" },
];

export const emptyForm = (): UserForm => ({
  name: "", username: "", email: "", password: "",
  role: "kasir", outlet: "Senopati", status: "aktif",
});

export const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();