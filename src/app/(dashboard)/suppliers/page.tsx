"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MapPin, Phone, Mail, Truck, PackageCheck, Users, X, ClipboardList, Pencil, Trash2 } from "lucide-react";

import { BTN_OUTLINE, BTN_PRIMARY } from "./_components/shared-components";
import { fmtKg, initials, statusTone, BTN_HOVER_COKLAT, BTN_ICON_DEL, BTN_ICON_EDT } from "./lib";
import { useSupplierContext } from "./_components/supplier-context";

export type { SupplierStatus, POStatus, SupplierBean, Supplier, PO } from "./lib";

export default function SuppliersPage() {
  const { suppliers, setModal } = useSupplierContext();
  const [search, setSearch] = useState("");

  // Menyesuaikan pencarian array objek beans
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? suppliers.filter(s => [s.name, s.region, s.pic, ...s.beans.map(b => b.name)].some(v => v.toLowerCase().includes(q))) : suppliers;
  }, [suppliers, search]);

  const stats = [
    { label:"Supplier Aktif",     value:`${suppliers.filter(s=>s.status==="Aktif").length}`,  sub:"Partner aktif",      icon:Users },
    { label:"Pasokan Bulan Ini",  value:fmtKg(suppliers.reduce((a,s)=>a+s.totalKg,0)),        sub:"+8% vs bulan lalu",  icon:PackageCheck },
    { label:"Nilai PO Aktif",     value:`Rp28.000.000`,      sub:"+15% vs bulan lalu", icon:Truck },
  ];

  return (
    <>
      <Topbar title="Supplier" subtitle="Mitra petani & koperasi penyuplai biji kopi" />
      <main className="flex-1 p-6 space-y-6">

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(s => (
            <Card key={s.label} className="shadow-soft border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari supplier, region, atau jenis biji…" className="h-10 pl-10 rounded-xl bg-secondary/50" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className={`h-10 ${BTN_OUTLINE}`} onClick={() => setModal({ type:"po" })}><ClipboardList className="h-4 w-4 mr-2" />Buat PO</Button>
            <Button className={`h-10 ${BTN_PRIMARY}`} onClick={() => setModal({ type:"supplier" })}><Plus className="h-4 w-4 mr-2" />Tambah Supplier</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">Tidak ada supplier yang cocok dengan pencarian.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(s => (
              <Card key={s.id} className="border-border/60 hover:shadow-warm transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl gradient-crema flex items-center justify-center shrink-0 shadow-warm"><span className="font-display text-base font-semibold text-primary-foreground">{initials(s.name)}</span></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0"><h3 className="font-display text-base font-semibold truncate">{s.name}</h3><div className="text-xs text-muted-foreground">{s.id} · {s.pic}</div></div>
                        <Badge variant="outline" className={statusTone(s.status)}>{s.status}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* UPDATE: Akses b.name karena b sudah berbentuk objek */}
                  <div className="flex flex-wrap gap-1">{s.beans.map(b => <Badge key={b.name} variant="outline" className="text-[10px] bg-secondary/60">{b.name}</Badge>)}</div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{s.region}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{s.phone}</div>
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{s.email}</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                    <div><div className="text-muted-foreground">Total pasokan</div><div className="font-medium tabular-nums text-foreground text-sm">{fmtKg(s.totalKg)}</div></div>
                    <div><div className="text-muted-foreground">Pengiriman</div><div className="font-medium text-foreground text-sm">{s.lastDelivery}</div></div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className={BTN_ICON_DEL} onClick={() => setModal({ type:"hapus", supplier:s })} title="Hapus"><Trash2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" className={BTN_ICON_EDT} onClick={() => setModal({ type:"supplier", supplier:s })} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" className={`flex-1 h-8 text-xs rounded-lg ${BTN_HOVER_COKLAT}`} onClick={() => setModal({ type:"detail", supplier:s })}>Detail</Button>
                    <Button size="sm" className={`flex-1 ${BTN_PRIMARY} h-8 text-xs`} onClick={() => setModal({ type:"po", supplier:s })}>Buat PO</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
