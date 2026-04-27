import { useState, useRef, useEffect } from "react";
import type { EvalResponse } from "src/hooks/CodeRunner";

interface Props {
  evalResult: EvalResponse | null;
  evalError: string | null;
  isLoading: boolean;
  height: number;
  onClose: () => void;
  onHeightChange: (h: number) => void;
}

export default function OutputPanel({
  evalResult,
  evalError,
  isLoading,
  height,
  onClose,
  onHeightChange,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const drag = useRef({ active: false, startY: 0, startH: 0 });

  useEffect(() => {
    setActiveTab(0);
  }, [evalResult]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      const next = Math.min(
        600,
        Math.max(80, drag.current.startH + drag.current.startY - e.clientY),
      );
      onHeightChange(next);
    };
    const onUp = () => {
      drag.current.active = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onHeightChange]);

  let pubIdx = 0;
  const tabs =
    evalResult?.results
      .filter((r) => !r.isPrivate)
      .map((r) => ({ label: `case ${++pubIdx}`, result: r })) ?? [];
  const privateResults = evalResult?.results.filter((r) => r.isPrivate) ?? [];
  const privatePassed = privateResults.filter((r) => r.passed).length;
  const privateTotal = privateResults.length;
  const privatePct = privateTotal ? (privatePassed / privateTotal) * 100 : 0;

  const active = tabs[activeTab] ?? null;

  return (
    <div
      className="flex shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
      style={{ height }}
    >
      <div
        onMouseDown={(e) => {
          drag.current = { active: true, startY: e.clientY, startH: height };
          e.preventDefault();
        }}
        className="flex shrink-0 cursor-ns-resize select-none items-center justify-between border-b border-gray-100 px-4 py-2 hover:bg-gray-50"
      >
        <span className="text-sm font-bold tracking-widest text-gray-600 uppercase">
          Test Cases
        </span>
        <button
          type="button"
          aria-label="Close test cases"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-sm text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          x
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-3">
        {isLoading && <p className="text-sm text-gray-400">Running…</p>}

        {evalError && <p className="text-sm text-red-500">{evalError}</p>}

        {evalResult && (
          <>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {tabs.map((tab, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-bold tracking-widest uppercase ${
                    activeTab === i
                      ? "border-[#5b5bd6] bg-[#5b5bd6] text-white"
                      : "border-gray-200 text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid min-h-0 flex-1 gap-3 overflow-hidden md:grid-cols-[minmax(0,1.15fr)_minmax(12rem,0.85fr)]">
              {active && (
                <div className="min-h-0 overflow-y-auto pr-1">
                  <div className="flex flex-col gap-2">
                    <Row label="input" value={active.result.input} />
                    <Row
                      label="expected output"
                      value={active.result.expected}
                    />
                    <Row
                      label="your output"
                      value={active.result.output}
                      passed={active.result.passed}
                    />
                  </div>
                </div>
              )}

              {privateTotal > 0 && (
                <div className="flex min-h-0 flex-col items-center border-l border-gray-100 px-3 pt-3">
                  <span className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Private test cases
                  </span>
                  <div
                    className="grid h-20 w-20 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(#22c55e ${privatePct}%, #e5e7eb 0)`,
                    }}
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-base font-bold text-gray-700">
                      {privatePassed}/{privateTotal}
                    </span>
                  </div>
                  <span
                    className={`mt-2 text-center text-xs font-bold uppercase tracking-widest ${privatePassed === privateTotal ? "text-green-600" : "text-red-500"}`}
                  >
                    {privatePassed === privateTotal
                      ? "Test cases passed"
                      : "Test cases failed"}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  passed,
}: {
  label: string;
  value: string;
  passed?: boolean;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-2">
      <span className="pt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span
        className={`min-w-0 whitespace-pre-wrap wrap-break-word rounded-md border px-2 py-1.5 font-mono text-sm ${
          passed === undefined
            ? "border-gray-200 text-gray-700"
            : passed
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
