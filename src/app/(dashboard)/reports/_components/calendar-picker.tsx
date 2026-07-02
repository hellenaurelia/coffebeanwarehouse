"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "./types";
import { MONTHS_ID, DAYS_ID } from "./data";
import {
  isDateInRange,
  getFirstDayOfMonth,
  getDaysInMonth,
  isSameDate,
  formatDateID,
} from "./utils";

interface CalendarPickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

export function CalendarPicker({ value, onChange, onClose }: CalendarPickerProps) {
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [viewMonth, setViewMonth] = useState(new Date());

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);

    if (!tempRange.from) {
      setTempRange({ from: selectedDate, to: null });
    } else if (!tempRange.to) {
      if (selectedDate < tempRange.from) {
        setTempRange({ from: selectedDate, to: tempRange.from });
      } else if (isSameDate(selectedDate, tempRange.from)) {
        setTempRange({ from: null, to: null });
      } else {
        setTempRange({ from: tempRange.from, to: selectedDate });
      }
    } else {
      setTempRange({ from: selectedDate, to: null });
    }
  };

  const handleApply = () => {
    onChange(tempRange);
    onClose();
  };

  const firstDay = getFirstDayOfMonth(viewMonth);
  const daysInMonth = getDaysInMonth(viewMonth);
  const calendarDays: (number | null)[] = Array.from(
    { length: firstDay },
    () => null as number | null
  ).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <Card className="w-72 border-border/60 bg-card shadow-lg">
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Pilih Rentang Tanggal</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() =>
              setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))
            }
            className="p-1 hover:bg-secondary/40 rounded transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium text-foreground">
            {MONTHS_ID[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </div>
          <button
            onClick={() =>
              setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))
            }
            className="p-1 hover:bg-secondary/40 rounded transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_ID.map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 mb-3">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
            const isFrom = !!(tempRange.from && isSameDate(date, tempRange.from));
            const isTo = !!(tempRange.to && isSameDate(date, tempRange.to));
            const inRange =
              !!(tempRange.from && tempRange.to) &&
              isDateInRange(date, tempRange.from, tempRange.to) &&
              !isFrom &&
              !isTo;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`w-full aspect-square text-[11px] rounded transition-colors flex items-center justify-center font-medium ${
                  isFrom || isTo
                    ? "bg-bean text-white font-semibold"
                    : inRange
                      ? "bg-bean/20 text-bean"
                      : "text-foreground hover:bg-secondary/60"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Selected Range Display */}
        {(tempRange.from || tempRange.to) && (
          <div className="mb-3 p-2 bg-secondary/40 rounded-lg">
            <p className="text-[10px] text-muted-foreground mb-0.5">Dipilih:</p>
            <p className="text-xs font-medium text-foreground">
              {tempRange.from ? formatDateID(tempRange.from) : "—"} hingga{" "}
              {tempRange.to ? formatDateID(tempRange.to) : "—"}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTempRange({ from: null, to: null })}
            className="flex-1 h-7 text-xs"
          >
            Reset
          </Button>
          <Button size="sm" onClick={handleApply} className="flex-1 h-7 text-xs bg-bean hover:bg-bean/90">
            Terapkan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}