export function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function truncate(str: string, max = 10_000) {
  return str.slice(0, max).trim();
}