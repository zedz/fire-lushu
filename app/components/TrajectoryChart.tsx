"use client";
import { Line } from "react-chartjs-2";
import { CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Chart as ChartJS } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, annotationPlugin);

function getVar(name:string, fallback:string){
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

type Props = {
  labels: string[];
  pv: number[];
  targets: { lean:number; classic:number; fat:number; barista:number; flamingo:number; coast:number; };
  net?: number[];
  markers?: { owner_payoff_ym?: string|null; inv_payoff_ym?: string|null; fire_ym?: string };
};

export default function TrajectoryChart({ labels, pv, targets, net, markers }: Props){
  const colorPV = getVar('--chart-pv', '#6A8CAF');
  const colorLean = getVar('--chart-lean', '#5AA382');
  const colorClassic = getVar('--chart-classic', '#8C7C9E');
  const colorFat = getVar('--chart-fat', '#C27D7D');
  const colorBarista = getVar('--chart-barista', '#7AA37A');
  const colorFlamingo = getVar('--chart-flamingo', '#B99CA4');
  const colorCoast = getVar('--chart-coast', '#888888');

  const line = (label:string, value:number, color:string, dash:number[]=[]) => ({ label, data: labels.map(()=>value), borderColor: color, borderDash: dash, pointRadius: 0 });

  const idxOf = (ym?:string|null) => ym ? labels.indexOf(ym) : -1;
  const annos:any = {};
  const addVLine = (id:string, idx:number, color:string, label:string) => {
    if (idx>=0) annos[id] = { type:'line', xMin:idx, xMax:idx, borderColor: color, borderWidth:1, borderDash:[4,4], label:{ enabled:true, content:label, position:'start', backgroundColor: color+'20' } };
  };
  addVLine('fire', labels.indexOf(markers?.fire_ym ?? ''), colorPV, 'FIRE');
  addVLine('invPayoff', idxOf(markers?.inv_payoff_ym), '#999', 'INV Payoff');
  addVLine('ownerPayoff', idxOf(markers?.owner_payoff_ym), '#999', 'HOME Payoff');

  const data = {
    labels,
    datasets: [
      { label: 'Portfolio', data: pv, borderColor: colorPV, backgroundColor: colorPV+'33', fill:true, tension:0, stepped:true },
      ...(net ? [{ label: 'Net cashflow (monthly)', data: net, borderColor:'#00000055', pointRadius:0, yAxisID:'y1' }] : []),
      line('Lean target', targets.lean, colorLean, [6,4]),
      line('Classic target', targets.classic, colorClassic, [6,4]),
      line('Fat target', targets.fat, colorFat, [6,4]),
      line('Barista target', targets.barista, colorBarista, [2,4]),
      line('Flamingo target', targets.flamingo, colorFlamingo, [2,6]),
      line('Coast need (today)', targets.coast, colorCoast, [1,6]),
    ]
  };
  const options:any = {
    responsive:true,
    plugins:{ legend:{position:"top"}, tooltip:{}, annotation: { annotations: annos } },
    scales:{ y:{ ticks:{ callback:(v:any)=> typeof v==='number' ? v.toLocaleString() : v } }, y1:{ position:'right', grid:{ drawOnChartArea:false } } }
  };
  return <div className="card p-4"><Line data={data} options={options} /></div>;
}
