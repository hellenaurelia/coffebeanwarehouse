"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Supplier, PO, InventoryItem } from "../lib";
import {
  saveSupplierAction,
  deleteSupplierAction,
  savePOAction,
  updatePOStatusAction,
  updatePOArrivalAction,
  toggleBeanAction,
} from "../_data/actions";

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

export function SupplierProvider({
  children,
  initialSuppliers,
  initialPOs,
  initialInventory,
}: {
  children: ReactNode;
  initialSuppliers: Supplier[];
  initialPOs: PO[];
  initialInventory: InventoryItem[];
}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [pos, setPOs]             = useState<PO[]>(initialPOs);
  const [inventory]               = useState<InventoryItem[]>(initialInventory);
  const [modal, setModal]         = useState<ModalState>({ type: "none" });

  const close = () => setModal({ type: "none" });

  const handleSaveSupplier = (data: Omit<Supplier, "id"> & { id?: string }) => {
    saveSupplierAction(data)
      .then((saved) => {
        setSuppliers((p) =>
          data.id
            ? p.map((s) => (s.id === saved.id ? saved : s))
            : [...p, saved]
        );
      })
      .catch((err) => console.error("Gagal menyimpan supplier:", err));
    close();
  };

  const handleDeleteSupplier = (id: string) => {
    deleteSupplierAction(id)
      .then(() => setSuppliers((p) => p.filter((s) => s.id !== id)))
      .catch((err) => console.error("Gagal menghapus supplier:", err));
    close();
  };

  const handleSavePO = (partial: Omit<PO, "id">) => {
    savePOAction(partial)
      .then((newPO) => {
        setPOs((p) => [newPO, ...p]);
        const relatedSupplier = suppliers.find((s) => s.id === partial.supplierId);
        setModal({ type: "po-success", po: newPO, supplier: relatedSupplier });
      })
      .catch((err) => console.error("Gagal membuat PO:", err));
  };

  const handleUpdatePOStatus = (poId: string, newStatus: PO["status"]) => {
    setPOs((p) => p.map((po) => (po.id === poId ? { ...po, status: newStatus } : po)));
    updatePOStatusAction(poId, newStatus).catch((err) =>
      console.error("Gagal memperbarui status PO:", err)
    );
  };

  const handleToggleBean = (supplierId: string, beanName: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id !== supplierId) return s;
        return {
          ...s,
          beans: s.beans.map((b) =>
            b.name !== beanName ? b : { ...b, active: !(b.active ?? true) }
          ),
        };
      })
    );
    toggleBeanAction(supplierId, beanName).catch((err) =>
      console.error("Gagal mengubah status bean:", err)
    );
  };

  const handleUpdateArrival = (poId: string, date: string) => {
    setPOs((p) => p.map((po) => (po.id === poId ? { ...po, arrivalDate: date } : po)));
    updatePOArrivalAction(poId, date).catch((err) =>
      console.error("Gagal memperbarui tanggal kedatangan:", err)
    );
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
