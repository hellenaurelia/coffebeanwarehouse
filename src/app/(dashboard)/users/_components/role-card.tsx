import { Card, CardContent } from "@/components/ui/card";
import { ROLE_META } from "../_lib/constants";
import type { Role } from "../_lib/types";

interface RoleCardProps {
  role: Role;
}

export function RoleCard({ role }: RoleCardProps) {
  const meta = ROLE_META[role];
  return (
    <Card className="shadow-soft border-border/60">
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${meta.color}`}>
          <meta.icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{meta.desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}