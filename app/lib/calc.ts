export type Inputs = {
  current_age: number;
  target_fire_age: number;
  traditional_retirement_age?: number;

  monthly_total_income: number;

  has_property?: boolean;
  owner_occ_has_mortgage?: boolean;
  owner_occ_mortgage_monthly?: number;
  owner_occ_mortgage_payoff_ym?: string;

  has_investment_property?: boolean;
  invprop_has_mortgage?: boolean;
  invprop_prepayoff_net_rent_monthly?: number;
  invprop_postpayoff_net_rent_monthly?: number;
  invprop_payoff_ym?: string;
  invprop_net_rent_monthly?: number;

  monthly_total_expenses: number;

  current_portfolio_value: number;
  contribution_rate_of_net_income: number;
  pre_fire_real_return_rate: number;
  post_fire_real_return_rate?: number;

  fire_monthly_basic: number;
  fire_monthly_comfort: number;
  fire_monthly_luxury: number;
  withdrawal_rate: number;
  post_fire_part_time_income_monthly?: number;
  safety_buffer_multiplier?: number;

  include_stable_income_offset?: boolean;
};

function ymToDate(ym: string): Date { const [y,m]=ym.split("-").map(s=>parseInt(s,10)); return new Date(y, m-1, 1); }
function addMonths(d: Date, m: number): Date { const dt=new Date(d.getTime()); dt.setMonth(dt.getMonth()+m); return dt; }

export function compute(inputs: Inputs){
  const now = new Date(); const nowYm = new Date(now.getFullYear(), now.getMonth(), 1);

  const rPreY  = inputs.pre_fire_real_return_rate;
  const rPostY = inputs.post_fire_real_return_rate ?? inputs.pre_fire_real_return_rate;
  const rPreM  = Math.pow(1 + rPreY,  1/12) - 1;
  const rPostM = Math.pow(1 + rPostY, 1/12) - 1;

  const buffer = inputs.safety_buffer_multiplier ?? 1.1;

  const annualLean    = 12 * inputs.fire_monthly_basic;
  const annualClassic = 12 * inputs.fire_monthly_comfort;
  const annualFat     = 12 * inputs.fire_monthly_luxury;

  const monthsToFire = Math.max(Math.round((inputs.target_fire_age - inputs.current_age) * 12), 0);
  const fireDate     = new Date(nowYm.getFullYear(), nowYm.getMonth() + monthsToFire, 1);

  const ownerPayoff = (inputs.owner_occ_has_mortgage && inputs.owner_occ_mortgage_payoff_ym)
    ? ymToDate(inputs.owner_occ_mortgage_payoff_ym) : null;
  const invPayoff   = (inputs.has_investment_property && inputs.invprop_has_mortgage && inputs.invprop_payoff_ym)
    ? ymToDate(inputs.invprop_payoff_ym) : null;

  function netRentAt(d: Date){
    let inc=0;
    if (inputs.has_property && inputs.has_investment_property){
      if (inputs.invprop_has_mortgage){
        if (invPayoff && d < invPayoff) inc = inputs.invprop_prepayoff_net_rent_monthly ?? 0;
        else                             inc = inputs.invprop_postpayoff_net_rent_monthly ?? 0;
      } else inc = inputs.invprop_net_rent_monthly ?? 0;
    }
    return inc;
  }

  const otherStableMonthly = (inputs.post_fire_part_time_income_monthly ?? 0);
  const rentMonthlyAtFire  = netRentAt(fireDate);

  const offsetForAll    = inputs.include_stable_income_offset ? (12*rentMonthlyAtFire + 12*otherStableMonthly) : 0;
  const offsetForBarista= 12*rentMonthlyAtFire + 12*otherStableMonthly; // always

  const effAnnualLean    = Math.max(annualLean    - offsetForAll, 0);
  const effAnnualClassic = Math.max(annualClassic - offsetForAll, 0);
  const effAnnualFat     = Math.max(annualFat     - offsetForAll, 0);

  const targetLean    = (effAnnualLean    / inputs.withdrawal_rate) * buffer;
  const targetClassic = (effAnnualClassic / inputs.withdrawal_rate) * buffer;
  const targetFat     = (effAnnualFat     / inputs.withdrawal_rate) * buffer;

  // Barista always offsets (independent of switch)
  const needClassicBarista   = Math.max(annualClassic - offsetForBarista, 0);
  const targetBaristaClassic = (needClassicBarista / inputs.withdrawal_rate) * buffer;

  // Flamingo respects switch
  const targetFlamingo = 12.5 * effAnnualClassic * buffer;

  // Coast uses Classic (with/without offset) discounted to today
  const tra = inputs.traditional_retirement_age ?? 65;
  const yearsToTR = Math.max(tra - inputs.current_age, 0);
  const requiredNowForTR = targetClassic / Math.pow(1 + rPreY, yearsToTR);
  const coast         = inputs.current_portfolio_value >= requiredNowForTR;
  const coastProgress = requiredNowForTR > 0 ? inputs.current_portfolio_value / requiredNowForTR : 1;

  // Extend to FIRE + 20 years; post-FIRE uses post return, net cashflow 0
  const extendMonths = 20 * 12;
  const totalMonths  = monthsToFire + extendMonths;
  const labels:string[]=[]; const pvSeries:number[]=[]; const netSeries:number[]=[];
  let pv=inputs.current_portfolio_value;

  for(let i=0;i<=totalMonths;i++){
    const d  = new Date(nowYm.getFullYear(), nowYm.getMonth()+i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    labels.push(ym);

    const incInv = netRentAt(d);
    const income = (i <= monthsToFire ? (inputs.monthly_total_income ?? 0) : 0) + incInv;

    let mort=0;
    if (inputs.has_property && inputs.owner_occ_has_mortgage){
      mort = (ownerPayoff && d < ownerPayoff) ? (inputs.owner_occ_mortgage_monthly ?? 0) : 0;
    }
    const expense = (i <= monthsToFire ? (inputs.monthly_total_expenses ?? 0) : 0) + mort;

    const net = income - expense;
    netSeries.push(net);

    const contrib = (i <= monthsToFire && net>0) ? net * inputs.contribution_rate_of_net_income : 0;
    const rate    = (i <= monthsToFire) ? rPreM : rPostM;
    pv = (pv + contrib) * (1 + rate);
    pvSeries.push(pv);
  }

  const pvTarget = pvSeries[Math.min(monthsToFire, pvSeries.length-1)];

  const attainment={ fat: pvTarget>=targetFat, classic: pvTarget>=targetClassic, lean: pvTarget>=targetLean };
  const progress={
    lean:            targetLean>0 ? pvTarget/targetLean : 0,
    classic:         targetClassic>0 ? pvTarget/targetClassic : 0,
    fat:             targetFat>0 ? pvTarget/targetFat : 0,
    barista_classic: targetBaristaClassic>0 ? pvTarget/targetBaristaClassic : 0,
    flamingo:        targetFlamingo>0 ? pvTarget/targetFlamingo : 0
  };

  const list=[
    {type:'lean',progress:progress.lean},
    {type:'classic',progress:progress.classic},
    {type:'fat',progress:progress.fat},
    {type:'barista',progress:progress.barista_classic},
    {type:'flamingo',progress:progress.flamingo}
  ]; if (coast) list.push({type:'coast',progress:1});
  const closest_over_50=list.filter(x=>x.progress>=0.5).sort((a,b)=>b.progress-a.progress);

  const fireYm=`${fireDate.getFullYear()}-${String(fireDate.getMonth()+1).padStart(2,"0")}`;
  const ownerYm=(inputs.owner_occ_has_mortgage && inputs.owner_occ_mortgage_payoff_ym) ? inputs.owner_occ_mortgage_payoff_ym : null;
  const invYm=(inputs.has_investment_property && inputs.invprop_has_mortgage && inputs.invprop_payoff_ym) ? inputs.invprop_payoff_ym : null;

  return {
    pv_target_age: pvTarget,
    coast_required_now: requiredNowForTR,
    coast_progress: coastProgress,
    targets: { lean: targetLean, classic: targetClassic, fat: targetFat, barista_classic: targetBaristaClassic, flamingo: targetFlamingo },
    progress,
    attainment: { lean: attainment.lean, classic: attainment.classic, fat: attainment.fat, barista: pvTarget>=targetBaristaClassic, flamingo: pvTarget>=targetFlamingo, coast },
    closest_over_50,
    timeline: { labels, pv: pvSeries, net: netSeries, markers: { owner_payoff_ym: ownerYm, inv_payoff_ym: invYm, fire_ym: fireYm } }
  };
}
