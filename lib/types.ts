export interface RawGuild {
  id: string;
  joinedAt: string;
  name: string;
  description: string | null;
  icon: string | null;
  splash: string | null;
  banner: string | null;
  preferredLocale: string;
  ownerId: string;
  application_id: string | null;
  afkChannelId: string | null;
  afkTimeout: number;
  systemChannelId: string | null;
  verificationLevel: number;
  explicitContentFilter: number;
  defaultMessageNotifications: number;
  mfaLevel: number;
  vanityURLCode: string | null;
  premiumTier: number;
  premiumProgressBarEnabled: boolean;
  systemChannelFlags: number;
  discoverySplash: string | null;
  rulesChannelId: string | null;
  safetyAlertsChannelId: string | null;
  publicUpdatesChannelId: string | null;
  maxStageVideoChannelUsers: number;
  maxVideoChannelUsers: number;
  maxMembers: number;
  nsfwLevel: number;
  hubType: string | null;
  features: string[];
}

export type GuildStore = {
  getGuilds(): Record<string, RawGuild>;
};
