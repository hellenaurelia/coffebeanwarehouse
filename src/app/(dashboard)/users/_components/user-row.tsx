import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ROLE_META, STATUS_META } from "../_lib/constants";
import type { User } from "../_lib/types";

interface UserRowProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}

export function UserRow({ user, onEdit, onDelete }: UserRowProps) {
  const role = ROLE_META[user.role];
  const status = STATUS_META[user.status];

  return (
    <tr className="hover:bg-secondary/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full gradient-bean flex items-center justify-center shrink-0 text-xs font-semibold text-primary-foreground">
            {user.avatar}
          </div>
          <div>
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-muted-foreground text-xs text-center">{user.email}</td>
      <td className="px-4 py-4 text-center">
        <Badge variant="outline" className={`text-xs ${role.color}`}>{role.label}</Badge>
      </td>
      <td className="px-4 py-4 text-center">
        <Badge variant="outline" className={`text-xs ${status.color}`}>{status.label}</Badge>
      </td>
      <td className="px-4 py-4 text-muted-foreground text-xs text-center">{user.lastLogin}</td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary-foreground"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary-foreground"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}