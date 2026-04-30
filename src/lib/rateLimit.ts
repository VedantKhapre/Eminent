const USER_LIMIT = 7;
const WINDOW_MS = 60_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const userRequests = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of userRequests) {
    if (now > entry.resetAt) {
      userRequests.delete(userId);
    }
  }
}, 60_000);

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