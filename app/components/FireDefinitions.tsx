"use client";
import { useEffect } from "react";
import { useI18n } from "../i18n";

export default function FireDefinitions({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = useI18n();

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;

  const titles = locale === "zh"
    ? {
        lean:     "Lean 瘦FIRE（极简版）",
        classic:  "Classic 经典FIRE（标准版）",
        fat:      "Fat 胖FIRE（富足版）",
        barista:  "Barista 咖啡师FIRE（半退休 + 轻工作）",
        flamingo: "Flamingo 弗朗明哥FIRE（半程冲刺）",
        coast:    "Coast 海岸FIRE（顺流不再攒）",
      }
    : {
        lean:     "Lean FIRE",
        classic:  "Classic FIRE",
        fat:      "Fat FIRE",
        barista:  "Barista FIRE",
        flamingo: "Flamingo FIRE",
        coast:    "Coast FIRE",
      };

  const Item = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <details className="rounded-xl border border-black/10 p-3" style={{ background: "var(--card)" }}>
      <summary className="cursor-pointer font-medium list-none flex items-center justify-between">
        <span>{title}</span>
        <span className="opacity-60">＋</span>
      </summary>
      <div className="mt-2 text-sm leading-relaxed whitespace-pre-line">{children}</div>
    </details>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[520px] z-50 shadow-2xl rounded-l-2xl flex flex-col"
        style={{ background: "var(--card)" }}
      >
        <div className="p-4 border-b border-black/10 flex items-center justify-between">
          <div className="text-lg font-semibold">{t("defs.title")}</div>
          <button className="opacity-70 hover:opacity-100" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 space-y-3 overflow-auto">
          <Item title={titles.lean}>{t("defs.lean")}</Item>
          <Item title={titles.classic}>{t("defs.classic")}</Item>
          <Item title={titles.fat}>{t("defs.fat")}</Item>
          <Item title={titles.barista}>{t("defs.barista")}</Item>
          <Item title={titles.flamingo}>{t("defs.flamingo")}</Item>
          <Item title={titles.coast}>{t("defs.coast")}</Item>
        </div>
      </div>
    </>
  );
}
