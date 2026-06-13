import { InventoryItem } from "../page";

export function exportToCSV(items: InventoryItem[]) {
  const headers = ["SKU", "Nama", "Supplier", "Tipe", "Exp.", "Stok (kg)", "HPP (Rp)", "Harga Jual (Rp)", "Status"];
  const stockLabel = (s: number) => (s < 25 ? "Kritis" : s < 60 ? "Menipis" : "Aman");

  const rows = items.map((it) => [
    it.sku, it.name, it.supplier, it.type, it.exp,
    it.stock, it.cost, it.price, stockLabel(it.stock),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => {
      const str = String(cell);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
  link.download = `inventory-biji-kopi-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}