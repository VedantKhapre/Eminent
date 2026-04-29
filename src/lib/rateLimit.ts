const USER_LIMIT = 20;
const WINDOW_MS = 60_000;

const userRequests = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = userRequests.get(userId);

  if (!entry || now > entry.resetAt) {
    userRequests.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= USER_LIMIT) return true;

  entry.count++;
  return false;
}