"use client";

import TopBar from "./components/TopBar";
import { useI18n } from "./i18n";
import { useCurrency } from "./currency";
import { useState } from "react";
import { schema } from "./lib";
import { compute } from "./lib";
import { KpiCards, TypeList } from "./components/Kpi";
import TrajectoryChart from "./components/TrajectoryChart";
import InfoTip from "./components/InfoTip";
import PercentInput from "./components/PercentInput";
import Switch from "./components/Switch";

export default function Page() {
  const { t, locale } = useI18n();
  const { currency } = useCurrency();

  const [values, setValues] = useState<any>({
    current_age: 30, target_fire_age: 45, traditional_retirement_age: 65,
    monthly_total_income: 12000,
    has_property: false, owner_occ_has_mortgage: false, owner_occ_mortgage_monthly: 0, owner_occ_mortgage_payoff_ym: "",
    has_investment_property: false, invprop_has_mortgage: false, invprop_prepayoff_net_rent_monthly: 0, invprop_postpayoff_net_rent_monthly: 0, invprop_payoff_ym: "", invprop_net_rent_monthly: 0,
    monthly_total_expenses: 8000,
    current_portfolio_value: 100000, contribution_rate_of_net_income: 0.8,
    pre_fire_real_return_rate: 0.04, post_fire_real_return_rate: 0.035,
    fire_monthly_basic: 5000, fire_monthly_comfort: 8000, fire_monthly_luxury: 15000,
    withdrawal_rate: 0.04, post_fire_part_time_income_monthly: 0,
    safety_buffer_multiplier: 1.1,
    include_stable_income_offset: true
  });

  const [errors, setErrors] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const onSubmit = () => {
    setErrors(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(parsed.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("\n"));
      return;
    }
    const r = compute(values);
    setResult(r);
  };

  const num = (k: string) => (e: any) => setValues((v: any) => ({ ...v, [k]: e.target.value === "" ? "" : Number(e.target.value) }));
  const txt = (k: string) => (e: any) => setValues((v: any) => ({ ...v, [k]: e.target.value }));
  const bool = (k: string) => (e: any) => setValues((v: any) => ({ ...v, [k]: e.target.checked }));

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <TopBar />

      {/* 3×2 主输入区：第一排（时间/收入/支出），第二排（房产/投资/FIRE目标） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 时间 */}
        <section className="section bg-var-time">
          <h2 className="text-lg font-semibold mb-3">{t("section.time")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="label">当前年龄 <InfoTip text="你现在的年龄（岁）。" /></div>
              <input className="input-underline" type="number" value={values.current_age} onChange={num("current_age")} />
            </div>
            <div>
              <div className="label">目标FIRE年龄 <InfoTip text="计划实现FIRE的年龄。" /></div>
              <input className="input-underline" type="number" value={values.target_fire_age} onChange={num("target_fire_age")} />
            </div>
            <div>
              <div className="label">传统退休年龄 <InfoTip text="用于 Coast 计算的传统退休年龄，默认65。" /></div>
              <input className="input-underline" type="number" value={values.traditional_retirement_age} onChange={num("traditional_retirement_age")} />
            </div>
          </div>
        </section>

        {/* 收入（合并） */}
        <section className="section bg-var-income">
          <h2 className="text-lg font-semibold mb-3">{t("section.income")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="label">月均收入 <InfoTip text="税后合计月收入（不含投资房净租金；净租金在房产区自动计入）。" /></div>
              <input className="input-underline" type="number" value={values.monthly_total_income} onChange={num("monthly_total_income")} />
            </div>
          </div>
        </section>

        {/* 支出（合并） */}
        <section className="section bg-var-expense">
          <h2 className="text-lg font-semibold mb-3">{t("section.expense")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="label">月均支出 <InfoTip text="不含自住房月供；月供另填在房产区的自住房模块里。" /></div>
              <input className="input-underline" type="number" value={values.monthly_total_expenses} onChange={num("monthly_total_expenses")} />
            </div>
          </div>
        </section>

        {/* 房产 */}
        <section className="section bg-var-property">
          <h2 className="text-lg font-semibold mb-3">{t("section.property")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={values.has_property} onChange={bool("has_property")} />
              <span className="label">是否有房产</span>
            </label>
          </div>
          {values.has_property && (<>
            <div className="mt-4 font-medium">自住房</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={values.owner_occ_has_mortgage} onChange={bool("owner_occ_has_mortgage")} />
                <span className="label">是否有月供</span> <InfoTip text="若有月供，请填写房贷与还清年月；系统将按月份自动切换。" />
              </label>
              {values.owner_occ_has_mortgage && (<>
                <div>
                  <div className="label">自住房月均房贷 <InfoTip text="自住房本息合计，每月实际支付的现金流。" /></div>
                  <input className="input-underline" type="number" value={values.owner_occ_mortgage_monthly} onChange={num("owner_occ_mortgage_monthly")} />
                </div>
                <div>
                  <div className="label">自住房房贷还清年月（YYYY-MM） <InfoTip text="格式YYYY-MM；该月起系统停止计入自住房月供。" /></div>
                  <input className="input-underline" type="text" placeholder="YYYY-MM" value={values.owner_occ_mortgage_payoff_ym} onChange={txt("owner_occ_mortgage_payoff_ym")} />
                </div>
              </>)}
            </div>

            <div className="mt-4 font-medium">投资房</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={values.has_investment_property} onChange={bool("has_investment_property")} />
                <span className="label">是否有投资房</span> <InfoTip text="如有投资房，请填写净租金（已扣成本）与房贷信息。" />
              </label>
            </div>
            {values.has_investment_property && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={values.invprop_has_mortgage} onChange={bool("invprop_has_mortgage")} />
                  <span className="label">投资房是否有月供</span> <InfoTip text="如有月供，请分别提供还清前/后净租金及还清年月。" />
                </label>
                {values.invprop_has_mortgage ? (<>
                  <div>
                    <div className="label">投资房还清前净租金（月） <InfoTip text="净额=房租−房贷−税费−保险−维修−空置预备；税后。" /></div>
                    <input className="input-underline" type="number" value={values.invprop_prepayoff_net_rent_monthly} onChange={num("invprop_prepayoff_net_rent_monthly")} />
                  </div>
                  <div>
                    <div className="label">投资房还清后净租金（月） <InfoTip text="净额=房租−税费−保险−维修；税后。" /></div>
                    <input className="input-underline" type="number" value={values.invprop_postpayoff_net_rent_monthly} onChange={num("invprop_postpayoff_net_rent_monthly")} />
                  </div>
                  <div>
                    <div className="label">投资房房贷还清年月（YYYY-MM） <InfoTip text="格式YYYY-MM；该月起使用“还清后净租金”。" /></div>
                    <input className="input-underline" type="text" placeholder="YYYY-MM" value={values.invprop_payoff_ym} onChange={txt("invprop_payoff_ym")} />
                  </div>
                </>) : (
                  <div>
                    <div className="label">投资房净租金（月） <InfoTip text="无月供时仅填此项；净额（已扣成本），税后。" /></div>
                    <input className="input-underline" type="number" value={values.invprop_net_rent_monthly} onChange={num("invprop_net_rent_monthly")} />
                  </div>
                )}
              </div>
            )}
          </>)}
        </section>

        {/* 投资 */}
        <section className="section bg-var-invest">
          <h2 className="text-lg font-semibold mb-3">{t("section.invest")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="label">现有投资组合市值 <InfoTip text="当前可投资资产总市值（不含自住房）。" /></div>
              <input className="input-underline" type="number" value={values.current_portfolio_value} onChange={num("current_portfolio_value")} />
            </div>

            {/* 贡献比例：滑杆 + 百分数输入 */}
            <div>
              <div className="label">净收入用于投资比例 <InfoTip text="每月净收入中用于投资的比例（百分数输入）。" /></div>
              <input className="w-full" type="range" min={0} max={1} step={0.01} value={values.contribution_rate_of_net_income}
                     onChange={(e)=>setValues((x:any)=>({...x, contribution_rate_of_net_income: Math.round(Number(e.target.value)*100)/100 }))} />
              <div className="mt-1">
                <PercentInput value={values.contribution_rate_of_net_income} onChange={(v)=>setValues((x:any)=>({...x, contribution_rate_of_net_income:v}))} minPct={0} maxPct={100} stepPct={1} />
              </div>
            </div>

            {/* 回报率（前/后） */}
            <div>
              <div className="label">FIRE前实际年化回报率（APY） <InfoTip text="年化有效实际回报率，已扣通胀与成本（百分数输入）。" /></div>
              <input className="w-full" type="range" min={0} max={0.08} step={0.001} value={values.pre_fire_real_return_rate}
                     onChange={(e)=>setValues((x:any)=>({...x, pre_fire_real_return_rate: Math.round(Number(e.target.value)*100)/100 }))} />
              <div className="mt-1">
                <PercentInput value={values.pre_fire_real_return_rate} onChange={(v)=>setValues((x:any)=>({...x, pre_fire_real_return_rate:v}))} minPct={0} maxPct={8} stepPct={0.1} />
              </div>
            </div>
            <div>
              <div className="label">FIRE后实际年化回报率（APY，可选） <InfoTip text="退休期的年化有效实际回报率，不填则默认等同于FIRE前（百分数输入）。" /></div>
              <input className="w-full" type="range" min={0} max={0.08} step={0.001} value={values.post_fire_real_return_rate}
                     onChange={(e)=>setValues((x:any)=>({...x, post_fire_real_return_rate: Math.round(Number(e.target.value)*100)/100 }))} />
              <div className="mt-1">
                <PercentInput value={values.post_fire_real_return_rate} onChange={(v)=>setValues((x:any)=>({...x, post_fire_real_return_rate:v}))} minPct={0} maxPct={8} stepPct={0.1} />
              </div>
            </div>
          </div>
        </section>

        {/* FIRE目标 */}
        <section className="section bg-var-goal">
          <h2 className="text-lg font-semibold mb-3">{t("section.goal")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="label">FIRE后月均基础支出（Lean） <InfoTip text="以今日币值填写，作为 Lean 目标的年支出基础。" /></div>
              <input className="input-underline" type="number" value={values.fire_monthly_basic} onChange={num("fire_monthly_basic")} />
            </div>
            <div>
              <div className="label">FIRE后月均舒适支出（Classic） <InfoTip text="以今日币值填写，作为 Classic 目标的年支出。" /></div>
              <input className="input-underline" type="number" value={values.fire_monthly_comfort} onChange={num("fire_monthly_comfort")} />
            </div>
            <div>
              <div className="label">FIRE后月均富足支出（Fat） <InfoTip text="以今日币值填写，作为 Fat 目标的年支出。" /></div>
              <input className="input-underline" type="number" value={values.fire_monthly_luxury} onChange={num("fire_monthly_luxury")} />
            </div>

            {/* 提领率：滑杆 + 百分数输入 */}
            <div>
              <div className="label">提领率（2%~6%） <InfoTip text="FIRE后每年可从投资组合提取的比例（百分数输入）。" /></div>
              <input className="w-full" type="range" min={0.02} max={0.06} step={0.001} value={values.withdrawal_rate}
                     onChange={(e)=>setValues((x:any)=>({...x, withdrawal_rate: Math.round(Number(e.target.value)*100)/100 }))} />
              <div className="mt-1">
                <PercentInput value={values.withdrawal_rate} onChange={(v)=>setValues((x:any)=>({...x, withdrawal_rate:v}))} minPct={2} maxPct={6} stepPct={0.1} />
              </div>
            </div>

            <div>
              <div className="label">FIRE后其他稳定收入（月，税后） <InfoTip text="副业/养老金等长期可持续收入；不要包含投资收益或房租净额（房租在房产区已录入）。" /></div>
              <input className="input-underline" type="number" value={values.post_fire_part_time_income_monthly} onChange={num("post_fire_part_time_income_monthly")} />
            </div>
            <div>
              <div className="label">安全缓冲倍数（1.0~1.5） <InfoTip text="目标资产的安全边际倍数。" /></div>
              <input className="w-full" type="range" min={1.0} max={1.5} step={0.01} value={values.safety_buffer_multiplier} onChange={num("safety_buffer_multiplier")} />
              <div className="mt-1">
                <input className="input-underline w-28" type="number" step={0.01} value={values.safety_buffer_multiplier} onChange={num("safety_buffer_multiplier")} />
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 mt-2">
            <div className="flex items-center gap-2">
              <Switch checked={values.include_stable_income_offset} onChange={(v)=>setValues((x:any)=>({...x, include_stable_income_offset:v}))} />
              <span className="label">抵扣 FIRE 后其他稳定收入</span>
              <InfoTip text="开启：把‘净房租 + 其他稳定收入（副业/养老金等）’并为稳定收入，抵扣 Lean/Classic/Fat/Flamingo；Barista 永远抵扣（与此开关无关）。" />
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button className="button" onClick={onSubmit}>{t("submit")}</button>
        <div className="text-sm opacity-70">Language: {locale} · Currency: {currency}</div>
      </div>

      {errors && (<div className="card p-4 text-red-700" style={{ background:"#FEF2F2", borderColor:"#FECACA" }}>{errors.split("\n").map((l,i)=><div key={i}>{l}</div>)}</div>)}

      {result && (
        <section className="grid grid-cols-1 gap-5 mt-5">
          <KpiCards
            attainedType={ result.attainment.fat ? "Fat" : result.attainment.classic ? "Classic" : result.attainment.lean ? "Lean" : "None" }
            pv={result.pv_target_age}
            achieved100={[
              ...(result.progress.lean    >= 1 ? [{type:'Lean',     progress: result.progress.lean}]    : []),
              ...(result.progress.classic >= 1 ? [{type:'Classic',  progress: result.progress.classic}] : []),
              ...(result.progress.fat     >= 1 ? [{type:'Fat',      progress: result.progress.fat}]     : []),
              ...(result.progress.barista_classic >= 1 ? [{type:'Barista', progress: result.progress.barista_classic}] : []),
              ...(result.progress.flamingo >= 1 ? [{type:'Flamingo', progress: result.progress.flamingo}] : []),
              ...(result.attainment.coast ? [{type:'Coast', progress: 1}] : []),
            ]}
          />

          <TypeList
            progress={result.progress}
            attainment={result.attainment}
            targets={result.targets}
            requiredNowForTR={result.coast_required_now}
            coast={result.attainment.coast}
            coastProgress={result.coast_progress}
            note={values.include_stable_income_offset ? "提示：已开启稳定收入抵扣；Barista 永远抵扣（不受此开关影响）。" : undefined}
          />

          <TrajectoryChart
            labels={result.timeline.labels}
            pv={result.timeline.pv}
            net={result.timeline.net}
            markers={result.timeline.markers}
            targets={{
              lean: result.targets.lean,
              classic: result.targets.classic,
              fat: result.targets.fat,
              barista: result.targets.barista_classic,
              flamingo: result.targets.flamingo,
              coast: result.coast_required_now
            }}
          />
        </section>
      )}
    </main>
  );
}
