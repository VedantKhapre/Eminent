import type { APIRoute } from "astro";
import { problemTestCases } from "../../../data/testcase/testCases";

const JUDGE0_URL = import.meta.env.JUDGE0_URL;

export const POST: APIRoute = async ({ request }) => {
  const { source_code, language_id, problemId, publicOnly } =
    await request.json();

  const problem = problemTestCases.find((p) => p.id === problemId);
  if (!problem) return new Response("Problem not found", { status: 404 });

  const tests = publicOnly
    ? problem.public
    : [...problem.public, ...problem.private];

  const submissions = await Promise.all(
    tests.map((test) =>
      fetch(`${JUDGE0_URL}/submissions?wait=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code,
          language_id,
          stdin: test.input,
          expected_output: test.expected,
        }),
      }).then((r) => r.json()),
    ),
  );

  let passedCount = 0;
  const results = submissions.map((data, i) => {
    const isPublic = i < problem.public.length;
    const passed = data.status?.id === 3; // 3 = Accepted
    if (passed) passedCount++;
    return {
      testNumber: i + 1,
      passed,
      isPrivate: !isPublic,
      input: isPublic ? tests[i].input : "Hidden",
      expected: isPublic ? tests[i].expected : "Hidden",
      output: isPublic
        ? (data.stdout ?? data.compile_output ?? "No Output").trim()
        : passed
          ? "Hidden"
          : "Wrong Answer/Error",
    };
  });

  return new Response(
    JSON.stringify({ passedCount, total: tests.length, results }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
