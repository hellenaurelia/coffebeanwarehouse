"use client";

import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { PORows } from "../_components/shared-components";
import { useSupplierContext } from "../_components/supplier-context";

export default function RiwayatPOPage() {
  const { pos, setModal } = useSupplierContext();

  return (
    <>
      <Topbar title="Riwayat Purchase Order" subtitle="Daftar seluruh purchase order ke supplier" />
      <main className="flex-1 p-6 space-y-6">
        <Card className="shadow-soft border-border/60">
          <CardContent className="p-5">
            <h2 className="font-display text-base font-semibold mb-4">Riwayat Purchase Order</h2>
            <div className="rounded-xl overflow-hidden border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/60 text-xs text-muted-foreground">
                    {["ID PO","Supplier","Tanggal PO","Tanggal Tiba","Total","Status","Aksi"].map((h, i) => (
                      <th key={h} className={`font-medium px-4 py-2.5 ${i===4 || i===5 || i===6?"text-center":"text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody><PORows pos={pos} showSupplier onDetail={(po) => setModal({ type: "po-detail", po })} /></tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
