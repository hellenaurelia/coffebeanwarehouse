"use client";

import { SupplierProvider, useSupplierContext } from "./_components/supplier-context";
import { SupplierModal } from "./_components/supplier-modal";
import { DeleteModal } from "./_components/delete-modal";
import { DetailModal } from "./_components/detail-supplier-modal";
import { BuatPOModal } from "./_components/make-po-modal";
import { PODetailModal } from "./_components/detail-historypo-modal";

function SupplierModals() {
  const { suppliers, pos, modal, setModal, close, handleSaveSupplier, handleDeleteSupplier, handleSavePO } = useSupplierContext();

  return (
    <>
      {modal.type === "supplier"  && <SupplierModal supplier={modal.supplier} onClose={close} onSave={handleSaveSupplier} />}
      {modal.type === "hapus"     && <DeleteModal supplier={modal.supplier} poCount={pos.filter(p=>p.supplierId===modal.supplier.id).length} onClose={close} onConfirm={() => handleDeleteSupplier(modal.supplier.id)} />}
      {modal.type === "detail"    && <DetailModal supplier={modal.supplier} pos={pos} onClose={close} onBuatPO={s=>setModal({type:"po",supplier:s})} onEdit={s=>setModal({type:"supplier",supplier:s})} onHapus={s=>setModal({type:"hapus",supplier:s})} onOpenPODetail={po => setModal({ type: "po-detail", po })} />}
      {modal.type === "po"        && <BuatPOModal suppliers={suppliers} defaultSupplier={modal.supplier} onClose={close} onSave={handleSavePO} />}
      {modal.type === "po-detail" && <PODetailModal po={modal.po} onClose={close} />}
    </>
  );
}

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupplierProvider>
      {children}
      <SupplierModals />
    </SupplierProvider>
  );
}
