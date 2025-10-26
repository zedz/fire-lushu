"use client";
import { useI18n } from "../i18n";
import { useCurrency } from "../currency";
import { useEffect, useState } from "react";
import FireDefinitions from "./FireDefinitions";

const THEMES = ["morandi","dopamine","cyberpunk","minimal","ocean","forest"] as const;
type Theme = typeof THEMES[number];

export default function TopBar() {
  const { locale, setLocale, t } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const [showDefs, setShowDefs] = useState(false);
  const [theme, setTheme] = useState<Theme>("minimal");

  useEffect(()=>{
    const saved = localStorage.getItem("theme"); if (saved && THEMES.includes(saved as Theme)) setTheme(saved as Theme);
  },[]);
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("site.title")}</h1>
          <p className="opacity-70">{t("site.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-3 py-2 rounded-xl border border-black/10" style={{ background: "var(--card)" }} onClick={()=>setShowDefs(true)}>
            {t("defs.open")}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">{t("language")}</span>
            <select className="select" value={locale} onChange={(e)=>setLocale(e.target.value as any)}>
              <option value="zh">中文</option>
              <option value="en">EN</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">{t("currency")}</span>
            <select className="select" value={currency} onChange={(e)=>setCurrency(e.target.value as any)}>
              <option value="CNY">CNY (¥)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">{t("theme")}</span>
            <select className="select" value={theme} onChange={(e)=>setTheme(e.target.value as Theme)}>
              <option value="morandi">{t("theme.morandi")}</option>
              <option value="dopamine">{t("theme.dopamine")}</option>
              <option value="cyberpunk">{t("theme.cyberpunk")}</option>
              <option value="minimal">{t("theme.minimal")}</option>
              <option value="ocean">{t("theme.ocean")}</option>
              <option value="forest">{t("theme.forest")}</option>
            </select>
          </div>
        </div>
      </div>
      <FireDefinitions open={showDefs} onClose={()=>setShowDefs(false)} />
    </>
  );
}
