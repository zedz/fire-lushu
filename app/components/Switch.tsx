"use client";
export default function Switch({ checked, onChange }: { checked: boolean; onChange: (v:boolean)=>void; }){
  return (
    <button type="button" onClick={()=>onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-[var(--primary)]' : 'bg-gray-300'}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );
}
