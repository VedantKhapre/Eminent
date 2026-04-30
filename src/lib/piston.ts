const PISTON_URL = import.meta.env.PISTON_URL;
const PISTON_SECRET = import.meta.env.PISTON_SECRET;

export async function execute(
  language: string,
  version: string,
  source_code: string,
  stdin: string,
) {
  if (!PISTON_URL || !PISTON_SECRET) throw new Error("EXECUTOR_NOT_CONFIGURED");

  const res = await fetch(`${PISTON_URL}/api/v2/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-piston-secret": PISTON_SECRET,
    },
    body: JSON.stringify({
      language,
      version,
      files: [{ content: source_code }],
      stdin,
      run_timeout: 3000,
      compile_timeout: 10000,
    }),
  });

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) {
      console.error(`Piston error: status=${res.status} requestId=${res.headers.get("x-request-id") ?? "unknown"}`);
      throw new Error("EXECUTOR_ERROR");
    }

  return res.json();
}
