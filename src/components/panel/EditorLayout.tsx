import { useState } from "react";
import CodeEditorPanel from "./CodeEditorPanel";
import ProblemPanel from "./ProblemPanel";
import { problems } from "../../data/problems/problems";

export default function EditorLayout() {
  const [open, setOpen] = useState(true);
  const [activeProblem, setActiveProblem] = useState(problems[0]);

  return (
    <div className="h-screen w-screen bg-white p-3">
      <div className="flex h-full rounded-xl overflow-hidden shadow-2xl">
        <div
          style={{ width: open ? 500 : 0 }}
          className="h-full bg-[#5b5bd6] shrink-0 overflow-hidden transition-all duration-300"
        >
          <div className="w-125 h-full">
            <ProblemPanel
              problem={activeProblem}
              problems={problems}
              onSelect={setActiveProblem}
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
          <CodeEditorPanel problemId={activeProblem.id} />
        </div>
      </div>
    </div>
  );
}
