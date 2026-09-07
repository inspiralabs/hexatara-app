import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ADR-008: di balik feature flag. Kalau nonaktif, Redis/Ratelimit TIDAK PERNAH
// dibuat — bukan cuma dilewati di titik pemanggilan — supaya UPSTASH_REDIS_REST_URL
// dan _TOKEN tidak perlu ada sama sekali selama Hexatara belum menyetujui fitur ini.
const enabled = process.env.RATE_LIMIT_VERIFY_ENABLED === 'true';

const ratelimit = enabled
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'ratelimit:verify',
    })
  : null;

// true = boleh lanjut, false = kena limit. IP kosong (mis. dev lokal tanpa
// x-forwarded-for) tetap diberi identifier tetap, bukan dilewatkan bebas.
export async function cekRateLimitVerify(ip: string): Promise<boolean> {
  if (!ratelimit) return true;
  const { success } = await ratelimit.limit(ip || 'unknown');
  return success;
}
