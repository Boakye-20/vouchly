// Simple in-memory rate limiter for Next.js API routes
// For production, use a distributed store (e.g., Redis)

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

const ipRequestMap = new Map<string, { count: number; lastRequest: number }>();

export function rateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = ipRequestMap.get(ip);

    if (!entry || now - entry.lastRequest > RATE_LIMIT_WINDOW_MS) {
        ipRequestMap.set(ip, { count: 1, lastRequest: now });
        return { allowed: true };
    }

    if (entry.count < MAX_REQUESTS_PER_WINDOW) {
        entry.count++;
        entry.lastRequest = now;
        ipRequestMap.set(ip, entry);
        return { allowed: true };
    }

    // Rate limit exceeded
    return {
        allowed: false,
        retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.lastRequest)) / 1000)
    };
} 