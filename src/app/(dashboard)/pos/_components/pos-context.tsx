"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Product } from "./types";

const POSDataContext = createContext<{ products: Product[] } | null>(null);

export function POSDataProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  return (
    <POSDataContext.Provider value={{ products }}>
      {children}
    </POSDataContext.Provider>
  );
}

export function usePOSProducts(): Product[] {
  const ctx = useContext(POSDataContext);
  if (!ctx) throw new Error("usePOSProducts must be used within POSDataProvider");
  return ctx.products;
}
