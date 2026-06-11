import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Check, X } from "lucide-react";

export type Item = {
  sku: string;
  name: string;
  origin: string;
  type: string;
  process: string;
  stock: number;
  unit: string;
  cost: number;
  price: number;
  harvest: string;
  supplier: string;
};

type Props = {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Item) => void;
};

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const stockTone = (s: number) =>
  s < 25
    ? "bg-destructive/10 text-destructive border-destructive/30"
    : s < 60
      ? "bg-crema/40 text-roast border-crema/50"
      : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
const stockLabel = (s: number) => (s < 25 ? "Kritis" : s < 60 ? "Menipis" : "Aman");

export default function InventoryDetailDialog({ item, open, onOpenChange, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Item | null>(null);

  // Reset draft when item changes or dialog opens
  useEffect(() => {
    if (item) {
      setDraft({ ...item });
      setEditing(false);
    }
  }, [item?.sku, open]);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    if (item) setDraft({ ...item });
    setEditing(false);
  };
  const saveEdit = () => {
    if (!draft) return;
    onSave(draft);
    setEditing(false);
  };

  const margin = (d: Item) => (d.price > 0 ? (((d.price - d.cost) / d.price) * 100).toFixed(1) : "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {draft && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 pr-10">
                {editing ? (
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="font-display text-2xl font-semibold h-auto py-1"
                  />
                ) : (
                  <DialogTitle className="font-display text-2xl">{item?.name}</DialogTitle>
                )}
              </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 py-2">
              <Field label="SKU" value={draft.sku} editing={false} />
              <Field label="Supplier" value={draft.supplier} editing={editing} onChange={(v) => setDraft({ ...draft, supplier: v })} />
              <Field label="Origin" value={draft.origin} editing={editing} onChange={(v) => setDraft({ ...draft, origin: v })} />
              <Field label="Harvest" value={draft.harvest} editing={editing} onChange={(v) => setDraft({ ...draft, harvest: v })} />
              <Field label="Tipe" value={draft.type} editing={editing} onChange={(v) => setDraft({ ...draft, type: v })} />
              <Field label="Proses" value={draft.process} editing={editing} onChange={(v) => setDraft({ ...draft, process: v })} />
              <Field label="Stok" value={`${draft.stock} ${draft.unit}`} editing={editing} type="number" rawValue={String(draft.stock)} onChange={(v) => setDraft({ ...draft, stock: Number(v) || 0 })} />
              <Field label="HPP" value={fmt(draft.cost)} editing={editing} type="number" rawValue={String(draft.cost)} onChange={(v) => setDraft({ ...draft, cost: Number(v) || 0 })} />
              <Field label="Harga Jual" value={fmt(draft.price)} editing={editing} type="number" rawValue={String(draft.price)} onChange={(v) => setDraft({ ...draft, price: Number(v) || 0 })} />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Margin</div>
                <div className="text-base mt-1">{margin(draft)}%</div>
              </div>
            </div>
            
            {/* Bagian ini diubah jadi Flexbox biar sejajar & posisinya pas di tengah */}
            <div className="flex items-stretch gap-3 pt-4 mt-2 border-t border-border/50">
              <div className={`flex-1 flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium ${stockTone(draft.stock)}`}>
                Status: {stockLabel(draft.stock)}
              </div>
              
              {editing ? (
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={cancelEdit} className="h-full rounded-lg">
                    <X className="h-4 w-4 mr-1" /> Batal
                  </Button>
                  <Button onClick={saveEdit} className="h-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    <Check className="h-4 w-4 mr-1" /> Simpan
                  </Button>
                </div>
              ) : (
                <Button onClick={startEdit} className="shrink-0 h-full px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, editing, onChange, type = "text", rawValue }: { label: string; value: string; editing: boolean; onChange?: (v: string) => void; type?: string; rawValue?: string; }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {editing && onChange ? (
        <Input type={type} value={rawValue ?? value} onChange={(e) => onChange(e.target.value)} className="h-9" />
      ) : (
        <div className="text-base">{value}</div>
      )}
    </div>
  );
}