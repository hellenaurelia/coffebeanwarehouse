"use client";

import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  Star,
  Truck,
  PackageCheck,
  Users,
} from "lucide-react";

type Supplier = {
  id: string;
  name: string;
  pic: string;
  region: string;
  phone: string;
  email: string;
  beans: string[];
  rating: number;
  lastDelivery: string;
  totalKg: number;
  status: "Aktif" | "Pending" | "Non-aktif";
};

const data: Supplier[] = [
  {
    id: "S-001",
    name: "Koperasi Tani Gayo",
    pic: "Pak Munir",
    region: "Aceh Tengah",
    phone: "+62 812-3344-5566",
    email: "munir@gayotani.id",
    beans: ["Arabica", "Gayo Wine"],
    rating: 4.9,
    lastDelivery: "2 hari lalu",
    totalKg: 1840,
    status: "Aktif",
  },
  {
    id: "S-002",
    name: "Kintamani Highland",
    pic: "Bu Wayan",
    region: "Bangli, Bali",
    phone: "+62 821-7788-9900",
    email: "wayan@kintamani.co",
    beans: ["Arabica Honey"],
    rating: 4.7,
    lastDelivery: "5 hari lalu",
    totalKg: 1240,
    status: "Aktif",
  },
  {
    id: "S-003",
    name: "Toraja Coffee Hub",
    pic: "Pak Reynaldi",
    region: "Tana Toraja",
    phone: "+62 813-2211-0099",
    email: "rey@torajacoffee.id",
    beans: ["Arabica Sapan"],
    rating: 4.8,
    lastDelivery: "1 minggu lalu",
    totalKg: 980,
    status: "Aktif",
  },
  {
    id: "S-004",
    name: "Lampung Robusta Mills",
    pic: "Pak Hendra",
    region: "Lampung Barat",
    phone: "+62 822-5544-3322",
    email: "hendra@lrm.id",
    beans: ["Robusta AAA", "Robusta Honey"],
    rating: 4.6,
    lastDelivery: "3 hari lalu",
    totalKg: 3120,
    status: "Aktif",
  },
  {
    id: "S-005",
    name: "Civet Farm Lampung",
    pic: "Pak Jaka",
    region: "Liwa, Lampung",
    phone: "+62 815-9988-7766",
    email: "jaka@civetfarm.id",
    beans: ["Luwak Premium"],
    rating: 4.9,
    lastDelivery: "2 minggu lalu",
    totalKg: 64,
    status: "Aktif",
  },
  {
    id: "S-006",
    name: "Preanger Estate",
    pic: "Bu Salma",
    region: "Garut, Jawa Barat",
    phone: "+62 819-1122-3344",
    email: "salma@preanger.id",
    beans: ["Arabica Java"],
    rating: 4.5,
    lastDelivery: "10 hari lalu",
    totalKg: 1520,
    status: "Pending",
  },
  {
    id: "S-007",
    name: "Riau Liberica Co",
    pic: "Pak Daud",
    region: "Meranti, Riau",
    phone: "+62 811-2233-4455",
    email: "daud@liberica.id",
    beans: ["Liberica"],
    rating: 4.3,
    lastDelivery: "3 minggu lalu",
    totalKg: 280,
    status: "Non-aktif",
  },
];

const statusTone = (s: Supplier["status"]) =>
  s === "Aktif"
    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
    : s === "Pending"
    ? "bg-crema/40 text-roast border-crema/50"
    : "bg-muted text-muted-foreground border-border";

export default function SuppliersPage() {
  return (
    <>
      <Topbar
        title="Supplier"
        subtitle="Mitra petani & koperasi penyuplai biji kopi"
      />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Total Supplier",
              value: "7",
              sub: "5 aktif",
              icon: Users,
            },
            {
              label: "Total Pasokan",
              value: "9.044 kg",
              sub: "Tahun ini",
              icon: PackageCheck,
            },
            {
              label: "Pengiriman Aktif",
              value: "3",
              sub: "Estimasi tiba minggu ini",
              icon: Truck,
            },
            {
              label: "Rating Rata-rata",
              value: "4.7",
              sub: "Dari 7 mitra",
              icon: Star,
            },
          ].map((s) => (
            <Card key={s.label} className="shadow-soft border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>

                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <div className="mt-3 font-display text-2xl font-semibold">
                  {s.value}
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  {s.sub}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari supplier, region, atau jenis biji…"
              className="h-10 pl-10 rounded-xl bg-secondary/50"
            />
          </div>

          <Button className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Supplier
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((s) => (
            <Card
              key={s.id}
              className="border-border/60 hover:shadow-warm transition-all"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl gradient-crema flex items-center justify-center shrink-0 shadow-warm">
                    <span className="font-display text-base font-semibold text-primary-foreground">
                      {s.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold truncate">
                          {s.name}
                        </h3>

                        <div className="text-xs text-muted-foreground">
                          {s.id} · {s.pic}
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={statusTone(s.status)}
                      >
                        {s.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {s.beans.map((b) => (
                    <Badge
                      key={b}
                      variant="outline"
                      className="text-[10px] bg-secondary/60"
                    >
                      {b}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {s.region}
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {s.phone}
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {s.email}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                  <div>
                    <div className="text-muted-foreground">
                      Total pasokan
                    </div>

                    <div className="font-medium tabular-nums text-foreground text-sm">
                      {s.totalKg.toLocaleString("id-ID")} kg
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Pengiriman</div>

                    <div className="font-medium text-foreground text-sm">
                      {s.lastDelivery}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                    <span className="font-medium text-foreground text-sm">
                      {s.rating}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                  >
                    Detail
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Buat PO
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}