"use client";

import { useMemo } from "react";

export default function Greeting() {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) return "Selamat pagi";
    if (hour >= 11 && hour < 15) return "Selamat siang";
    if (hour >= 15 && hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, []);

  return <h2 className="font-display text-3xl md:text-4xl font-semibold text-balance">{greeting}, Arif.</h2>;
}