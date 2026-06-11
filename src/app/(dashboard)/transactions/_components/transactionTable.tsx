"use client";

import { Download, Eye, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DateFilter } from "./dateFilter";
import { fmt, methodIcon, exportCSV } from "../lib";
import type { Method, Trx, DateRange } from "../types";

const COLS = ["ID Transaksi", "Tanggal", "Kasir", "Item", "Total", "Metode", ""];

interface TransactionTableProps {
  rows: Trx[];
  totalCount: number;
  method: "Semua" | Method;
  range: DateRange;
  search: string;
  onMethodChange: (m: "Semua" | Method) => void;
  onRangeChange: (r: DateRange) => void;
  onSearchChange: (s: string) => void;
  onSelect: (t: Trx) => void;
}

export function TransactionTable({
  rows,
  totalCount,
  method,
  range,
  search,
  onMethodChange,
  onRangeChange,
  onSearchChange,
  onSelect,
}: TransactionTableProps) {
  return (
    <Card className="shadow-soft border-border/60">
      <CardContent className="p-5">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari ID transaksi atau kasir…"
              className="h-10 pl-10 rounded-xl bg-secondary/50"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {(["Semua", "Cash", "Kartu", "QRIS"] as const).map(m => (
              <button
                key={m}
                onClick={() => onMethodChange(m)}
                className={`h-9 px-4 rounded-full text-sm border transition-colors ${
                  method === m
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-secondary"
                }`}
              >
                {m}
              </button>
            ))}
            <DateFilter range={range} onChange={onRangeChange} />
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => exportCSV(rows)}
            >
              <Download className="h-4 w-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 -mx-2" style={{ height: 420, overflowY: "auto" }}>
          <table
            className="w-full text-sm"
            style={{ tableLayout: "fixed", minWidth: 600 }}
          >
            <colgroup>
              <col style={{ width: 110 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 52 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 88 }} />
              <col style={{ width: 80 }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                {COLS.map((h, i) => (
                  <th
                    key={i}
                    className={`font-medium px-3 py-3 ${
                      h === "Item" || h === "Total" ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-muted-foreground"
                  >
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                rows.map(t => {
                  const Icon = methodIcon[t.method];
                  return (
                    <tr
                      key={t.id}
                      className="border-t border-border/60 hover:bg-secondary/40 transition-colors"
                    >
                      <td className="px-3 py-4 font-mono text-xs">{t.id}</td>
                      <td className="px-3 py-4">
                        <div>{t.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.time}
                        </div>
                      </td>
                      <td className="px-3 py-4">{t.cashier}</td>
                      <td className="px-3 py-4 text-right tabular-nums">
                        {t.items}
                      </td>
                      <td className="px-3 py-4 text-right tabular-nums font-medium">
                        {fmt(t.total)}
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          {t.method}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                          onClick={() => onSelect(t)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3 px-1">
          Menampilkan {rows.length} dari {totalCount} transaksi
        </p>
      </CardContent>
    </Card>
  );
}