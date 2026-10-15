import {
  extractRetryAfterMs,
  isRateLimit,
  RateLimitError,
} from "../rate-limit.js";

/** Turn a rate-limit signal into a RateLimitError carrying retry_after. */
function toRateLimitError(source: unknown): RateLimitError {
  const retryAfterMs =
    extractRetryAfterMs(source) ??
    // some rejections nest the payload under `body`
    extractRetryAfterMs((source as { body?: unknown })?.body) ??
    0;
  return new RateLimitError(retryAfterMs);
}

export async function leaveGuild(guildId: string): Promise<void> {
  await shelter.http.ready;

  try {
    const res = await shelter.http.del?.({
      url: `/users/@me/guilds/${guildId}`,
      body: JSON.stringify({ lurking: false }),
      oldFormErrors: false,
    });

    // Discord usually rejects on a 429, but don't rely on that alone —
    // also inspect a resolved response for a rate-limit status.
    if (res && !res.ok && res.status === 429) {
      throw toRateLimitError(res.body ?? res);
    }
  } catch (err) {
    // already normalised above — don't re-wrap and lose retry_after
    if (err instanceof RateLimitError) throw err;
    if (isRateLimit(err)) throw toRateLimitError(err);
    throw err;
  }
}
