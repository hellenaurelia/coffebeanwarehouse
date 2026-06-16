import { X, Download, ChevronDown } from "lucide-react";
import { useState } from "react";
import { type PO } from "../page";
import { generatePOPdf } from "./po-pdf";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const poTotal = (po: PO) =>
  po.items.reduce((a, i) => a + i.qty * i.pricePerKg, 0);

const poStatusTone = (s: string) =>
  s === "Diterima"
    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
    : s === "Dikirim"
      ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
      : s === "Cancelled"
        ? "bg-red-500/10 text-red-700 border-red-500/20"
        : "bg-amber-500/10 text-amber-700 border-amber-500/20";

// Status yang bisa dipilih dari status saat ini
// Diterima & Cancelled adalah status final — tidak bisa diubah lagi
const ALLOWED_TRANSITIONS: Record<PO["status"], PO["status"][]> = {
  Pending:    ["Dikirim", "Cancelled"],
  Dikirim:    ["Diterima", "Cancelled"],
  Diterima:   [],
  Cancelled:  [],
};

const STATUS_LABEL: Record<PO["status"], string> = {
  Pending:   "Pending",
  Dikirim:   "Dikirim",
  Diterima:  "Diterima",
  Cancelled: "Cancelled",
};


export function PODetailModal({
  po,
  onClose,
  onUpdateStatus,
  onUpdateArrival,
}: {
  po: PO;
  onClose: () => void;
  onUpdateStatus?: (poId: string, newStatus: PO["status"]) => void;
  onUpdateArrival?: (poId: string, date: string) => void;
}) {
  const total = poTotal(po);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PO["status"] | null>(null);

  const availableTransitions = ALLOWED_TRANSITIONS[po.status] ?? [];
  const isFinal = availableTransitions.length === 0;

  const handleSelect = (status: PO["status"]) => {
    setPendingStatus(status);
    setDropdownOpen(false);
  };

  const handleConfirm = () => {
    if (pendingStatus && onUpdateStatus) {
      onUpdateStatus(po.id, pendingStatus);
      if (pendingStatus === "Diterima") {
        const today = new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        onUpdateArrival?.(po.id, today);
      }
      setPendingStatus(null);
    }
  };

  const handleCancel = () => {
    setPendingStatus(null);
    setDropdownOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border/60 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border/60 pr-10 relative">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Detail Purchase Order
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{po.id}</p>
          </div>
          <button
            onClick={() => generatePOPdf(po)}
            className="absolute top-6 right-16 h-8 px-3 rounded-full bg-secondary flex items-center gap-1.5 text-xs font-medium hover:bg-border transition-colors shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Unduh PDF
          </button>
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
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                ID PO
              </div>
              <div className="text-base font-mono mt-1">{po.id}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Supplier
              </div>
              <div className="text-base mt-1">{po.supplierName}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Tanggal PO
              </div>
              <div className="text-base mt-1">{po.date}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Tanggal Tiba
              </div>
              <div className="text-base mt-1">{po.arrivalDate}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Dibuat Oleh
              </div>
              <div className="text-base mt-1">{po.createdBy ?? "-"}</div>
            </div>
          </div>

          {po.notes && (
            <div className="text-sm bg-secondary/30 border border-border/60 rounded-xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
                Catatan Tambahan
              </p>
              <p className="text-muted-foreground">{po.notes}</p>
            </div>
          )}

          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Rincian Item
            </div>
            <div className="rounded-xl overflow-hidden border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-xs text-muted-foreground">
                    <th className="font-medium px-4 py-2.5 text-left">
                      Biji Kopi
                    </th>
                    <th className="font-medium px-4 py-2.5 text-right">Qty</th>
                    <th className="font-medium px-4 py-2.5 text-right">
                      Harga/kg
                    </th>
                    <th className="font-medium px-4 py-2.5 text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {po.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-border/40 hover:bg-secondary/40"
                    >
                      <td className="px-4 py-3 font-medium">{item.bean}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {item.qty} kg
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {fmt(item.pricePerKg)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {fmt(item.qty * item.pricePerKg)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-border/60 bg-secondary/20">
                    <td
                      colSpan={3}
                      className="px-4 py-3 font-semibold text-right"
                    >
                      Total Keseluruhan
                    </td>
                    <td className="px-4 py-3 font-semibold text-right text-primary tabular-nums text-base">
                      {fmt(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            {/* Badge status saat ini */}
            <div
              className={`rounded-lg border px-4 py-3 text-center text-sm font-medium ${poStatusTone(po.status)}`}
            >
              Status Pengiriman: {po.status}
            </div>

            {/* Dropdown ubah status — hanya tampil jika ada transisi yang diizinkan */}
            {onUpdateStatus && !isFinal && !pendingStatus && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-full flex items-center justify-between rounded-lg border border-border/60 bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-border transition-colors"
                >
                  <span className="text-muted-foreground">Ubah Status…</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute bottom-full mb-1 left-0 w-full z-10 rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden">
                    {availableTransitions.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleSelect(status)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-secondary/60
                          ${status === "Cancelled" ? "text-red-600 hover:bg-red-500/5" : "text-foreground"}`}
                      >
                        <span
                          className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                            status === "Diterima"
                              ? "bg-emerald-500"
                              : status === "Dikirim"
                                ? "bg-blue-500"
                                : status === "Cancelled"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                          }`}
                        />
                        {STATUS_LABEL[status]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Panel konfirmasi — muncul setelah status dipilih dari dropdown */}
            {pendingStatus && (
              <div
                className={`rounded-xl border px-4 py-3 space-y-3 ${
                  pendingStatus === "Cancelled"
                    ? "bg-red-500/5 border-red-500/20"
                    : "bg-secondary/40 border-border/60"
                }`}
              >
                <p className="text-sm text-center">
                  Ubah status menjadi{" "}
                  <span
                    className={`font-semibold ${pendingStatus === "Cancelled" ? "text-red-600" : "text-foreground"}`}
                  >
                    {STATUS_LABEL[pendingStatus]}
                  </span>
                  ?{" "}
                  {pendingStatus === "Cancelled" && (
                    <span className="text-red-600/80 text-xs block mt-0.5">
                      Tindakan ini tidak bisa dibatalkan.
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex-1 rounded-lg border border-border/60 bg-card text-foreground px-4 py-2 text-sm font-medium hover:bg-border transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      pendingStatus === "Cancelled"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    Ya, Ubah
                  </button>
                </div>
              </div>
            )}

            {/* Keterangan jika status sudah final */}
            {isFinal && (
              <p className="text-center text-xs text-muted-foreground">
                Status ini sudah final dan tidak dapat diubah.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}