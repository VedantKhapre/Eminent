import { useState } from "react";
import type { Problems } from "../../data/problems/types";

interface Props {
  problems: Problems[];
  activeProblem: Problems;
  onSelect: (p: Problems) => void;
  onBack: () => void;
}

type RowItem = { id: string; p?: Problems; i?: number };

export default function SelectionPanel({
  problems,
  activeProblem,
  onSelect,
  onBack,
}: Props) {
  const [hoverIdx, setHoverIndex] = useState<number | null>(null);

  const rows: RowItem[] = [
    { id: "top-1" },
    ...problems.flatMap((p, i) => [
      { id: `p-${p.id}`, p, i: i + 1 },
      { id: `e-${p.id}-1` },
      { id: `e-${p.id}-2` },
    ]),
  ];

  const waves = [
    "w-20 bg-white/90",
    "w-16 bg-white/70",
    "w-14 bg-white/50",
    "w-12 bg-white/30",
  ];

  return (
    <div
      className="flex flex-col p-6 h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      onPointerLeave={() => setHoverIndex(null)}
    >
      <div className="flex items-center justify-between mb-8 shrink-0">
        <span className="text-sm font-sans font-bold tracking-widest text-white/40 uppercase">
          Problems list
        </span>
        <button
          type="button"
          aria-label="Close problem list"
          onClick={onBack}
          className="group flex h-8 w-8 items-center justify-center rounded-sm border border-white/35 bg-white/10 shadow-[3px_3px_0_rgba(255,255,255,0.16)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/15 hover:shadow-[5px_5px_0_rgba(255,255,255,0.18)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_rgba(255,255,255,0.14)]"
        >
          <svg
            className="w-4 h-4 text-white/70 transition-colors group-hover:text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col pb-12">
        {rows.map((row, idx) => {
          const dist = hoverIdx !== null ? Math.abs(idx - hoverIdx) : Infinity;
          const isActive = row.p?.id === activeProblem.id;

          const width =
            dist < 4
              ? waves[dist]
              : isActive
                ? "w-16 bg-white"
                : "w-10 bg-white/20";
          const text = dist === 0 || isActive ? "text-white" : "text-white/40";
          const content = (
            <>
              <div className="w-16 md:w-24 shrink-0 flex items-center"> 
                <div
                  className={`h-0.5 rounded-full transition-all duration-200 ${width}`}
                />
              </div>
              {row.p && (
                <span className={`text-xl md:text-2xl font-sans font-bold leading-none transition-colors duration-200 ${text}`}>
                  {row.i}. {row.p.name}
                </span>
              )}
            </>
          );

          if (!row.p) {
            return (
              <div
                key={row.id}
                onPointerEnter={() => setHoverIndex(idx)}
                className="flex items-center h-4.5"
              >
                {content}
              </div>
            );
          }

          const problem = row.p;

          return (
            <button
              type="button"
              key={row.id}
              onClick={() => {
                onSelect(problem);
                onBack();
              }}
              onPointerEnter={() => setHoverIndex(idx)}
              className="group flex h-4.5 items-center text-left cursor-pointer"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
