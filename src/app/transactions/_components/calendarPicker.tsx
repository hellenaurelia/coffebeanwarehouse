"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES, DAY_NAMES, sod, sameDay } from "../lib";
import type { DateRange } from "../types";

interface CalendarPickerProps {
  range: DateRange;
  onChange: (r: DateRange) => void;
  onClose: () => void;
}

export function CalendarPicker({ range, onChange, onClose }: CalendarPickerProps) {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [hov, setHov] = useState<Date | null>(null);

  const prevMo = () =>
    mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1);
  const nextMo = () =>
    mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1);

  const firstDow = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMo }, (_, i) => new Date(yr, mo, i + 1)),
  ];

  function pick(d: Date) {
    const day = sod(d);
    if (!range.from || (range.from && range.to)) {
      onChange({ from: day, to: null });
      return;
    }
    if (day < range.from) onChange({ from: day, to: range.from });
    else onChange({ from: range.from, to: day });
  }

  function inRange(d: Date) {
    const f = range.from;
    const t = range.to ?? hov;
    if (!f || !t) return false;
    const lo = f < t ? f : t;
    const hi = f < t ? t : f;
    return d > lo && d < hi;
  }

  return (
    <div className="p-1 w-72 select-none">
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={prevMo}
          className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">
          {MONTH_NAMES[mo]} {yr}
        </span>
        <button
          onClick={nextMo}
          className="h-7 w-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isStart = !!(range.from && sameDay(d, range.from));
          const isEnd = !!(range.to && sameDay(d, range.to));
          const isMid = inRange(d);
          const active = isStart || isEnd;
          return (
            <button
              key={i}
              onClick={() => pick(d)}
              onMouseEnter={() =>
                setHov(range.from && !range.to ? sod(d) : null)
              }
              onMouseLeave={() => setHov(null)}
              className={[
                "h-8 text-xs flex items-center justify-center relative transition-colors",
                isMid ? "bg-primary/10" : "",
                isStart && !isEnd ? "rounded-l-full" : "",
                isEnd && !isStart ? "rounded-r-full" : "",
                isStart && isEnd ? "rounded-full" : "",
                active ? "" : "hover:bg-secondary rounded-full",
              ].join(" ")}
            >
              <span
                className={[
                  "h-7 w-7 flex items-center justify-center rounded-full z-10 relative",
                  active ? "bg-primary text-primary-foreground font-semibold" : "",
                ].join(" ")}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => onChange({ from: null, to: null })}
        >
          Reset
        </button>
        <button
          className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg"
          onClick={onClose}
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}