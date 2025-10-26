"use client";
import React from "react";
export default function PercentInput({
  value, onChange, minPct=0, maxPct=100, stepPct=0.1, className="input-underline", suffix="%"
}:{ value:number; onChange:(v:number)=>void; minPct?:number; maxPct?:number; stepPct?:number; className?:string; suffix?:string; }){
  const pct = Number.isFinite(value) ? Math.round(value*10000)/100 : 0;
  return (
    <div className="flex items-center gap-2">
      <input type="number" inputMode="decimal" min={minPct} max={maxPct} step={stepPct}
        className={`${className} w-28`} value={Number.isNaN(pct) ? "" : pct}
        onChange={(e)=>{ const v=parseFloat(e.target.value); onChange(Number.isFinite(v)? Math.round(v)/100 : 0); }}
      />
      <span className="text-sm opacity-70">{suffix}</span>
    </div>
  );
}
