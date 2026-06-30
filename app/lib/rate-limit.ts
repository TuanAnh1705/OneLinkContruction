import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Per-IP sliding window: 5 requests / minute for the contact form (same as VNS).
// Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. When those env vars
// are absent (e.g. local dev) we skip rate limiting instead of crashing the form.
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

export const contactRateLimit = hasUpstash
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'rl:contact',
    })
  : null

export function getClientIP(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()

  const xri = req.headers.get('x-real-ip')
  if (xri) return xri.trim()

  return '127.0.0.1'
}

export function rateLimitResponse(limit: number, remaining: number, reset: number): Response {
  const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000))

  // `error` matches the shape the contact form reads (data.error).
  return new Response(
    JSON.stringify({ ok: false, error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(retryAfterSeconds),
      },
    }
  )
}
