import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="shadow-soft border-border/60">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl gradient-bean flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-2xl font-display font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}