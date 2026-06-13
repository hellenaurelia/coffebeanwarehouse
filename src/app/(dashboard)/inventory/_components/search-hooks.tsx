import { useState, useMemo } from "react";
import { InventoryItem } from "../page";
import { FilterValues } from "./filter-modal";

export function useInventorySearch(items: InventoryItem[], filters: FilterValues) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const match =
          item.sku.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.type.length > 0 && !filters.type.includes(item.type)) return false;
      if (filters.stockStatus.length > 0) {
        const status = item.stock < 25 ? "Kritis" : item.stock < 60 ? "Menipis" : "Aman";
        if (!filters.stockStatus.includes(status)) return false;
      }
      return true;
    });
  }, [items, query, filters]);

  return { query, setQuery, filtered };
}