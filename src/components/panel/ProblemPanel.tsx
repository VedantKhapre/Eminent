import { useState } from "react";
import type { Problems } from "../../data/problems/types";
import GridPattern from "@/components/grid/GridPattern";
import SelectionPanel from "./SelectionPanel";

interface Props {
  problem: Problems;
  problems: Problems[];
  onSelect: (p: Problems) => void;
}

export default function ProblemPanel({ problem, problems, onSelect }: Props) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Problem view */}
      <div
        className="absolute inset-0 flex flex-col overflow-y-auto p-6 transition-all duration-300"
        style={{
          opacity: showSelector ? 0 : 1,
          transform: showSelector ? "translateX(-16px)" : "translateX(0)",
          pointerEvents: showSelector ? "none" : "auto",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-sans font-bold tracking-widest text-white/40 uppercase">
            Problem {problem.id}
          </span>

          <button
            type="button"
            aria-label="Open problem list"
            onClick={() => setShowSelector(true)}
            className="group flex items-center gap-2 rounded-sm border border-white/35 bg-white/10 px-3 py-1.5 shadow-[3px_3px_0_rgba(255,255,255,0.16)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/15 hover:shadow-[5px_5px_0_rgba(255,255,255,0.18)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_rgba(255,255,255,0.14)] shrink-0 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 text-white/70 transition-colors group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h8"
              />
            </svg>
            <span className="text-[10px] font-sans font-bold tracking-widest text-white/70 uppercase transition-colors group-hover:text-white mt-1px">
              List
            </span>
          </button>
        </div>

        <h2 className="text-white font-sans font-bold text-3xl mb-4 leading-tight">
          {problem.name}
        </h2>
        <div className="w-full h-px bg-white/10 mb-4" />
        <div className="flex flex-col gap-3">
          {problem.description.map((para, i) => (
            <p
              key={i}
              className="font-mono text-white/70 text-base leading-relaxed"
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Selector view */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          opacity: showSelector ? 1 : 0,
          transform: showSelector ? "translateX(0)" : "translateX(16px)",
          pointerEvents: showSelector ? "auto" : "none",
        }}
      >
        <SelectionPanel
          problems={problems}
          activeProblem={problem}
          onSelect={onSelect}
          onBack={() => setShowSelector(false)}
        />
      </div>

      <GridPattern corner="bottom-left" color="white" />
    </div>
  );
}
