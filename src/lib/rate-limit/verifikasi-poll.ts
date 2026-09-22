import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

// Polling verifikasi ~1x/3s; 30/mnt per IP longgar untuk device sah, ketat untuk hammer.
// Pakai Upstash kalau kredensial ada; kalau tidak, fallback in-memory (dev / tanpa Redis).

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const upstashLimit = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'ratelimit:verifikasi-poll',
    })
  : null;

const memoryHits = new Map<string, number[]>();

function cekMemory(id: string, max = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const prev = (memoryHits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (prev.length >= max) {
    memoryHits.set(id, prev);
    return false;
  }
  prev.push(now);
  memoryHits.set(id, prev);
  return true;
}

export async function cekRateLimitVerifikasiPoll(): Promise<boolean> {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip')?.trim() ||
    'unknown';

  if (upstashLimit) {
    const { success } = await upstashLimit.limit(ip);
    return success;
  }
  return cekMemory(ip);
}
