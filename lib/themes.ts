const THEMES_SOURCE = "https://themes.equicord.org/api/themes";

const makeThemeId = (name: string) => `theme-${name.replace(/[^a-zA-Z0-9]/g, "-")}`;

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

export function getStoredThemes(): InstalledTheme[] {
    return shelter.plugin.store.themes || [];
}

function saveStoredThemes(themes: InstalledTheme[]): void {
    shelter.plugin.store.themes = themes;
}

export function getActiveTheme(): string | null {
    return shelter.plugin.store.activeTheme || null;
}

export function setActiveTheme(name: string | null): void {
    const prev = getActiveTheme();
    if (prev && prev !== name) {
        uninjectThemeCss(prev);
    }

    if (name === null) {
        shelter.plugin.store.activeTheme = null;
        return;
    }

    const theme = getStoredThemes().find(t => t.name === name);
    if (theme) {
        injectThemeCss(theme);
        shelter.plugin.store.activeTheme = name;
    }
}

export function isThemeInstalled(theme: RemoteTheme): boolean {
    return getStoredThemes().some(
        t => t.name === theme.name &&
            t.author.toLowerCase() === (theme.author?.discord_name ?? "").toLowerCase()
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

export async function fetchThemes(): Promise<(RemoteTheme & { installed: boolean })[]> {
    try {
        const response = await fetch(THEMES_SOURCE, {
            headers: {
                "Accept": "*/*",
                "Referer": "https://themes.equicord.org/",
            },
        });
        if (!response.ok) throw new Error("Failed to fetch themes");
        const remoteThemes: RemoteTheme[] = await response.json();

        return remoteThemes.map(theme => ({
            ...theme,
            installed: isThemeInstalled(theme),
        }));
    } catch (e) {
        console.warn("Failed to fetch themes:", e);
        return [];
    }
}

export async function filterThemes(): Promise<(RemoteTheme & { installed: boolean })[]> {
    return fetchThemes();
}

export async function installTheme(theme: RemoteTheme): Promise<void> {
    if (isThemeInstalled(theme)) return;

    const css = atob(theme.content);

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
        const id = injectThemeCss(installedTheme);
        (installedTheme as any).injectedId = id;
        shelter.plugin.store.activeTheme = installedTheme.name;
    }
}

export async function uninstallTheme(theme: RemoteTheme): Promise<void> {
    await removeStoredTheme(theme.name);
}

export async function removeStoredTheme(name: string): Promise<void> {
    const themes = getStoredThemes();
    const index = themes.findIndex(t => t.name === name);
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

export function loadInstalledThemes(): void {
    const active = getActiveTheme();
    if (!active) return;

    const theme = getStoredThemes().find(t => t.name === active);
    if (theme) injectThemeCss(theme);
}

export function unloadInstalledThemes(): void {
    for (const theme of getStoredThemes()) {
        uninjectThemeCss(theme.name);
    }
}