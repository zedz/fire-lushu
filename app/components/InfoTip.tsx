"use client";
export default function InfoTip({ text }: { text: string }) {
  return (
    <span className="tooltip ml-1 align-middle">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px] leading-none select-none">!</span>
      <span className="tooltip-content">{text}</span>
    </span>
  );
}
