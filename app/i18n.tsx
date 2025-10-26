"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
type Locale = "zh" | "en";
type Messages = Record<string, string>;
const zh: Messages = {
  "site.title": "FIRE路书",
  "site.subtitle": "通往FIRE的路线与进度",
  "language": "语言",
  "currency": "货币",
  "theme": "主题",
  "submit": "生成报告",
  "section.time": "时间",
  "section.income": "收入",
  "section.property": "房产",
  "section.expense": "支出",
  "section.invest": "投资",
  "section.goal": "FIRE目标",
  "kpi.pv": "目标年龄资产（PV）",
  "type.lean": "Lean",
  "type.classic": "Classic",
  "type.fat": "Fat",
  "type.barista": "Barista",
  "type.flamingo": "Flamingo",
  "type.coast": "Coast",
  "chart.title": "资产轨迹",
  "defs.title": "FIRE 类型定义",
  "defs.open": "FIRE 类型定义",
  "defs.learn": "了解类型",
  "defs.lean": "是什么：用很克制的花费维持基本生活，就能不工作而覆盖日常支出。\n生活水平：基础、刚需为主（房租/餐饮/通勤等）。\n直觉：要的资产最少，因为花得少。\n在本工具中：按“FIRE后月均基础支出”换算成年支出，用提领率（SWR）折算目标资产。",
  "defs.classic": "是什么：以“正常舒适”的花费水平退休，不需要工作。\n生活水平：大众的舒适线（有休闲，但不过分奢侈）。\n直觉：目标资产 = 支出 ÷ 提领率。\n在本工具中：用“FIRE后月均舒适支出”计算。",
  "defs.fat": "是什么：花费更充裕的退休生活，不牺牲品质。\n生活水平：旅行更频繁、吃住更好、更多可选消费。\n直觉：因为花得多，所需资产最多。\n在本工具中：用“FIRE后月均富足支出”计算。",
  "defs.barista": "是什么：“半工半休”，用固定的副业/轻工作收入补一部分开销，投资组合覆盖剩余部分。\n生活水平：接近 Classic，但一部分靠轻工作来负担。\n直觉：有稳定副业，就可以少准备一些资产。\n在本工具中：Barista =（Classic 年支出 − ‘FIRE 后其他稳定收入’ − 净房租）÷ SWR（恒定，与抵扣开关无关）。",
  "defs.flamingo": "是什么：先攒到一笔“够用的一半”，然后转入更轻松的状态，让这笔钱自己增长到完全 FIRE。\n生活方式：比全职轻松，但仍保持一定收入或更简化的生活，等待资产自然长大。\n直觉：目标大约是 Classic 年支出的 12.5 倍（用 4% 提领假设，意味着到传统退休时自然长到 ~25 倍）。\n在本工具中：以 12.5 × Classic 年支出（含缓冲）。",
  "defs.coast": "是什么：现在已有的投资，只靠时间复利就能在传统退休年龄达到 Classic 的完全 FIRE；从现在起不再需要净存钱，只要工作到生活收支平衡即可。\n生活方式：当下仍工作，但“为生活而工”，不是“为攒钱而工”。\n直觉：关键是“今天已经有多少”，而不是目标年龄有多少。\n在本工具中：把 Classic 目标折现到今天，若“当前投资组合 ≥ 这个需要的现值”，就判定 Coast 达成。",
  "theme.morandi": "莫兰迪",
  "theme.dopamine": "多巴胺",
  "theme.cyberpunk": "赛博朋克",
  "theme.minimal": "极简浅色",
  "theme.ocean": "海洋",
  "theme.forest": "森林"
};
const en: Messages = {
  "site.title": "FIRE Atlas",
  "site.subtitle": "Your roadmap & progress to FIRE",
  "language": "Language",
  "currency": "Currency",
  "theme": "Theme",
  "submit": "Generate Report",
  "section.time": "Time",
  "section.income": "Income",
  "section.property": "Property",
  "section.expense": "Expenses",
  "section.invest": "Investments",
  "section.goal": "FIRE Goals",
  "kpi.pv": "Portfolio at Target Age (PV)",
  "type.lean": "Lean",
  "type.classic": "Classic",
  "type.fat": "Fat",
  "type.barista": "Barista",
  "type.flamingo": "Flamingo",
  "type.coast": "Coast",
  "chart.title": "Portfolio Trajectory",
  "defs.title": "FIRE Types",
  "defs.open": "FIRE Types",
  "defs.learn": "Learn the types",
  "defs.lean": "Live on a lean budget covering essentials only. Target ≈ (Lean annual spend ÷ SWR) × buffer. ",
  "defs.classic": "Retire at a normal, comfortable spending level. Target ≈ (Classic annual spend ÷ SWR) × buffer.",
  "defs.fat": "A more affluent retirement. Target ≈ (Fat annual spend ÷ SWR) × buffer.",
  "defs.barista": "Semi-retire and cover part of spending with steady side income. Formula (always applies): (Classic spend − other stable income − net rent) ÷ SWR × buffer.",
  "defs.flamingo": "Save roughly half and let time do the rest. Target ≈ 12.5 × Classic annual spend × buffer.",
  "defs.coast": "Your existing portfolio can coast to Classic by traditional retirement age. Discount the Classic target back to today; if current portfolio ≥ that present value, Coast is achieved.",
  "theme.morandi": "Morandi",
  "theme.dopamine": "Dopamine",
  "theme.cyberpunk": "Cyberpunk",
  "theme.minimal": "Minimal Light",
  "theme.ocean": "Ocean",
  "theme.forest": "Forest"
};
const dict: Record<Locale, Messages> = { zh, en };
type I18nCtx = { locale: Locale; t: (k: string) => string; setLocale: (l: Locale) => void; };
const Ctx = createContext<I18nCtx | null>(null);
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");
  useEffect(() => { const s = localStorage.getItem("locale"); if (s==="zh"||s==="en") setLocale(s); }, []);
  useEffect(() => { localStorage.setItem("locale", locale); }, [locale]);
  const t = (k: string) => dict[locale][k] ?? k;
  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useI18n(){ const c = useContext(Ctx); if(!c) throw new Error("useI18n in provider"); return c; }
