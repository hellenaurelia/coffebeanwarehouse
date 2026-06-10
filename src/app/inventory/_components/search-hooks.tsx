import { useState, useMemo } from "react";
import { InventoryItem } from "../page";
import { FilterValues } from "./filter-modal";

export function useInventorySearch(items: InventoryItem[], filters: FilterValues) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // Search query
      if (query.trim()) {
        const q = query.toLowerCase();
        const match =
          item.sku.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.origin.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Filter: type
      if (filters.type.length > 0 && !filters.type.includes(item.type)) return false;

      // Filter: process
      if (filters.process.length > 0 && !filters.process.includes(item.process)) return false;

      // Filter: origin
      if (filters.origin.length > 0 && !filters.origin.includes(item.origin)) return false;

      // Filter: stock status
      if (filters.stockStatus.length > 0) {
        const status =
          item.stock < 25 ? "Kritis" : item.stock < 60 ? "Menipis" : "Aman";
        if (!filters.stockStatus.includes(status)) return false;
      }

      return true;
    });
  }, [items, query, filters]);

  return { query, setQuery, filtered };
}