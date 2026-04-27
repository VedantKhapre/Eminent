import { useState } from "react";

export type TestResult = {
  testNumber: number;
  passed: boolean;
  isPrivate: boolean;
  input: string;
  expected: string;
  output: string;
};

export type EvalResponse = {
  passedCount: number;
  total: number;
  results: TestResult[];
};

export function useCodeRunner() {
  const [code, setCode] = useState(`console.log("Hello, World!")`);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResponse | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [outputHeight, setOutputHeight] = useState(300);

  async function callEvaluate(problemId: number, publicOnly: boolean) {
    const res = await fetch("/api/judge0/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        language_id: 63,
        problemId,
        publicOnly,
      }),
    });
    const data: EvalResponse = await res.json();
    setEvalResult(data);
  }

  const handleRun = async (problemId: number) => {
    setIsRunning(true);
    setHasRun(true);
    setEvalResult(null);
    setEvalError(null);
    try {
      await callEvaluate(problemId, true);
    } catch {
      setEvalError("Cannot reach the server at the moment.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async (problemId: number) => {
    setIsSubmitting(true);
    setHasRun(true);
    setEvalResult(null);
    setEvalError(null);
    try {
      await callEvaluate(problemId, false);
    } catch {
      setEvalError("Evaluation failed. Cannot reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
