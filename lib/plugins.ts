const PLUGINS_SOURCE = "https://shindex.uwu.network/data";

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

function findInstalled(plugin: RemotePlugin): [string, any] | undefined {
    return Object.entries(getInstalledPlugins()).find(
        ([, p]: [string, any]) => p.manifest?.name === plugin.name && p.manifest?.author === plugin.author
    );
}

function isPluginInstalled(plugin: RemotePlugin): boolean {
    return !!findInstalled(plugin);
}

function isPluginEnabled(plugin: RemotePlugin): boolean {
    const entry = findInstalled(plugin);
    return entry?.[1].on ?? false;
}

function getPluginId(plugin: RemotePlugin): string | undefined {
    return findInstalled(plugin)?.[0];
}

export async function fetchPlugins(): Promise<Plugin[]> {
    try {
        const response = await fetch(PLUGINS_SOURCE);
        if (!response.ok) throw new Error("Failed to fetch plugins");
        const repos: PluginRepo[] = await response.json();

        const plugins: Plugin[] = [];
        for (const repo of repos) {
            for (const plugin of repo.plugins) {
                plugins.push({
                    ...plugin,
                    enabled: isPluginEnabled(plugin),
                    installed: isPluginInstalled(plugin),
                });
            }
        }
        return plugins;
    } catch (e) {
        console.warn("Failed to fetch plugins:", e);
        return [];
    }
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
    const src = plugin.url.endsWith("/") ? `${plugin.url}plugin.js` : `${plugin.url}/plugin.js`;
    await shelter.plugins.addRemotePlugin(plugin.name, src, true);
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