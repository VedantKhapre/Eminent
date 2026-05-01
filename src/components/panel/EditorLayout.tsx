import { useState } from "react";
import CodeEditorPanel from "./CodeEditorPanel";
import ProblemPanel from "./ProblemPanel";
import { problems } from "../../data/problems/problems";
import confetti from "canvas-confetti";

export default function EditorLayout() {
  const [open, setOpen] = useState(true);
  const [activeProblem, setActiveProblem] = useState(problems[0]);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(
    () => new Set(JSON.parse(typeof window !== "undefined" ? (localStorage.getItem("solved") ?? "[]") : "[]")),
  );
  
  const handleSolve = (id: number) => {
    setSolvedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      localStorage.setItem("solved", JSON.stringify([...next]));
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      return next;
    });
  };

  return (
    <div className="h-screen w-screen bg-white p-3">
      <div className="flex h-full rounded-xl overflow-hidden shadow-2xl">
        <div
          style={{ width: open ? "min(500px, calc(100vw - 56px))" : 0 }}
          className="h-full bg-[#5b5bd6] shrink-0 overflow-hidden transition-all duration-300"
        >
          <div className="w-full h-full">
            <ProblemPanel
              problem={activeProblem}
              problems={problems}
              onSelect={setActiveProblem}
              solvedIds={solvedIds}
            />
          </div>
        </div>
        <button
          type="button"
          aria-label={open ? "Hide problem panel" : "Show problem panel"}
          onClick={() => setOpen((v) => !v)}
          className="h-full flex items-center justify-center w-8 shrink-0 bg-blue-50 border-r border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <span
            style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
            className="text-[14px] font-bold tracking-widest text-blue-400 uppercase select-none"
          >
            Problem
          </span>
        </button>
        <div className="flex-1 bg-white min-w-0">
          <CodeEditorPanel key={activeProblem.id} problemId={activeProblem.id} onSolve={handleSolve}/>
        </div>
      </div>
    </div>
  );
}