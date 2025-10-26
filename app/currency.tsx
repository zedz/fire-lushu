"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useI18n } from "./i18n";
type CurrencyCode = "CNY" | "USD";
type CtxType = { currency: CurrencyCode; setCurrency: (c: CurrencyCode)=>void; fmt: (n:number)=>string; };
const Ctx = createContext<CtxType | null>(null);
export function CurrencyProvider({ children }: { children: React.ReactNode }){
  const { locale } = useI18n();
  const [currency, setCurrency] = useState<CurrencyCode>("CNY");
  useEffect(()=>{
    const saved = localStorage.getItem("currency");
    if (saved==="CNY"||saved==="USD") setCurrency(saved);
    else setCurrency(locale==="en" ? "USD" : "CNY");
  }, []);
  useEffect(()=>{ localStorage.setItem("currency", currency); }, [currency]);
  const fmt = (n:number) => new Intl.NumberFormat(locale==="en"?"en-US":"zh-CN", { style:"currency", currency, maximumFractionDigits:0 }).format(n);
  const value = useMemo(()=>({ currency, setCurrency, fmt }), [currency, locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useCurrency(){ const c = useContext(Ctx); if(!c) throw new Error("useCurrency in provider"); return c; }
