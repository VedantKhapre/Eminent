import { useState, useRef } from "react";
import { CODE_LANGUAGES, DEFAULT_CODE } from "./languages";
import type { EvalResponse } from "./eval";
export type { TestResult, EvalResponse } from "./eval";
export type { CodeLanguage } from "./languages";
export { CODE_LANGUAGES } from "./languages";

export function useCodeRunner() {
  const [code, setCode] = useState(DEFAULT_CODE["c++"]);
  const [selectedLanguageId, setSelectedLanguageId] = useState("cpp-10");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResponse | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [outputHeight, setOutputHeight] = useState(300);
  const abortRef = useRef<AbortController | null>(null);

  const selectedLanguage =
    CODE_LANGUAGES.find((lang) => lang.id === selectedLanguageId) ?? CODE_LANGUAGES[0];

  const handleLanguageChange = (id: string) => {
    setSelectedLanguageId(id);
    const lang = CODE_LANGUAGES.find((l) => l.id === id);
    if (lang) setCode(DEFAULT_CODE[lang.language] ?? "");
  };

  async function callEvaluate(problemId: number, publicOnly: boolean) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
  
    const res = await fetch("/api/piston/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        source_code: code,
        language: selectedLanguage.language,
        version: selectedLanguage.version,
        problemId,
        publicOnly,
      }),
    });
    if (res.status === 429) throw new Error("Too many requests. Please wait a moment.");
    if (!res.ok) {
      let message = "Evaluation failed. Please try again.";
      try {
        const data = await res.json();
        if (typeof data?.error === "string") message = data.error;
      } catch {
        // keep generic message if response is not JSON
      }
      throw new Error(message);
    }
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
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setEvalError(err instanceof Error ? err.message : "Cannot reach the server.");
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
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setEvalError(err instanceof Error ? err.message : "Cannot reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    code,
    setCode,
    selectedLanguageId,
    setSelectedLanguageId: handleLanguageChange,
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
  };
}