import CodeMirror from "@uiw/react-codemirror";
import { useMemo, useEffect, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import OutputPanel from "@/components/panel/OutputPanel";
import GridPattern from "@/components/grid/GridPattern";
import { CODE_LANGUAGES, useCodeRunner } from "src/hooks/CodeRunner";

interface Props {
  problemId: number;
  onSolve: (id: number) => void;
}

const BASIC_SETUP = {
  lineNumbers: true,
  foldGutter: true,
  highlightActiveLine: true,
  autocompletion: true,
  indentOnInput: true,
  tabSize: 2,
};

export default function CodeEditorPanel({ problemId, onSolve }: Props) {
  const {
    code,
    setCode,
    selectedLanguageId,
    setSelectedLanguageId,
    selectedLanguage,
    isRunning,
    isSubmitting,
    hasRun,
    setHasRun,
    evalResult,
    evalError,
    outputHeight,
    setOutputHeight,
    handleRun,
    handleSubmit,
  } = useCodeRunner();
  const [showLogout, setShowLogout] = useState(false);
  
  useEffect(() => {
    if (!evalResult) return;
    const hasPrivate = evalResult.results.some((r) => r.isPrivate);
    if (hasPrivate && evalResult.results.every((r) => r.passed)) onSolve(problemId);
  }, [evalResult]);

  const handleLogout = () => {
    const clerk = (window as Window & { Clerk?: { signOut: (options?: { redirectUrl?: string }) => void | Promise<void> } }).Clerk;
    if (clerk) {
      void clerk.signOut({ redirectUrl: "/" });
      return;
    }

    window.location.assign("/");
  };

  const editorExtensions = useMemo(() => {
    switch (selectedLanguage.language) {
      case "c":
        return [cpp()];
      case "javascript":
        return [javascript()];
      case "typescript":
        return [javascript({ typescript: true })];
      case "python":
        return [python()];
      case "c++":
        return [cpp()];
      case "java":
        return [java()];
      case "rust":
        return [rust()];
      default:
        return [];
    }
  }, [selectedLanguage.language]);

  return (
    <div className="flex flex-col h-full p-2 gap-2 sm:p-3 sm:gap-3">
      <div className="flex flex-col gap-2 shrink-0 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase">
          <select
            value={selectedLanguageId}
            onChange={(e) => setSelectedLanguageId(e.target.value)}
            className="h-8 w-full rounded-md border border-gray-300 bg-white px-2 text-xs font-semibold tracking-normal text-gray-700 outline-none focus:border-[#5b5bd6] sm:w-auto"
          >
            {CODE_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            onClick={() => handleRun(problemId)}
            disabled={isRunning || isSubmitting}
            className="text-xs font-sans font-bold tracking-widest text-white uppercase bg-[#5b5bd6] px-3 py-2 border-2 border-black shadow-[3px_3px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none sm:px-4"
          >
            {isRunning ? "Running . ." : "▶ Run"}
          </button>
          <button
            onClick={() => handleSubmit(problemId)}
            disabled={isRunning || isSubmitting}
            className="text-xs font-sans font-bold tracking-widest text-white uppercase bg-[#22c55e] px-3 py-2 border-2 border-black shadow-[3px_3px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none sm:px-4"
          >
            {isSubmitting ? "Submitting . ." : "Submit"}
          </button>
          <div className="relative z-30">
            <button
              type="button"
              aria-label="Toggle account actions"
              aria-expanded={showLogout}
              onClick={() => setShowLogout((prev) => !prev)}
              className="h-9 w-9 flex items-center justify-center bg-[#c8ecff] border-2 border-black shadow-[3px_3px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <svg
                className={`h-4 w-4 text-black transition-transform ${showLogout ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showLogout && (
              <button
                type="button"
                onClick={handleLogout}
                className="absolute right-0 top-12 whitespace-nowrap text-xs font-sans font-bold tracking-widest text-white uppercase bg-red-500 px-3 py-2 border-2 border-black shadow-[3px_3px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Logout
              </button>

            )}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 rounded-xl border border-gray-200 overflow-hidden relative">
        <CodeMirror
          value={code}
          height="100%"
          extensions={editorExtensions}
          onChange={(val) => setCode(val)}
          basicSetup={BASIC_SETUP}
          style={{
            fontSize: "clamp(14px, 4vw, 18px)",
            fontFamily: "Menlo, Fira Mono, monospace",
            height: "100%",
          }}
        />
        <GridPattern corner="bottom-right" color="#93c5fd" opacity={0.8} />
      </div>
      {hasRun && (
        <OutputPanel
          evalResult={evalResult}
          evalError={evalError}
          isLoading={isRunning || isSubmitting}
          height={outputHeight}
          onHeightChange={setOutputHeight}
          onClose={() => setHasRun(false)}
        />
      )}
    </div>
  );
}
