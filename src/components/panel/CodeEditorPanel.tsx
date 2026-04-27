import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import OutputPanel from "@/components/panel/OutputPanel";
import GridPattern from "@/components/grid/GridPattern";
import { useCodeRunner } from "src/hooks/CodeRunner";

interface Props {
  problemId: number;
}

export default function CodeEditorPanel({ problemId }: Props) {
  const {
    code,
    setCode,
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

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-sm font-bold tracking-widest text-gray-600 uppercase">
          JavaScript
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRun(problemId)}
            disabled={isRunning || isSubmitting}
            className="text-xs font-sans font-bold tracking-widest text-white uppercase bg-[#5b5bd6] px-4 py-2 border-2 border-black shadow-[3px_3px_0px_black] hover:shadow-none `hover:translate-y-0.75 `hover:translate-x-0.75 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isRunning ? "Running . ." : "▶ Run"}
          </button>
          <button
            onClick={() => handleSubmit(problemId)}
            disabled={isRunning || isSubmitting}
            className="text-xs font-sans font-bold tracking-widest text-white uppercase bg-[#22c55e] px-4 py-2 border-2 border-black shadow-[3px_3px_0px_black] hover:shadow-none `hover:translate-y-0.75 `hover:translate-x-0.75 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? "Submitting . ." : "Submit"}
          </button>
        </div>
      </div>
      <div className="flex-1 rounded-xl border border-gray-200 overflow-hidden relative">
        <CodeMirror
          value={code}
          height="100%"
          extensions={[javascript()]}
          onChange={(val) => setCode(val)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            autocompletion: true,
            indentOnInput: true,
            tabSize: 2,
          }}
          style={{
            fontSize: 18,
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
