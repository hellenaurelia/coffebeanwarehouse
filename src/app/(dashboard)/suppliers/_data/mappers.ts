
import type {
  Supplier as UISupplier,
  PO as UIPO,
  SupplierStatus,
  POStatus,
  SupplierBean,
} from "../lib";

export function supplierStatusFromDb(isActive: boolean): SupplierStatus {
  return isActive ? "Aktif" : "Non-aktif";
}

export function supplierIsActiveFromUi(status: SupplierStatus): boolean {
  return status === "Aktif";
}

const PO_DB_TO_UI: Record<string, POStatus> = {
  PENDING: "Pending",
  DIKIRIM: "Dikirim",
  DITERIMA: "Diterima",
  CANCELLED: "Cancelled",
};
const PO_UI_TO_DB: Record<POStatus, "PENDING" | "DIKIRIM" | "DITERIMA" | "CANCELLED"> = {
  Pending: "PENDING",
  Dikirim: "DIKIRIM",
  Diterima: "DITERIMA",
  Cancelled: "CANCELLED",
};

export function poStatusFromDb(s: string): POStatus {
  return PO_DB_TO_UI[s] ?? "Pending";
}
export function poStatusToDb(s: POStatus) {
  return PO_UI_TO_DB[s] ?? "PENDING";
}

const ID_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// DB DateTime -> "7 Mei 2026"
export function fmtTanggalID(d: Date | null | undefined): string {
  if (!d) return "-";
  return `${d.getDate()} ${ID_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

// "x hari lalu" relative label for lastDelivery (best-effort from latest received PO).
export function relativeID(d: Date | null | undefined): string {
  if (!d) return "-";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

export type DbSupplierRow = {
  id: string;
  supplierCode: string;
  name: string;
  picName: string;
  region: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  supplierProducts: {
    buyPricePerKg: number;
    isActive: boolean;
    product: { name: string; variety: string | null; stockKg: number };
  }[];
  purchaseOrders: {
    status: string;
    receivedAt: Date | null;
    items: { qtyKg: number }[];
  }[];
};

export type DbPORow = {
  id: string;
  poNumber: string;
  status: string;
  notes: string | null;
  receivedAt: Date | null;
  createdAt: Date;
  supplierId: string;
  supplier: { name: string };
  createdBy: { name: string } | null;
  items: {
    qtyKg: number;
    buyPricePerKg: number;
    product: { name: string };
  }[];
};

export function mapSupplier(row: DbSupplierRow): UISupplier {
  const beans: SupplierBean[] = row.supplierProducts.map((sp) => ({
    name: sp.product.name,
    price: sp.buyPricePerKg,

    type: sp.product.variety ?? "",
    active: sp.isActive,
  }));

  const totalKg = row.supplierProducts
    .filter((sp) => sp.isActive)
    .reduce((acc, sp) => acc + (sp.product.stockKg ?? 0), 0);

  // last delivery = most recent receivedAt
  const lastReceived = row.purchaseOrders
    .map((po) => po.receivedAt)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    id: row.id,
    code: row.supplierCode,
    name: row.name,
    pic: row.picName,
    region: row.region,
    phone: row.phone,
    email: row.email ?? "",
    beans,
    lastDelivery: lastReceived ? relativeID(lastReceived) : "-",
    totalKg,
    status: supplierStatusFromDb(row.isActive),
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function mapPO(row: DbPORow): UIPO {
  return {
    id: row.poNumber,
    supplierId: row.supplierId,
    supplierName: row.supplier.name,
    date: fmtTanggalID(row.createdAt),
    items: row.items.map((it) => ({
      bean: it.product.name,
      qty: it.qtyKg,
      pricePerKg: it.buyPricePerKg,
    })),
    status: poStatusFromDb(row.status),
    arrivalDate: row.receivedAt ? fmtTanggalID(row.receivedAt) : "-",
    notes: row.notes ?? undefined,
    createdBy: row.createdBy?.name ?? undefined,
  };
}