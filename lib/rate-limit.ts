/**
 * @fileoverview Rate-limit detection for Discord HTTP rejections.
 *
 * Discord signals rate limits with HTTP 429 plus a `retry_after` (in
 * seconds, possibly fractional) in the response body. `shelter.http`
 * forwards Discord's native http module, which rejects with the whole
 * response object — so we normalise that here into a typed error the
 * queue can wait on.
 */

/** Upper bound on waiting out a single rate limit, in ms. */
export const MAX_RETRY_AFTER_MS = 60_000;

/** Thrown when Discord rate-limits a request, carrying how long to wait. */
export class RateLimitError extends Error {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number, message = "Rate limited by Discord") {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

interface DiscordRateLimitBody {
  retry_after?: number;
  global?: boolean;
}

/** Pull `retry_after` (seconds) off a raw rejection, if present. */
export function extractRetryAfterMs(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined;

  // Discord may nest it under `body` (usual) or surface it flat.
  const candidates: unknown[] = [
    (err as { body?: DiscordRateLimitBody }).body,
    err,
  ];

  for (const candidate of candidates) {
    const retryAfter = (candidate as DiscordRateLimitBody | undefined)
      ?.retry_after;
    if (
      typeof retryAfter === "number" &&
      Number.isFinite(retryAfter) &&
      retryAfter >= 0
    ) {
      return retryAfter * 1000;
    }
  }

  return undefined;
}

/** True when a rejection represents a Discord rate limit (HTTP 429). */
export function isRateLimit(err: unknown): boolean {
  if (err instanceof RateLimitError) return true;
  if (typeof err !== "object" || err === null) return false;
  return (err as { status?: number }).status === 429;
}
