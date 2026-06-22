"use client";

import { SupplierProvider, useSupplierContext } from "./_components/supplier-context";
import { SupplierModal } from "./_components/supplier-modal";
import { DeleteModal } from "./_components/delete-modal";
import { DetailModal } from "./_components/detail-supplier-modal";
import { BuatPOModal } from "./_components/make-po-modal";
import { PODetailModal } from "./_components/detail-historypo-modal";
import { POSuccessModal } from "./_components/po-success-modal";
import type { Supplier, PO, InventoryItem } from "./lib";

function SupplierModals() {
  const {
    suppliers, pos, inventory, modal, setModal, close,
    handleSaveSupplier, handleDeleteSupplier, handleSavePO,
    handleUpdatePOStatus, handleToggleBean, handleUpdateArrival
  } = useSupplierContext();

  return (
    <>
      {modal.type === "supplier"  && <SupplierModal supplier={modal.supplier} onClose={close} onSave={handleSaveSupplier} />}
      {modal.type === "hapus"     && <DeleteModal supplier={modal.supplier} poCount={pos.filter(p => p.supplierId === modal.supplier.id).length} onClose={close} onConfirm={() => handleDeleteSupplier(modal.supplier.id)} />}
      {modal.type === "detail" && (() => {
        const freshSupplier = suppliers.find(s => s.id === modal.supplier.id) ?? modal.supplier;
        return (
          <DetailModal
            supplier={freshSupplier}
            pos={pos}
            inventory={inventory}
            onClose={close}
            onBuatPO={s => setModal({ type: "po", supplier: s })}
            onEdit={s => setModal({ type: "supplier", supplier: s })}
            onHapus={s => setModal({ type: "hapus", supplier: s })}
            onOpenPODetail={po => setModal({ type: "po-detail", po })}
            onToggleBean={handleToggleBean}
          />
        );
      })()}
      {modal.type === "po"        && <BuatPOModal suppliers={suppliers} defaultSupplier={modal.supplier} onClose={close} onSave={handleSavePO} />}
      {modal.type === "po-detail" && (() => {
        const currentPO = pos.find(p => p.id === modal.po.id) ?? modal.po;
        return <PODetailModal po={currentPO} onClose={close} onUpdateStatus={handleUpdatePOStatus}  onUpdateArrival={handleUpdateArrival}/>;
      })()}
      {modal.type === "po-success" && (
        <POSuccessModal
          po={modal.po}
          supplier={modal.supplier}
          onClose={close}
        />
      )}
    </>
  );
}

export function SuppliersShell({
  children,
  initialSuppliers,
  initialPOs,
  initialInventory,
}: {
  children: React.ReactNode;
  initialSuppliers: Supplier[];
  initialPOs: PO[];
  initialInventory: InventoryItem[];
}) {
  return (
    <SupplierProvider
      initialSuppliers={initialSuppliers}
      initialPOs={initialPOs}
      initialInventory={initialInventory}
    >
      {children}
      <SupplierModals />
    </SupplierProvider>
  );
}
