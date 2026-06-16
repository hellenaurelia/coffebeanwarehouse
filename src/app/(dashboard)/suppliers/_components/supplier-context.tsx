"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Supplier, PO, InventoryItem, initSuppliers, initPOs, initialItems, nextId } from "../lib";

export type ModalState =
  | { type: "none" }
  | { type: "supplier"; supplier?: Supplier }
  | { type: "detail";   supplier: Supplier }
  | { type: "hapus";    supplier: Supplier }
  | { type: "po";       supplier?: Supplier }
  | { type: "po-detail"; po: PO }
  | { type: "po-success"; po: PO; supplier?: Supplier };

type SupplierContextValue = {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  pos: PO[];
  setPOs: React.Dispatch<React.SetStateAction<PO[]>>;
  inventory: InventoryItem[];
  modal: ModalState;
  setModal: React.Dispatch<React.SetStateAction<ModalState>>;
  close: () => void;
  handleSaveSupplier: (data: Omit<Supplier, "id"> & { id?: string }) => void;
  handleDeleteSupplier: (id: string) => void;
  handleSavePO: (partial: Omit<PO, "id">) => void;
  handleUpdatePOStatus: (poId: string, newStatus: PO["status"]) => void;
  handleToggleBean: (supplierId: string, beanName: string) => void;
  handleUpdateArrival: (poId: string, date: string) => void;
};

const SupplierContext = createContext<SupplierContextValue | null>(null);

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initSuppliers);
  const [pos, setPOs]             = useState<PO[]>(initPOs);
  const [inventory]               = useState<InventoryItem[]>(initialItems);
  const [modal, setModal]         = useState<ModalState>({ type: "none" });

  const close = () => setModal({ type: "none" });

  const handleSaveSupplier = (data: Omit<Supplier, "id"> & { id?: string }) => {
    setSuppliers(p =>
      data.id
        ? p.map(s => s.id === data.id ? data as Supplier : s)
        : [...p, { ...data, id: nextId(suppliers, "S-", 3) } as Supplier]
    );
    close();
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(p => p.filter(s => s.id !== id));
    close();
  };

  const handleSavePO = (partial: Omit<PO, "id">) => {
    const newPO = { ...partial, id: nextId(pos, "PO-", 4) };
    setPOs(p => [newPO, ...p]);
    const relatedSupplier = suppliers.find(s => s.id === partial.supplierId);
    setModal({ type: "po-success", po: newPO, supplier: relatedSupplier });
  };

  const handleUpdatePOStatus = (poId: string, newStatus: PO["status"]) => {
    setPOs(p => p.map(po => po.id === poId ? { ...po, status: newStatus } : po));
  };

  // Toggle active state sebuah bean — guard dilakukan di UI (beanHasStock),
  // context hanya bertanggung jawab untuk membalik flag active.
  const handleToggleBean = (supplierId: string, beanName: string) => {
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id !== supplierId) return s;
        return {
          ...s,
          beans: s.beans.map(b =>
            b.name !== beanName ? b : { ...b, active: !(b.active ?? true) }
          ),
        };
      })
    );
  };

  const handleUpdateArrival = (poId: string, date: string) => {
  setPOs(p => p.map(po => po.id === poId ? { ...po, arrivalDate: date } : po));
};

  return (
    <SupplierContext.Provider value={{
      suppliers, setSuppliers,
      pos, setPOs,
      inventory,
      modal, setModal, close,
      handleSaveSupplier,
      handleDeleteSupplier,
      handleSavePO,
      handleUpdatePOStatus,
      handleToggleBean,
      handleUpdateArrival,
    }}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplierContext() {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error("useSupplierContext must be used within SupplierProvider");
  return ctx;
}
