"use client";

import { SupplierProvider } from "@/app/(dashboard)/suppliers/_components/supplier-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupplierProvider>
      {children}
    </SupplierProvider>
  );
}