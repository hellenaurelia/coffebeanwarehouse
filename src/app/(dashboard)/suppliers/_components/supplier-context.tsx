"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Supplier, PO, initSuppliers, initPOs, nextId } from "../lib";

export type ModalState =
  | { type: "none" }
  | { type: "supplier"; supplier?: Supplier }
  | { type: "detail";   supplier: Supplier }
  | { type: "hapus";    supplier: Supplier }
  | { type: "po";       supplier?: Supplier }
  | { type: "po-detail"; po: PO };

type SupplierContextValue = {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  pos: PO[];
  setPOs: React.Dispatch<React.SetStateAction<PO[]>>;
  modal: ModalState;
  setModal: React.Dispatch<React.SetStateAction<ModalState>>;
  close: () => void;
  handleSaveSupplier: (data: Omit<Supplier, "id"> & { id?: string }) => void;
  handleDeleteSupplier: (id: string) => void;
  handleSavePO: (partial: Omit<PO, "id">) => void;
};

const SupplierContext = createContext<SupplierContextValue | null>(null);

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initSuppliers);
  const [pos, setPOs]             = useState<PO[]>(initPOs);
  const [modal, setModal]         = useState<ModalState>({ type: "none" });

  const close = () => setModal({ type: "none" });

  const handleSaveSupplier = (data: Omit<Supplier, "id"> & { id?: string }) => {
    setSuppliers(p => data.id ? p.map(s => s.id === data.id ? data as Supplier : s) : [...p, { ...data, id: nextId(suppliers, "S-", 3) } as Supplier]);
    close();
  };
  const handleDeleteSupplier = (id: string) => { setSuppliers(p => p.filter(s => s.id !== id)); close(); };
  const handleSavePO = (partial: Omit<PO, "id">) => { setPOs(p => [{ ...partial, id: nextId(pos, "PO-", 4) }, ...p]); close(); };

  return (
    <SupplierContext.Provider value={{ suppliers, setSuppliers, pos, setPOs, modal, setModal, close, handleSaveSupplier, handleDeleteSupplier, handleSavePO }}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplierContext() {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error("useSupplierContext must be used within SupplierProvider");
  return ctx;
}
