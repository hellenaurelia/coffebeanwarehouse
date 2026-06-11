import { X } from "lucide-react";
import { type PO } from "../page";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const poTotal = (po: PO) => po.items.reduce((a, i) => a + i.qty * i.pricePerKg, 0);

const poStatusTone = (s: string) =>
  s === "Diterima" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
  s === "Dikirim"  ? "bg-blue-500/10 text-blue-700 border-blue-500/20" :
                     "bg-amber-500/10 text-amber-700 border-amber-500/20";

export function PODetailModal({ po, onClose }: { po: PO; onClose: () => void }) {
  const total = poTotal(po);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-card border border-border/60 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border/60 pr-10 relative">
          <div>
            <h2 className="font-display text-lg font-semibold">Detail Purchase Order</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{po.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">ID PO</div>
              <div className="text-base font-mono mt-1">{po.id}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Supplier</div>
              <div className="text-base mt-1">{po.supplierName}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Tanggal PO</div>
              <div className="text-base mt-1">{po.date}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Estimasi Tiba</div>
              <div className="text-base mt-1">{po.estimatedArrival}</div>
            </div>
          </div>

          {po.notes && (
            <div className="text-sm bg-secondary/30 border border-border/60 rounded-xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Catatan Tambahan</p>
              <p className="text-muted-foreground">{po.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Rincian Item</h3>
            <div className="rounded-xl overflow-hidden border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-xs text-muted-foreground">
                    <th className="font-medium px-4 py-2.5 text-left">Biji Kopi</th>
                    <th className="font-medium px-4 py-2.5 text-right">Qty</th>
                    <th className="font-medium px-4 py-2.5 text-right">Harga/kg</th>
                    <th className="font-medium px-4 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {po.items.map((item, idx) => (
                    <tr key={idx} className="border-t border-border/40 hover:bg-secondary/40">
                      <td className="px-4 py-3 font-medium">{item.bean}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{item.qty} kg</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmt(item.pricePerKg)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{fmt(item.qty * item.pricePerKg)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-border/60 bg-secondary/20">
                    <td colSpan={3} className="px-4 py-3 font-semibold text-right">Total Keseluruhan</td>
                    <td className="px-4 py-3 font-semibold text-right text-primary tabular-nums text-base">{fmt(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={`rounded-lg border px-4 py-3 text-center text-sm font-medium ${poStatusTone(po.status)}`}>
            Status Pengiriman: {po.status}
          </div>
        </div>
      </div>
    </div>
  );
}