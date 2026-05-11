/**
 * @fileoverview Themes API - browse, install, and manage CSS themes
 */

const THEMES_SOURCE = "https://themes.equicord.org/api/themes";

const makeThemeId = (name: string) =>
  `theme-${name.replace(/[^a-zA-Z0-9]/g, "-")}`;

export interface RemoteTheme {
  id: number;
  name: string;
  type: string;
  description: string;
  author: {
    discord_snowflake: string;
    discord_name: string;
    github_name: string;
  };
  tags: string[];
  thumbnail_url: string;
  release_date: string;
  guild: {
    name: string;
    snowflake: string;
    invite_link: string;
    avatar_hash: string;
  } | null;
  content: string;
  source: string;
  likes: number;
  downloads: number;
}

export interface InstalledTheme {
  name: string;
  author: string;
  source: string;
  css: string;
}

/** Get all installed themes from store */
export function getStoredThemes(): InstalledTheme[] {
  return shelter.plugin.store.themes || [];
}

function saveStoredThemes(themes: InstalledTheme[]): void {
  shelter.plugin.store.themes = themes;
}

/** Get currently active theme name */
export function getActiveTheme(): string | null {
  return shelter.plugin.store.activeTheme || null;
}

/**
 * Set the active theme
 * @param name - Theme name to activate, or null for default Discord theme
 */
export function setActiveTheme(name: string | null): void {
  const prev = getActiveTheme();
  if (prev && prev !== name) {
    uninjectThemeCss(prev);
  }

  if (name === null) {
    shelter.plugin.store.activeTheme = null;
    return;
  }

  const theme = getStoredThemes().find((t) => t.name === name);
  if (theme) {
    injectThemeCss(theme);
    shelter.plugin.store.activeTheme = name;
  }
}

/**
 * Check if a remote theme is already installed
 * @param theme - Theme to check
 */
export function isThemeInstalled(theme: RemoteTheme): boolean {
  return getStoredThemes().some(
    (t) =>
      t.name === theme.name &&
      t.author.toLowerCase() ===
        (theme.author?.discord_name ?? "").toLowerCase(),
  );
}

function injectThemeCss(theme: InstalledTheme): string {
  const id = makeThemeId(theme.name);
  let style = document.getElementById(id) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }

  style.textContent = theme.css;
  return id;
}

function uninjectThemeCss(name: string): void {
  const style = document.getElementById(makeThemeId(name));
  style?.remove();
}

/**
 * Fetch all themes from the registry
 * @returns Array of themes with installed status
 */
export async function fetchThemes(): Promise<
  (RemoteTheme & { installed: boolean })[]
> {
  try {
    const response = await fetch(THEMES_SOURCE, {
      headers: {
        Accept: "*/*",
        Referer: "https://themes.equicord.org/",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch themes");
    const remoteThemes: RemoteTheme[] = await response.json();

    return remoteThemes.map((theme) => ({
      ...theme,
      installed: isThemeInstalled(theme),
    }));
  } catch (e) {
    console.warn("Failed to fetch themes:", e);
    return [];
  }
}

/** Filter themes (currently just fetches all) */
export async function filterThemes(): Promise<
  (RemoteTheme & { installed: boolean })[]
> {
  return fetchThemes();
}

/**
 * Install a theme
 * @param theme - Theme to install
 */
export async function installTheme(theme: RemoteTheme): Promise<void> {
  if (isThemeInstalled(theme)) return;

  const css =
    typeof atob === "function"
      ? atob(theme.content)
      : Buffer.from(theme.content, "base64").toString("utf-8");

  const installedTheme: InstalledTheme = {
    name: theme.name,
    author: theme.author?.discord_name || "Unknown",
    source: theme.source,
    css,
  };

  const themes = getStoredThemes();
  themes.push(installedTheme);
  saveStoredThemes(themes);

  if (!getActiveTheme()) {
    injectThemeCss(installedTheme);
    shelter.plugin.store.activeTheme = installedTheme.name;
  }
}

/**
 * Uninstall a theme
 * @param theme - Theme to uninstall
 */
export async function uninstallTheme(theme: RemoteTheme): Promise<void> {
  await removeStoredTheme(theme.name);
}

/**
 * Remove a theme from storage by name
 * @param name - Theme name to remove
 */
export async function removeStoredTheme(name: string): Promise<void> {
  const themes = getStoredThemes();
  const index = themes.findIndex((t) => t.name === name);
  if (index === -1) return;

  const removed = themes[index];
  uninjectThemeCss(removed.name);
  themes.splice(index, 1);
  saveStoredThemes(themes);

  if (getActiveTheme() !== removed.name) return;

  const next = themes[0];
  if (next) {
    injectThemeCss(next);
    shelter.plugin.store.activeTheme = next.name;
  } else {
    shelter.plugin.store.activeTheme = null;
  }
}

/** Load active theme CSS into document on plugin load */
export function loadInstalledThemes(): void {
  const active = getActiveTheme();
  if (!active) return;

  const theme = getStoredThemes().find((t) => t.name === active);
  if (theme) injectThemeCss(theme);
}

/** Remove all theme CSS from document on plugin unload */
export function unloadInstalledThemes(): void {
  for (const theme of getStoredThemes()) {
    uninjectThemeCss(theme.name);
  }
}
