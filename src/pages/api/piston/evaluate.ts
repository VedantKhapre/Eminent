import type { APIRoute } from "astro";
import { problemTestCases } from "../../../data/testcase/testCases";
import { execute } from "@/lib/piston";
import { isRateLimited } from "@/lib/rateLimit";
import { jsonError, truncate } from "@/lib/apiHelpers";

const MAX_SOURCE_LENGTH = 100_000;

const ALLOWED_RUNTIMES = new Set([
  "javascript@18.15.0",
  "typescript@5.0.3",
  "python@3.10.0",
  "c++@10.2.0",
  "c@10.2.0",
  "java@15.0.2",
  "rust@1.50.0",
]);

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Auth
    const { isAuthenticated, userId } = locals.auth();
    if (!isAuthenticated || !userId) return jsonError("Unauthorized", 401);
    if (isRateLimited(userId)) return jsonError("Too many requests. Please wait a moment.", 429);

    // Validate body
    const { source_code, language = "javascript", version = "18.15.0", problemId, publicOnly } =
      await request.json();

    if (
      typeof source_code !== "string" ||
      typeof problemId !== "number" ||
      typeof publicOnly !== "boolean"
    ) {
      return jsonError("Invalid request payload", 400);
    }
    if (source_code.length > MAX_SOURCE_LENGTH) return jsonError("Source code too large", 413);
    if (!ALLOWED_RUNTIMES.has(`${language}@${version}`)) return jsonError("Unsupported runtime", 400);

    const problem = problemTestCases.find((p) => p.id === problemId);
    if (!problem) return jsonError("Problem not found", 404);

    // Run test cases
    const tests = publicOnly ? problem.public : [...problem.public, ...problem.private];

    const settled = await Promise.allSettled(
      tests.map((test) => execute(language, version, source_code, test.input)),
    );

    // Build results
    let passedCount = 0;
    const results = settled.map((result, i) => {
      const isPublic = i < problem.public.length;

      if (result.status === "rejected") {
        if (result.reason?.message === "RATE_LIMITED") throw new Error("RATE_LIMITED");
        return {
          testNumber: i + 1,
          passed: false,
          isPrivate: !isPublic,
          input: isPublic ? tests[i].input : "Hidden",
          expected: isPublic ? tests[i].expected : "Hidden",
          output: isPublic ? "Execution error" : "Wrong Answer/Error",
        };
      }

      const stdout = truncate(result.value.run?.stdout ?? "");
      const stderr = truncate(result.value.run?.stderr ?? "");
      const passed = stdout === tests[i].expected.trim();
      if (passed) passedCount++;

      return {
        testNumber: i + 1,
        passed,
        isPrivate: !isPublic,
        input: isPublic ? tests[i].input : "Hidden",
        expected: isPublic ? tests[i].expected : "Hidden",
        output: isPublic ? stdout || stderr || "No Output" : passed ? "Hidden" : "Wrong Answer/Error",
      };
    });

    return new Response(
      JSON.stringify({ passedCount, total: tests.length, results }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "RATE_LIMITED") return jsonError("Too many requests. Please wait a moment.", 429);
    return jsonError("Evaluation failed. Please try again.", 500);
  }
};