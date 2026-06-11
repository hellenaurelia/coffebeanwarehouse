"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarPicker } from "./calendarPicker";
import type { DateRange } from "../types";

interface DateFilterProps {
  range: DateRange;
  onChange: (r: DateRange) => void;
}

export function DateFilter({ range, onChange }: DateFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fmt2 = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const label = range.from
    ? range.to
      ? `${fmt2(range.from)} – ${fmt2(range.to)}`
      : fmt2(range.from)
    : "Tanggal";

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        className={`rounded-xl gap-2 ${range.from ? "border-primary text-primary" : ""}`}
        onClick={() => setOpen(p => !p)}
      >
        <Calendar className="h-4 w-4" />
        <span className="text-sm truncate">{label}</span>
        {range.from && (
          <span
            role="button"
            onClick={e => {
              e.stopPropagation();
              onChange({ from: null, to: null });
              setOpen(false);
            }}
            className="ml-1 flex items-center"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 z-30 bg-card border border-border/60 rounded-2xl shadow-xl p-3">
          <CalendarPicker
            range={range}
            onChange={onChange}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}