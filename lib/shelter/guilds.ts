import type { FluxStore } from "@uwu/shelter-defs";

export interface ShelterGuild {
  id: string;
  name: string;
  icon: string | null;
  ownerId: string;
}

interface GuildStore {
  getGuilds(): Record<string, ShelterGuild>;
}

interface UserStore {
  getCurrentUser(): { id: string };
}

function getStore<T>(name: string): FluxStore<T> {
  return shelter.flux.stores[name] as FluxStore<T>;
}

export function getGuilds(): ShelterGuild[] {
  return Object.values(getStore<GuildStore>("GuildStore").getGuilds());
}

export function getCurrentUserId(): string {
  return getStore<UserStore>("UserStore").getCurrentUser().id;
}
