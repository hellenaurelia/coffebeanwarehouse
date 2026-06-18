"use client";

import { useState, useRef, useEffect } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Boxes, Plus, Search, ShieldCheck, ShoppingCart, Users } from "lucide-react";

import { StatCard } from "./_components/stat-card";
import { RoleCard } from "./_components/role-card";
import { UserRow } from "./_components/user-row";
import { UserDialog } from "./_components/user-dialog";
import { DeleteDialog } from "./_components/delete-dialog";
import { ROLE_META, SEED_USERS, emptyForm, initials } from "./_lib/constants";
import type { Role, User, UserForm } from "./_lib/types";

const TABLE_HEADERS = ["Pengguna", "Email", "Role", "Status", "Login Terakhir", "Aksi"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "semua">("semua");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const idCounter = useRef(SEED_USERS.length);

  // ── Derived ──────────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [u.name, u.username, u.email].some((s) => s.toLowerCase().includes(q));
    const matchRole = filterRole === "semua" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = [
    { label: "Total User", value: users.length, icon: Users },
    { label: "Aktif", value: users.filter((u) => u.status === "aktif").length, icon: ShieldCheck },
    { label: "Kasir", value: users.filter((u) => u.role === "kasir").length, icon: ShoppingCart },
    { label: "Gudang", value: users.filter((u) => u.role === "gudang").length, icon: Boxes },
  ];

  // ── Actions ───────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, username: u.username, email: u.email, password: "", role: u.role, outlet: u.outlet, status: u.status });
    setDialogOpen(true);
  };

  // Ref selalu up-to-date, aman dipakai di dalam closure manapun
  const formRef = useRef(form);
  const editingUserRef = useRef(editingUser);
  useEffect(() => { formRef.current = form; }, [form]);
  useEffect(() => { editingUserRef.current = editingUser; }, [editingUser]);

  const handleSave = () => {
    const f = formRef.current;
    const editing = editingUserRef.current;
    const isValid = f.name && f.username && f.email && (editing || f.password);
    if (!isValid) return;

    if (editing) {
      setUsers((prev) =>
        prev.map((u) => u.id === editing.id ? { ...u, ...f, avatar: initials(f.name) } : u)
      );
    } else {
      setUsers((prev) => [{
        ...f,
        id: `USR-${String(++idCounter.current).padStart(3, "0")}`,
        avatar: initials(f.name),
        lastLogin: "Belum pernah masuk",
      }, ...prev]);
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
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Role legend */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(ROLE_META) as Role[]).map((role) => (
            <RoleCard key={role} role={role} />
          ))}
        </div>

        {/* Table */}
        <Card className="shadow-soft border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 flex-wrap">
            <div>
              <CardTitle className="font-display">Daftar Pengguna</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {filtered.length} dari {users.length} pengguna ditampilkan
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, username..."
                  className="pl-8 h-9 w-52 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>

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

              <Button
                onClick={openCreate}
                size="sm"
                className="gradient-bean text-primary-foreground shadow-warm hover:opacity-90 transition-opacity h-9"
              >
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
                    {TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 first:px-6 last:px-6 text-center first:text-left text-xs uppercase tracking-wider text-muted-foreground font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                        Tidak ada pengguna yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <UserRow
                        key={u.id}
                        user={u}
                        onEdit={() => openEdit(u)}
                        onDelete={() => setDeleteTarget(u)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add / Edit Dialog */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingUser={editingUser}
        form={form}
        onFormChange={setForm}
        onSave={handleSave}
      />

      {/* Delete Confirm */}
      <DeleteDialog
        target={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}