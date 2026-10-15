/**
 * @fileoverview Leaver plugin - batch leave Discord servers with rate limit protection
 */

import { createQueue, type Queue, type QueueItem } from "./queue.js";
import { MAX_RETRY_AFTER_MS, RateLimitError } from "./rate-limit.js";
import {
  getGuilds as getShelterGuilds,
  type ShelterGuild,
} from "./shelter/guilds.js";
import { leaveGuild as leaveShelterGuild } from "./shelter/http.js";

const {
  ui: { showToast, ToastColors },
} = shelter;

/** Guild data structure */
export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  ownerId: string;
}

/**
 * Get all guilds the current user is in
 * @returns Array of Guild objects
 */
export function getGuilds(): Guild[] {
  return getShelterGuilds().map((g: ShelterGuild) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    ownerId: g.ownerId,
  }));
}

/**
 * Leave a specific guild by ID
 * @param guildId - The Discord guild ID to leave
 */
export async function leaveGuild(guildId: string): Promise<void> {
  await leaveShelterGuild(guildId);
}

/** Leaver queue item data */
export interface LeaverQueueItem {
  id: string;
  name: string;
}

/** How many server names to show in the confirmation modal before summarizing. */
export const MAX_CONFIRM_NAMES = 8;

/**
 * Format a server-name list for the confirmation modal, truncating long
 * lists so the modal stays readable.
 * @param names - Selected server names
 * @param max - How many names to show before summarizing the rest
 */
export function formatGuildNames(
  names: string[],
  max: number = MAX_CONFIRM_NAMES,
): string {
  if (names.length <= max) return names.join(", ");
  const shown = names.slice(0, max).join(", ");
  const remaining = names.length - max;
  return `${shown} and ${remaining} more`;
}

/**
 * Create a queue for leaving servers with automatic error handling
 * @param delayMs - Delay between leaving servers (default: 5000ms)
 * @returns Queue instance configured for leaving servers
 */
export function createLeaverQueue(
  delayMs: number = 5000,
  onComplete?: () => void | Promise<void>,
): Queue<LeaverQueueItem> {
  return createQueue({
    delayMs,
    maxRetries: 3,
    async onProcess(item: QueueItem<LeaverQueueItem>) {
      await leaveGuild(item.data.id);
    },
    // Discord's leave endpoint rate limit is measured in minutes, not
    // seconds — so when it tells us how long to wait, wait that long
    // instead of burning the retry on a short linear backoff.
    getRetryDelayMs(error, attempt) {
      if (error instanceof RateLimitError) {
        return Math.min(
          error.retryAfterMs || MAX_RETRY_AFTER_MS,
          MAX_RETRY_AFTER_MS,
        );
      }
      return 1000 * attempt;
    },
    onError(item, error) {
      showToast({
        title: `Failed to leave ${item.data.name}`,
        content: error.message,
        color: ToastColors.CRITICAL,
        duration: 5000,
      });
    },
    onComplete,
  });
}
