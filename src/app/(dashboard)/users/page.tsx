"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserRoundCog,
  Plus,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  ScanBarcode,
  Package,
  BarChart3,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Role = "owner" | "kasir" | "gudang" | "manajer";
type Status = "aktif" | "nonaktif";
type Outlet = "Senopati" | "Kemang" | "Sudirman";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  outlet: Outlet;
  status: Status;
  lastLogin: string;
  avatar: string; // initials
}

// ─── Seed data ───────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  {
    id: "USR-001",
    name: "Arif Rahman",
    username: "arif.rahman",
    email: "arif@arunika.id",
    role: "owner",
    outlet: "Senopati",
    status: "aktif",
    lastLogin: "Hari ini, 08.14",
    avatar: "AR",
  },
  {
    id: "USR-002",
    name: "Dewi Lestari",
    username: "dewi.lestari",
    email: "dewi@arunika.id",
    role: "kasir",
    outlet: "Kemang",
    status: "aktif",
    lastLogin: "Hari ini, 09.02",
    avatar: "DL",
  },
  {
    id: "USR-003",
    name: "Budi Santoso",
    username: "budi.santoso",
    email: "budi@arunika.id",
    role: "gudang",
    outlet: "Senopati",
    status: "aktif",
    lastLogin: "Kemarin, 17.30",
    avatar: "BS",
  },
  {
    id: "USR-004",
    name: "Siti Rahayu",
    username: "siti.rahayu",
    email: "siti@arunika.id",
    role: "kasir",
    outlet: "Sudirman",
    status: "aktif",
    lastLogin: "Hari ini, 07.55",
    avatar: "SR",
  },
  {
    id: "USR-005",
    name: "Fajar Nugroho",
    username: "fajar.nugroho",
    email: "fajar@arunika.id",
    role: "manajer",
    outlet: "Kemang",
    status: "nonaktif",
    lastLogin: "3 hari lalu",
    avatar: "FN",
  },
  {
    id: "USR-006",
    name: "Rina Kusuma",
    username: "rina.kusuma",
    email: "rina@arunika.id",
    role: "kasir",
    outlet: "Senopati",
    status: "aktif",
    lastLogin: "Hari ini, 10.22",
    avatar: "RK",
  },
];

// ─── Role helpers ─────────────────────────────────────────────────────────────

const ROLE_META: Record<Role, { label: string; icon: React.ElementType; color: string; desc: string }> = {
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

const STATUS_META: Record<Status, { label: string; color: string }> = {
  aktif: { label: "Aktif", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  nonaktif: { label: "Nonaktif", color: "bg-muted text-muted-foreground border-border" },
};

const OUTLETS: Outlet[] = ["Senopati", "Kemang", "Sudirman"];

// ─── Empty form ───────────────────────────────────────────────────────────────

const emptyForm = (): Omit<User, "id" | "avatar" | "lastLogin"> & { password: string } => ({
  name: "",
  username: "",
  email: "",
  password: "",
  role: "kasir",
  outlet: "Senopati",
  status: "aktif",
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "semua">("semua");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = filterRole === "semua" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = [
    { label: "Total User", value: users.length, icon: Users },
    { label: "Aktif", value: users.filter((u) => u.status === "aktif").length, icon: ShieldCheck },
    { label: "Owner", value: users.filter((u) => u.role === "owner").length, icon: ShieldCheck },
    { label: "Outlet", value: 3, icon: Package },
  ];

  // ── Helpers ────────────────────────────────────────────────────────────────

  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm());
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, username: u.username, email: u.email, password: "", role: u.role, outlet: u.outlet, status: u.status });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.username || !form.email) return;
    if (!editingUser && !form.password) return; // password wajib saat tambah user baru

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...form, avatar: initials(form.name) }
            : u
        )
      );
    } else {
      const newUser: User = {
        ...form,
        id: `USR-${String(users.length + 1).padStart(3, "0")}`,
        avatar: initials(form.name),
        lastLogin: "Belum pernah masuk",
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Topbar title="User Management" subtitle="Kelola akun dan hak akses pengguna Arunika" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-soft border-border/60">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl gradient-bean flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role legend */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([key, meta]) => (
            <Card key={key} className="shadow-soft border-border/60">
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${meta.color}`}>
                  <meta.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{meta.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table card */}
        <Card className="shadow-soft border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 flex-wrap">
            <div>
              <CardTitle className="font-display">Daftar Pengguna</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{filtered.length} dari {users.length} pengguna ditampilkan</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, username..."
                  className="pl-8 h-9 w-52 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Role filter */}
              <Select value={filterRole} onValueChange={(v) => setFilterRole(v as Role | "semua")}>
                <SelectTrigger className="h-9 w-36 text-sm">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Role</SelectItem>
                  {(Object.keys(ROLE_META) as Role[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={openCreate} size="sm" className="gradient-bean text-primary-foreground shadow-warm hover:opacity-90 transition-opacity h-9">
                <Plus className="h-4 w-4 mr-1.5" />
                Tambah User
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border/60 bg-secondary/40">
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Pengguna</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Role</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                    <th className="px-4 py-3 text-center text-xs uppercase tracking-wider text-muted-foreground font-medium">Login Terakhir</th>
                    <th className="px-6 py-3 text-center text-xs uppercase tracking-wider text-muted-foreground font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-muted-foreground text-sm">
                        Tidak ada pengguna yang sesuai pencarian.
                      </td>
                    </tr>
                  )}
                  {filtered.map((u) => {
                    const role = ROLE_META[u.role];
                    const status = STATUS_META[u.status];
                    return (
                      <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full gradient-bean flex items-center justify-center shrink-0 text-xs font-semibold text-primary-foreground">
                              {u.avatar}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{u.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={`text-xs ${role.color}`}>
                            {role.label}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={`text-xs ${status.color}`}>
                            {status.label}
                          </Badge>
                        </td>

                        {/* Last login */}
                        <td className="px-4 py-4 text-muted-foreground text-xs text-center">{u.lastLogin}</td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEdit(u)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600"
                              onClick={() => setDeleteTarget(u)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                placeholder="contoh: Budi Santoso"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  placeholder="budi.santoso"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="budi@arunika.id"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {editingUser ? "Password Baru" : "Password"}
                {editingUser && (
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(kosongkan jika tidak diubah)</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={editingUser ? "Biarkan kosong jika tidak diubah" : "Minimal 8 karakter"}
                  className="pr-9"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Outlet</Label>
                <Select value={form.outlet} onValueChange={(v) => setForm({ ...form, outlet: v as Outlet })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTLETS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role desc hint */}
            <div className={`rounded-lg border px-4 py-3 text-xs ${ROLE_META[form.role].color}`}>
              <p className="font-medium">{ROLE_META[form.role].label}</p>
              <p className="mt-0.5 opacity-80">{ROLE_META[form.role].desc}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleSave}
              disabled={!form.name || !form.username || !form.email || (!editingUser && !form.password)}
              className="gradient-bean text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {editingUser ? "Simpan Perubahan" : "Tambah Pengguna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu akan menghapus akun <strong>{deleteTarget?.name}</strong> ({deleteTarget?.username}). Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}