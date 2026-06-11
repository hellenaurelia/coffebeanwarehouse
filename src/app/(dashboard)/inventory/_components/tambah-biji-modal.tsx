"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { InventoryItem } from "../page";

interface TambahBijiModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

const TYPES = ["Arabica", "Robusta", "Liberica", "Luwak"];
const PROCESSES = ["Natural", "Honey", "Washed", "Dry", "Wild Civet", "Anaerobic"];

const empty = {
  name: "",
  sku: "",
  supplier: "",
  origin: "",
  type: "Arabica",
  process: "Natural",
  stock: "",
  cost: "",
  price: "",
  harvest: "",
};

export function TambahBijiModal({ open, onClose, onSave }: TambahBijiModalProps) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.sku.trim()) e.sku = "SKU wajib diisi";
    if (!form.supplier.trim()) e.supplier = "Supplier wajib diisi";
    if (!form.origin.trim()) e.origin = "Origin wajib diisi";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Stok tidak valid";
    if (!form.cost || isNaN(Number(form.cost)) || Number(form.cost) < 0) e.cost = "HPP tidak valid";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Harga tidak valid";
    if (!form.harvest.trim()) e.harvest = "Harvest wajib diisi";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave({
      sku: form.sku.toUpperCase(),
      name: form.name,
      supplier: form.supplier,
      origin: form.origin,
      type: form.type,
      process: form.process,
      stock: Number(form.stock),
      unit: "kg",
      cost: Number(form.cost),
      price: Number(form.price),
      harvest: form.harvest,
    });
    setForm(empty);
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setForm(empty);
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-card rounded-t-2xl md:rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Tambah Biji Kopi</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nama Produk" error={errors.name}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Gayo Wine Natural" className="rounded-xl" />
          </Field>
          <Field label="SKU" error={errors.sku}>
            <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="GYO-WN-001" className="rounded-xl font-mono" />
          </Field>
          <Field label="Supplier" error={errors.supplier}>
            <Input value={form.supplier} onChange={(e) => set("supplier", e.target.value)} placeholder="CV Gayo Mandiri" className="rounded-xl" />
          </Field>
          <Field label="Origin / Daerah" error={errors.origin}>
            <Input value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Aceh" className="rounded-xl" />
          </Field>

          <Field label="Tipe Biji">
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Metode Proses">
            <select
              value={form.process}
              onChange={(e) => set("process", e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {PROCESSES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Stok (kg)" error={errors.stock}>
            <Input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="100" className="rounded-xl" />
          </Field>
          <Field label="Harvest" error={errors.harvest}>
            <Input value={form.harvest} onChange={(e) => set("harvest", e.target.value)} placeholder="Mar 2026" className="rounded-xl" />
          </Field>

          <Field label="HPP (Rp)" error={errors.cost}>
            <Input type="number" min="0" value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="165000" className="rounded-xl" />
          </Field>
          <Field label="Harga Jual (Rp)" error={errors.price}>
            <Input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="280000" className="rounded-xl" />
          </Field>
        </div>

        {/* Margin preview */}
        {form.cost && form.price && Number(form.price) > 0 && (
          <div className="rounded-xl bg-secondary/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Margin estimasi: </span>
            <span className="font-semibold text-emerald-600">
              {(((Number(form.price) - Number(form.cost)) / Number(form.price)) * 100).toFixed(1)}%
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={handleClose}>Batal</Button>
          <Button className="flex-1 rounded-xl bg-primary text-primary-foreground" onClick={handleSave}>Simpan</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}