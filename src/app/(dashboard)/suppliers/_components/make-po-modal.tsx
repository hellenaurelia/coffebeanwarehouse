"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ClipboardList } from "lucide-react";
import type { Supplier, PO } from "../page";
import { Modal, ModalHeader, ModalFooter, Field, ErrMsg, NumericInput, INP, TA, DATE_CLS, fmt } from "./shared-components";

export function BuatPOModal({ suppliers, defaultSupplier, onClose, onSave }: {
  suppliers: Supplier[]; defaultSupplier?: Supplier;
  onClose: () => void; onSave: (po: Omit<PO, "id">) => void;
}) {
  const [supplierId, setSupplierId] = useState(defaultSupplier?.id ?? "");
  const [date, setDate]   = useState("");
  const [eta, setEta]     = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ bean:"", qty:"", pricePerKg:"" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selected = suppliers.find(s => s.id === supplierId);
  const total = items.reduce((acc, i) => acc + (parseInt(i.qty,10)||0) * (parseInt(i.pricePerKg,10)||0), 0);
  const setItem = (i: number, k: string, v: string) => setItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  useEffect(() => {
    if (!defaultSupplier || supplierId !== defaultSupplier.id) {
       setItems([{ bean:"", qty:"", pricePerKg:"" }]);
    }
  }, [supplierId, defaultSupplier]);

  const handleBeanSelect = (i: number, selectedBeanName: string) => {
    const targetBean = selected?.beans.find(b => b.name === selectedBeanName);
    const configuredPrice = targetBean ? targetBean.price.toString() : "";

    setItems(p => p.map((item, idx) => idx === i ? { 
      ...item, 
      bean: selectedBeanName, 
      pricePerKg: configuredPrice
    } : item));
  };

  function handleSave() {
    const e: Record<string, string> = {};
    if (!supplierId) e.supplier = "Pilih supplier";
    if (!date) e.date = "Wajib diisi";
    if (!eta)  e.eta  = "Wajib diisi";
    items.forEach((item, i) => {
      if (!item.bean.trim())                        e[`bean_${i}`]  = "Wajib diisi";
      if (!item.qty || parseInt(item.qty,10) <= 0)  e[`qty_${i}`]   = "Harus > 0";
      if (!item.pricePerKg || parseInt(item.pricePerKg,10) <= 0) e[`price_${i}`] = "Harus > 0";
    });
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      supplierId, supplierName: selected?.name ?? "", date,
      estimatedArrival: eta, notes: notes.trim(), status: "Pending",
      items: items.map(i => ({ bean: i.bean.trim(), qty: parseInt(i.qty,10), pricePerKg: parseInt(i.pricePerKg,10) })),
    });
  }

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader title="Buat Purchase Order" subtitle="Order biji kopi dari supplier" onClose={onClose} />
      <div className="p-6 space-y-5">
        <Field label="Supplier">
          <select className={`${INP} w-full border border-input px-3 focus:outline-none focus:ring-2 focus:ring-ring`} value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">Pilih supplier…</option>
            {suppliers.filter(s => s.status === "Aktif").map(s => <option key={s.id} value={s.id}>{s.name} — {s.region}</option>)}
          </select>
          <ErrMsg msg={errors.supplier} />
        </Field>

        {selected && (
          <div className="flex flex-wrap gap-1">
            {selected.beans.map(b => <Badge key={b.name} variant="outline" className="text-xs bg-secondary/60">{b.name}</Badge>)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tanggal PO"><Input className={DATE_CLS} type="date" value={date} onChange={e => setDate(e.target.value)} /><ErrMsg msg={errors.date} /></Field>
          <Field label="Estimasi Tiba"><Input className={DATE_CLS} type="date" value={eta} onChange={e => setEta(e.target.value)} /><ErrMsg msg={errors.eta} /></Field>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Item Order</label>
            <button onClick={() => setItems(p => [...p, { bean:"", qty:"", pricePerKg:"" }])} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Plus className="h-3 w-3" />Tambah Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                
                <select 
                  className={`${INP} flex-1 border border-input px-3 disabled:opacity-50`} 
                  value={item.bean} 
                  onChange={e => handleBeanSelect(i, e.target.value)}
                  disabled={!selected}
                >
                  <option value="">{selected ? "Pilih Biji Kopi..." : "Pilih Supplier Dulu"}</option>
                  {selected?.beans.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                </select>

                <NumericInput className={`${INP} w-24`} placeholder="Qty (kg)" value={item.qty} onChange={v => setItem(i, "qty", v)} />
                <NumericInput className={`${INP} w-32`} placeholder="Harga/kg" value={item.pricePerKg} onChange={v => setItem(i, "pricePerKg", v)} />
                {items.length > 1 && (
                  <button onClick={() => setItems(p => p.filter((_,idx) => idx !== i))} className="h-10 w-10 flex items-center justify-center rounded-xl border border-border hover:bg-secondary text-muted-foreground transition-colors shrink-0"><X className="h-4 w-4" /></button>
                )}
              </div>
            ))}
            {items.some((_, i) => errors[`bean_${i}`] || errors[`qty_${i}`] || errors[`price_${i}`]) && (
              items.map((_, i) => (
                <div key={`err_${i}`} className="flex gap-2">
                  <div className="flex-1"><ErrMsg msg={errors[`bean_${i}`]} /></div>
                  <div className="w-24"><ErrMsg msg={errors[`qty_${i}`]} /></div>
                  <div className="w-32"><ErrMsg msg={errors[`price_${i}`]} /></div>
                  {items.length > 1 && <div className="w-10" />}
                </div>
              ))
            )}
          </div>
        </div>

        {total > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Nilai PO</span>
            <span className="font-semibold text-primary">{fmt(total)}</span>
          </div>
        )}

        <Field label="Catatan">
          <textarea className={`${TA} min-h-[72px]`} placeholder="Instruksi pengiriman, catatan kualitas…" value={notes} onChange={e => setNotes(e.target.value)} />
        </Field>
      </div>
      <ModalFooter onClose={onClose} onConfirm={handleSave} confirmLabel="Buat PO" icon={ClipboardList} />
    </Modal>
  );
}