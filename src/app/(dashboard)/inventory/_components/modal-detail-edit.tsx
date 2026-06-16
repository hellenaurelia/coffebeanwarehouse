import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Check, X, Camera, Coffee } from "lucide-react";

export type Item = {
  sku: string;
  name: string;
  type: string;
  stock: number;
  unit: string;
  cost: number;
  price: number;
  exp: string;
  supplier: string;
  photo?: string;
};

type Props = {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Item) => void;
};

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const stockTone = (s: number) =>
  s < 25 ? "bg-destructive/10 text-destructive border-destructive/30"
  : s < 60 ? "bg-crema/40 text-roast border-crema/50"
  : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
const stockLabel = (s: number) => (s < 25 ? "Kritis" : s < 60 ? "Menipis" : "Aman");

export default function InventoryDetailDialog({ item, open, onOpenChange, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Item | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) { setDraft({ ...item }); setEditing(false); }
  }, [item?.sku, open]);

  const cancelEdit = () => { if (item) setDraft({ ...item }); setEditing(false); };
  const saveEdit = () => { if (!draft) return; onSave(draft); setEditing(false); };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    const reader = new FileReader();
    reader.onload = () => setDraft({ ...draft, photo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const margin = (d: Item) => (d.price > 0 ? (((d.price - d.cost) / d.price) * 100).toFixed(1) : "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {draft && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4 pr-10">
                {/* Photo */}
                <div className="relative shrink-0 group">
                  <div className="h-20 w-20 rounded-xl overflow-hidden border border-border/60 bg-secondary flex items-center justify-center">
                    {draft.photo ? (
                      <img src={draft.photo} alt={draft.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full gradient-bean flex items-center justify-center">
                        <Coffee className="h-8 w-8 text-primary-foreground/80" />
                      </div>
                    )}
                  </div>
                  {editing && (
                    <div className="absolute inset-0 rounded-xl bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileRef.current?.click()}>
                      <Camera className="h-5 w-5 text-white" />
                      <span className="text-[10px] text-white font-medium">Ganti</span>
                    </div>
                  )}
                  {editing && draft.photo && (
                    <button onClick={() => setDraft({ ...draft, photo: undefined })}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-sm hover:bg-destructive/80">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>

                {/* Name */}
                <div className="flex-1 pt-1">
                  {editing ? (
                    <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="font-display text-xl font-semibold h-auto py-1" />
                  ) : (
                    <DialogTitle className="font-display text-2xl">{item?.name}</DialogTitle>
                  )}
                  {editing && <p className="text-xs text-muted-foreground mt-1.5">Klik foto untuk mengganti gambar</p>}
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 py-2">
              <Field label="SKU" value={draft.sku} editing={false} />
              <Field label="Supplier" value={draft.supplier} editing={false} />
              <Field label="Tipe" value={draft.type} editing={false} />
              <Field label="Exp." value={draft.exp || "—"} editing={false} />
              <Field label="Stok" value={`${draft.stock} ${draft.unit}`} editing={false} />
              <Field label="Harga Beli" value={fmt(draft.cost)} editing={editing} type="number" rawValue={String(draft.cost)} onChange={(v) => setDraft({ ...draft, cost: Number(v) || 0 })} />
              <Field label="Harga Jual" value={fmt(draft.price)} editing={editing} type="number" rawValue={String(draft.price)} onChange={(v) => setDraft({ ...draft, price: Number(v) || 0 })} />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Margin</div>
                <div className="text-base mt-1">{margin(draft)}%</div>
              </div>
            </div>

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
                <Button onClick={() => setEditing(true)} className="shrink-0 h-full px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
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

function Field({ label, value, editing, onChange, type = "text", rawValue }: {
  label: string; value: string; editing: boolean; onChange?: (v: string) => void; type?: string; rawValue?: string;
}) {
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