/**
 * @fileoverview Leaver plugin - batch leave Discord servers with rate limit protection
 */

import { createQueue, type Queue, type QueueItem } from "./queue.js";

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
  const store = shelter.flux.stores.GuildStore as unknown as {
    getGuilds: () => Record<
      string,
      { id: string; name: string; icon: string | null; ownerId: string }
    >;
  };
  const rawGuilds = store.getGuilds();
  return Object.values(rawGuilds).map((g) => ({
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
  await shelter.http.ready;
  await shelter.http.del(`/users/@me/guilds/${guildId}`, {
    body: JSON.stringify({ lurking: false }),
  });
}

/** Leaver queue item data */
export interface LeaverQueueItem {
  id: string;
  name: string;
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
