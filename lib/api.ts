const DEFAULT_SOURCE = "https://shindex.uwu.network/data";

export interface PluginSource {
    url: string;
    enabled: boolean;
    name: string;
}

export function getSources(): PluginSource[] {
    const stored = shelter.plugin.store.sources;
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
        return [{ url: DEFAULT_SOURCE, enabled: true, name: "Shindex" }];
    }
    return stored;
}

export function getEnabledSources(): string[] {
    const sources = getSources();
    return sources.filter(s => s.enabled).map(s => s.url);
}

export function addSource(source: PluginSource): void {
    const current = getSources();
    current.push(source);
    shelter.plugin.store.sources = current;
}

export function removeSource(url: string): void {
    const current = getSources().filter(s => s.url !== url);
    shelter.plugin.store.sources = current;
}

export function updateSource(url: string, updates: Partial<PluginSource>): void {
    const current = getSources();
    const index = current.findIndex(s => s.url === url);
    if (index !== -1) {
        current[index] = { ...current[index], ...updates };
        shelter.plugin.store.sources = current;
    }
}

function getInstalledPlugins() {
    return shelter?.plugins?.installedPlugins?.() || {};
}

export interface RemotePlugin {
    name: string;
    author: string;
    description: string;
    url: string;
    version?: string;
    hash?: string;
    main?: string;
    entrypoint?: string;
    site?: {
        longDescription?: string;
        demoImage?: string;
        warnings?: string[];
        infos?: string[];
        pinned?: boolean;
        ignored?: boolean;
    };
}

export interface PluginRepo {
    name: string;
    url: string;
    plugins: RemotePlugin[];
}

export interface Plugin extends RemotePlugin {
    enabled: boolean;
    installed: boolean;
}

function isPluginInstalled(plugin: RemotePlugin): boolean {
    return Object.values(getInstalledPlugins()).some(
        (p: any) => p.manifest?.name === plugin.name && p.manifest?.author === plugin.author
    );
}

function isPluginEnabled(plugin: RemotePlugin): boolean {
    const entry = Object.entries(getInstalledPlugins()).find(
        ([, p]: [string, any]) => p.manifest?.name === plugin.name && p.manifest?.author === plugin.author
    );
    return entry ? entry[1].on : false;
}

function getPluginId(plugin: RemotePlugin): string | undefined {
    const entry = Object.entries(getInstalledPlugins()).find(
        ([, p]: [string, any]) => p.manifest?.name === plugin.name && p.manifest?.author === plugin.author
    );
    return entry ? entry[0] : undefined;
}

export async function fetchPlugins(): Promise<Plugin[]> {
    const sources = getEnabledSources();
    const plugins: Plugin[] = [];

    for (const sourceUrl of sources) {
        try {
            const response = await fetch(sourceUrl);
            if (!response.ok) continue;
            const repos: PluginRepo[] = await response.json();

            for (const repo of repos) {
                for (const plugin of repo.plugins) {
                    plugins.push({
                        ...plugin,
                        enabled: isPluginEnabled(plugin),
                        installed: isPluginInstalled(plugin),
                    });
                }
            }
        } catch (e) {
            console.warn(`Failed to fetch from ${sourceUrl}:`, e);
        }
    }

    return plugins;
}

export type FilterOptions = {
    search?: string;
    status?: "all" | "enabled" | "disabled" | "installed";
};

export async function filterPlugins(options: FilterOptions): Promise<Plugin[]> {
    let plugins = await fetchPlugins();

    if (options.search) {
        const lowerQuery = options.search.toLowerCase();
        plugins = plugins.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.author.toLowerCase().includes(lowerQuery)
        );
    }

    switch (options.status) {
        case "enabled":
            plugins = plugins.filter(p => p.installed && p.enabled);
            break;
        case "disabled":
            plugins = plugins.filter(p => p.installed && !p.enabled);
            break;
        case "installed":
            plugins = plugins.filter(p => p.installed);
            break;
    }

    return plugins;
}

export async function installPlugin(plugin: RemotePlugin): Promise<void> {
    await shelter.plugins.addRemotePlugin(plugin.name, plugin.url, true);
}

export async function uninstallPlugin(plugin: RemotePlugin): Promise<void> {
    const id = getPluginId(plugin);
    if (id) {
        shelter.plugins.removePlugin(id);
    }
}

export async function togglePlugin(plugin: RemotePlugin): Promise<void> {
    const id = getPluginId(plugin);
    if (!id) return;

    const installed = getInstalledPlugins()[id];
    if (!installed) return;

    if (installed.on) {
        shelter.plugins.stopPlugin(id);
    } else {
        shelter.plugins.startPlugin(id);
    }

    shelter.plugins.editPlugin(id, { ...installed, on: !installed.on });
}

export function hasPluginSettings(plugin: RemotePlugin): boolean {
    const id = getPluginId(plugin);
    if (!id) return false;
    return !!shelter.plugins.getSettings(id);
}

export function showPluginSettings(plugin: RemotePlugin): void {
    const id = getPluginId(plugin);
    if (!id) return;
    shelter.plugins.showSettingsFor(id);
}