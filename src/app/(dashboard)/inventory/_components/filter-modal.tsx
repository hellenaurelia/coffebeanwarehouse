"use client";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { InventoryItem } from "@/app/(dashboard)/inventory/page";

export interface FilterValues {
  type: string[];
  stockStatus: string[];
}

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  items: InventoryItem[];
  values: FilterValues;
  onChange: (v: FilterValues) => void;
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export function FilterModal({ open, onClose, items, values, onChange }: FilterModalProps) {
  const types = useMemo(() => [...new Set(items.map((i) => i.type))], [items]);
  const statuses = ["Aman", "Menipis", "Kritis"];

  if (!open) return null;

  const totalActive = values.type.length + values.stockStatus.length;
  const reset = () => onChange({ type: [], stockStatus: [] });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-card rounded-t-2xl md:rounded-2xl shadow-xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Filter Inventory</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <Section label="Tipe Biji">
          {types.map((t) => (
            <FilterChip key={t} label={t} active={values.type.includes(t)}
              onClick={() => onChange({ ...values, type: toggle(values.type, t) })} />
          ))}
        </Section>

        <Section label="Status Stok">
          {statuses.map((s) => (
            <FilterChip key={s} label={s} active={values.stockStatus.includes(s)}
              onClick={() => onChange({ ...values, stockStatus: toggle(values.stockStatus, s) })} />
          ))}
        </Section>

        <div className="flex gap-2 pt-2">
          {totalActive > 0 && (
            <Button variant="outline" className="flex-1 rounded-xl" onClick={reset}>Reset ({totalActive})</Button>
          )}
          <Button className="flex-1 rounded-xl bg-primary text-primary-foreground" onClick={onClose}>Terapkan</Button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/60 text-foreground border-border/60 hover:bg-secondary"
      }`}>
      {label}
    </button>
  );
}