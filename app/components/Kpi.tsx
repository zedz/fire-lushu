"use client";
import { useI18n } from "../i18n";
import { useCurrency } from "../currency";

export function KpiCards({ attainedType, pv, achieved100 }:{ attainedType:"Fat"|"Classic"|"Lean"|"None"; pv:number; achieved100:{type:string, progress:number}[]; }){
  const { t } = useI18n();
  const { fmt } = useCurrency();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-4">
        <div className="text-sm opacity-70">传统FIRE是否达成（截至目标年龄）</div>
        <div className="mt-2 text-xl font-semibold">{attainedType==="None" ? "否" : `是 · ${attainedType}`}</div>
      </div>
      <div className="card p-4">
        <div className="text-sm opacity-70">达成类型（截至目标年龄）</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {achieved100.length===0 ? <span className="badge">—</span>
            : achieved100.map((c,i)=><span key={i} className="badge" style={{ background:"#dcfce7", color:"#166534" }}>{c.type} {(c.progress*100).toFixed(0)}%</span>)}
        </div>
      </div>
      <div className="card p-4">
        <div className="text-sm opacity-70">{t("kpi.pv")}</div>
        <div className="mt-2 text-xl font-semibold">{fmt(pv)}</div>
      </div>
    </div>
  );
}

export function TypeList({ progress, attainment, targets, requiredNowForTR, coast, coastProgress, note }: any){
  const { t } = useI18n();
  const { fmt } = useCurrency();
  const Row = ({ label, prog, attained, target }:{label:string, prog:number, attained:boolean, target:number}) => (
    <div className="space-y-1 py-2 border-b border-black/5 last:border-0">
      <div className="flex items-center justify-between">
        <div className="font-semibold" style={{color:'var(--primary)'}}>{label}</div>
        <div className="badge" style={{ background: attained? "#dcfce7":"#f3f4f6", color: attained?"#166534":"#374151" }}>{attained ? "✔" : "—"}</div>
      </div>
      {target>0 ? (<>
        <div className="progress"><span style={{ width: `${Math.min(prog,1)*100}%` }} /></div>
        <div className="text-xs opacity-70 flex items-center justify-between">
          <span>{(prog*100).toFixed(0)}%</span>
          <span>目标资产（含缓冲）: {fmt(target)}</span>
        </div>
      </>) : (
        <div className="text-xs opacity-70">目标=0（已被稳定收入完全覆盖）</div>
      )}
    </div>
  );
  return (
    <div className="card p-4">
      <div className="text-sm opacity-70 mb-2">
        各类型完成度
        <span className="ml-2 underline underline-offset-2 cursor-pointer" style={{ color: "var(--primary)" }} onClick={()=>{
          const btn = Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('FIRE 类型定义') || b.textContent?.includes('FIRE Types'));
          (btn as HTMLButtonElement | undefined)?.click();
        }}>{t("defs.learn")}</span>
      </div>
      <Row label={t("type.lean")}     prog={progress.lean}            attained={attainment.lean}     target={targets.lean} />
      <Row label={t("type.classic")}  prog={progress.classic}         attained={attainment.classic}  target={targets.classic} />
      <Row label={t("type.fat")}      prog={progress.fat}             attained={attainment.fat}      target={targets.fat} />
      <Row label={t("type.barista")}  prog={progress.barista_classic} attained={attainment.barista}  target={targets.barista_classic} />
      <Row label={t("type.flamingo")} prog={progress.flamingo}        attained={attainment.flamingo} target={targets.flamingo} />
      <div className="space-y-1 py-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold" style={{color:'var(--primary)'}}>{t("type.coast")}</div>
          <div className="badge" style={{ background: coast? "#dcfce7":"#f3f4f6", color: coast?"#166534":"#374151" }}>{coast ? "✔" : "—"}</div>
        </div>
        <div className="progress"><span style={{ width: `${Math.min(coastProgress,1)*100}%` }} /></div>
        <div className="text-xs opacity-70 flex items-center justify-between">
          <span>{(Math.min(coastProgress,1)*100).toFixed(0)}%</span>
          <span>Required Now: {fmt(requiredNowForTR)}</span>
        </div>
      </div>
      {note ? <div className="text-xs opacity-70 mt-2">{note}</div> : null}
    </div>
  );
}
