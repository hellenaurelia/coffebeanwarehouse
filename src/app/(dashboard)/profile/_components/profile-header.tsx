"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Calendar, Shield, X } from "lucide-react";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

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
          <div className="relative w-fit">
            <div
              className="relative h-24 w-24 rounded-2xl border-4 border-card shadow-warm cursor-pointer"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={() => inputRef.current?.click()}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-xl gradient-bean flex items-center justify-center text-primary-foreground text-2xl font-display font-semibold">
                  {user.avatar}
                </div>
              )}

              {/* Hover overlay */}
              {(hovered || uploading) && (
                <div className="absolute inset-0 rounded-xl bg-black/40 flex flex-col items-center justify-center gap-1">
                  {uploading ? (
                    <span className="text-white text-[10px]">Mengunggah…</span>
                  ) : (
                    <>
                      <Camera className="h-5 w-5 text-white" />
                      <span className="text-white text-[10px]">Ubah foto</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Remove button — only shown when custom avatar is set */}
            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-muted border-2 border-card flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                title="Hapus foto"
              >
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
            )}

            {/* Online dot */}
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card" />
          </div>

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

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