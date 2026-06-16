import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "../_lib/types";

interface DeleteDialogProps {
  target: User | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({ target, onConfirm, onCancel }: DeleteDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirm();
    }
  };

  return (
    <AlertDialog open={!!target} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent
        onKeyDown={handleKeyDown}
        className="data-[state=open]:animate-none data-[state=closed]:animate-none"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Hapus Pengguna?</AlertDialogTitle>
          <AlertDialogDescription>
            Kamu akan menghapus akun <strong>{target?.name}</strong> ({target?.username}). Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}