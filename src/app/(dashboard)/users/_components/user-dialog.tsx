import { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { ROLE_META, OUTLETS } from "../_lib/constants";
import type { Role, Outlet, User, UserForm } from "../_lib/types";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  form: UserForm;
  onFormChange: (form: UserForm) => void;
  onSave: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  editingUser,
  form,
  onFormChange,
  onSave,
}: UserDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isValid = form.name && form.username && form.email && (editingUser || form.password);

  // Tangkap Enter di setiap input — stop propagation biar gak bocor ke luar portal
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (isValid) onSave();
    }
  };

  const set = (patch: Partial<UserForm>) => onFormChange({ ...form, ...patch });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => set({ name: e.target.value })}
              onKeyDown={onInputKeyDown}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                placeholder="budi.santoso"
                value={form.username}
                onChange={(e) => set({ username: e.target.value })}
                onKeyDown={onInputKeyDown}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="budi@arunika.id"
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
                onKeyDown={onInputKeyDown}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {editingUser ? "Password Baru" : "Password"}
              {editingUser && (
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  (kosongkan jika tidak diubah)
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={editingUser ? "Biarkan kosong jika tidak diubah" : "Minimal 8 karakter"}
                className="pr-9"
                value={form.password}
                onChange={(e) => set({ password: e.target.value })}
                onKeyDown={onInputKeyDown}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => set({ role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Outlet</Label>
              <Select value={form.outlet} onValueChange={(v) => set({ outlet: v as Outlet })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTLETS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set({ status: v as "aktif" | "nonaktif" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={`rounded-lg border px-4 py-3 text-xs ${ROLE_META[form.role].color}`}>
            <p className="font-medium">{ROLE_META[form.role].label}</p>
            <p className="mt-0.5 opacity-80">{ROLE_META[form.role].desc}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button
            onClick={onSave}
            disabled={!isValid}
            className="gradient-bean text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {editingUser ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}