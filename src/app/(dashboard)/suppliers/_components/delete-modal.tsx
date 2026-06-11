"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Supplier } from "../page";
import { Modal, ModalHeader, BTN_OUTLINE, BTN_PRIMARY } from "./shared-components";

export function DeleteModal({ supplier, poCount, onClose, onConfirm }: {
  supplier: Supplier; poCount: number; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Hapus Supplier" subtitle="Tindakan ini tidak bisa dibatalkan" onClose={onClose} />
      <div className="p-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          Supplier <span className="font-medium text-foreground">{supplier.name}</span> akan dihapus permanen dari sistem.
        </p>
        {poCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Supplier ini memiliki <span className="font-medium text-foreground">{poCount} riwayat PO</span> — data PO tetap tersimpan.
          </p>
        )}
      </div>
      <div className="border-t border-border/60 px-6 py-4 flex gap-2 justify-end">
        <Button variant="outline" className={BTN_OUTLINE} onClick={onClose}>Batal</Button>
        <Button className={BTN_PRIMARY} onClick={onConfirm}>
          <Trash2 className="h-4 w-4 mr-2" />Hapus
        </Button>
      </div>
    </Modal>
  );
}