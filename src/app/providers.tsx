"use client";

// App-wide client providers. The Suppliers feature manages its own
// SupplierProvider scoped within app/(dashboard)/suppliers/layout.tsx
// (it requires server-fetched initial data as props), so there is nothing
// global to wrap here yet. Kept as a pass-through to preserve the import in
// the root layout and give us a home for future global providers.
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
