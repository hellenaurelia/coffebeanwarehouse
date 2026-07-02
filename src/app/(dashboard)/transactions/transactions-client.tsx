"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/topbar";
import { StatsCards } from "./_components/statsCards";
import { TransactionTable } from "./_components/transactionTable";
import { DetailModal } from "./_components/detailModal";
import { parseDate, sod } from "./lib";
import type { Method, Trx, DateRange } from "./types";

export default function TransactionsClient({ data }: { data: Trx[] }) {
  const [method, setMethod] = useState<"Semua" | Method>("Semua");
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Trx | null>(null);

  const today = useMemo(() => {
    if (data.length === 0) return null;
    return data.reduce((latest, t) => {
      const d = parseDate(t.date);
      return d > latest ? d : latest;
    }, parseDate(data[0].date));
  }, [data]);

  const rows = useMemo(
    () =>
      data.filter(t => {
        if (method !== "Semua" && t.method !== method) return false;
        if (range.from) {
          const d = sod(parseDate(t.date));
          const to = range.to ?? range.from;
          if (d < range.from || d > to) return false;
        }
        if (search) {
          const q = search.toLowerCase();
          if (
            !t.id.toLowerCase().includes(q) &&
            !t.cashier.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [data, method, range, search]
  );

  const todayData = today
    ? data.filter(t => sod(parseDate(t.date)).getTime() === sod(today).getTime())
    : [];

  return (
    <>
      <Topbar title="Transaksi" subtitle="Riwayat penjualan & rekonsiliasi kasir" />
      <main className="flex-1 p-6 space-y-6">
        <StatsCards todayData={todayData} />
        <TransactionTable
          rows={rows}
          totalCount={data.length}
          method={method}
          range={range}
          search={search}
          onMethodChange={setMethod}
          onRangeChange={setRange}
          onSearchChange={setSearch}
          onSelect={setSelected}
        />
      </main>

      {selected && (
        <DetailModal trx={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}