"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Calendar, Shield } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    name: string;
    role: string;
    outlet: string;
    email: string;
    joinDate: string;
    avatar: string;
    status: "aktif" | "nonaktif";
  };
}

const roleBadge: Record<string, string> = {
  owner: "bg-primary/10 text-primary border-primary/20",
  manajer: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  kasir: "bg-crema/30 text-roast border-crema/40",
  gudang: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
};

const roleLabel: Record<string, string> = {
  owner: "Owner",
  manajer: "Manager",
  kasir: "Kasir",
  gudang: "Staf Gudang",
};

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border-0 shadow-warm">
      {/* Banner */}
      <div className="h-36 gradient-bean relative">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-crema/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/4 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
      </div>

      {/* Avatar + info */}
      <div className="bg-card px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
          {/* Avatar */}
          <div
            className="relative w-fit cursor-pointer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="h-24 w-24 rounded-2xl gradient-bean flex items-center justify-center text-primary-foreground text-2xl font-display font-semibold border-4 border-card shadow-warm">
              {user.avatar}
            </div>
            {hovered && (
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card" />
          </div>

          {/* CTA */}
          <div className="flex gap-2 pb-1">
            <Badge variant="outline" className={roleBadge[user.role]}>
              <Shield className="h-3 w-3 mr-1" />
              {roleLabel[user.role]}
            </Badge>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="font-display text-2xl font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {user.outlet}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Bergabung {user.joinDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}