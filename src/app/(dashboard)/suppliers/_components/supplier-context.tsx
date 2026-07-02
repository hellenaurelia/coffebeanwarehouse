"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
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
  handleSaveSupplier: (data: Omit<Supplier, "id" | "code"> & { id?: string; code?: string }) => void;
  handleDeleteSupplier: (id: string) => void;
  handleSavePO: (partial: Omit<PO, "id">) => void;
  handleUpdatePOStatus: (poId: string, newStatus: PO["status"]) => void;
  handleToggleBean: (supplierId: string, beanName: string) => void;
  handleUpdateArrival: (poId: string, date: string) => void;
};

const SupplierContext = createContext<SupplierContextValue | null>(null);

// Ambil pesan error yang ramah dari server action.
function errMsg(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

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

  const handleSaveSupplier = (data: Omit<Supplier, "id" | "code"> & { id?: string; code?: string }) => {
    saveSupplierAction(data)
      .then((saved) => {
        setSuppliers((p) =>
          data.id
            ? p.map((s) => (s.id === saved.id ? saved : s))
            : [...p, saved]
        );
        toast.success(data.id ? "Supplier diperbarui." : "Supplier ditambahkan.");
        close();
      })
      .catch((err) => {
        // Bisa berupa penolakan aturan (mis. bean masih ada stok).
        toast.error("Gagal menyimpan supplier", { description: errMsg(err, "Terjadi kesalahan.") });
      });
  };

  const handleDeleteSupplier = (id: string) => {
    deleteSupplierAction(id)
      .then(() => {
        setSuppliers((p) => p.filter((s) => s.id !== id));
        toast.success("Supplier dihapus.");
        close();
      })
      .catch((err) => {
        // Penolakan poin 2: supplier masih punya biji kopi.
        toast.error("Supplier tidak bisa dihapus", { description: errMsg(err, "Terjadi kesalahan.") });
        close();
      });
  };

  const handleSavePO = (partial: Omit<PO, "id">) => {
    savePOAction(partial)
      .then((newPO) => {
        setPOs((p) => [newPO, ...p]);
        const relatedSupplier = suppliers.find((s) => s.id === partial.supplierId);
        setModal({ type: "po-success", po: newPO, supplier: relatedSupplier });
      })
      .catch((err) => {
        toast.error("Gagal membuat PO", { description: errMsg(err, "Terjadi kesalahan.") });
      });
  };

  const handleUpdatePOStatus = (poId: string, newStatus: PO["status"]) => {
    const prev = pos;
    setPOs((p) => p.map((po) => (po.id === poId ? { ...po, status: newStatus } : po)));
    updatePOStatusAction(poId, newStatus).catch((err) => {
      setPOs(prev); // rollback
      toast.error("Gagal memperbarui status PO", { description: errMsg(err, "Terjadi kesalahan.") });
    });
  };

  const handleToggleBean = (supplierId: string, beanName: string) => {
    const prev = suppliers;
    // Optimistik
    setSuppliers((cur) =>
      cur.map((s) => {
        if (s.id !== supplierId) return s;
        return {
          ...s,
          beans: s.beans.map((b) =>
            b.name !== beanName ? b : { ...b, active: !(b.active ?? true) }
          ),
        };
      })
    );
    toggleBeanAction(supplierId, beanName).catch((err) => {
      setSuppliers(prev); // rollback kalau ditolak (poin 1: stok masih ada)
      toast.error("Gagal mengubah status biji kopi", { description: errMsg(err, "Terjadi kesalahan.") });
    });
  };

  const handleUpdateArrival = (poId: string, date: string) => {
    const prev = pos;
    setPOs((p) => p.map((po) => (po.id === poId ? { ...po, arrivalDate: date } : po)));
    updatePOArrivalAction(poId, date).catch((err) => {
      setPOs(prev);
      toast.error("Gagal memperbarui tanggal kedatangan", { description: errMsg(err, "Terjadi kesalahan.") });
    });
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