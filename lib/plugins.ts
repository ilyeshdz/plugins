/**
 * @fileoverview Plugin API - fetch, install, uninstall, and manage remote plugins
 */

import {
  addRemotePlugin,
  findInstalledPlugin,
  getInstalledPluginId,
  getInstalledPlugins,
  hasSettings,
  removePlugin,
  showSettings,
  startPlugin,
  stopPlugin,
  updateStoredPlugin,
} from "./shelter/plugins.js";

const PLUGINS_SOURCE = "https://shindex.uwu.network/data";

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

/** Plugin with computed installed/enabled status */
export interface Plugin extends RemotePlugin {
  enabled: boolean;
  installed: boolean;
}

function isPluginInstalled(plugin: RemotePlugin): boolean {
  return !!findInstalledPlugin(plugin);
}

function isPluginEnabled(plugin: RemotePlugin): boolean {
  const entry = findInstalledPlugin(plugin);
  return entry?.[1].on ?? false;
}

function getPluginId(plugin: RemotePlugin): string | undefined {
  return getInstalledPluginId(plugin);
}

/**
 * Fetch all plugins from the registry
 * @returns Array of Plugin objects with installed/enabled status
 */
export async function fetchPlugins(): Promise<Plugin[]> {
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
}

export type FilterOptions = {
  search?: string;
  status?: "all" | "enabled" | "disabled" | "installed";
};

/**
 * Filter plugins by search query and status
 * @param options - Filter criteria
 * @returns Filtered array of plugins
 */
export async function filterPlugins(options: FilterOptions): Promise<Plugin[]> {
  let plugins = await fetchPlugins();

  if (options.search) {
    const lowerQuery = options.search.toLowerCase();
    plugins = plugins.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.author.toLowerCase().includes(lowerQuery),
    );
  }

  switch (options.status) {
    case "enabled":
      plugins = plugins.filter((p) => p.installed && p.enabled);
      break;
    case "disabled":
      plugins = plugins.filter((p) => p.installed && !p.enabled);
      break;
    case "installed":
      plugins = plugins.filter((p) => p.installed);
      break;
  }

  return plugins;
}

/**
 * Install a remote plugin
 * @param plugin - Plugin to install
 */
export async function installPlugin(plugin: RemotePlugin): Promise<void> {
  await addRemotePlugin(plugin.name, plugin.url);
}

/**
 * Uninstall an installed plugin
 * @param plugin - Plugin to uninstall
 */
export async function uninstallPlugin(plugin: RemotePlugin): Promise<void> {
  const id = getPluginId(plugin);
  if (id) {
    removePlugin(id);
  }
}

/**
 * Toggle plugin enabled state
 * @param plugin - Plugin to toggle
 */
export async function togglePlugin(plugin: RemotePlugin): Promise<void> {
  const id = getPluginId(plugin);
  if (!id) return;

  const installed = getInstalledPlugins()[id];
  if (!installed) return;

  if (installed.on) {
    stopPlugin(id);
  } else {
    startPlugin(id);
  }

  updateStoredPlugin(id, { ...installed, on: !installed.on });
}

/**
 * Check if a plugin has settings
 * @param plugin - Plugin to check
 */
export function hasPluginSettings(plugin: RemotePlugin): boolean {
  const id = getPluginId(plugin);
  if (!id) return false;
  return hasSettings(id);
}

/**
 * Open plugin settings dialog
 * @param plugin - Plugin whose settings to open
 */
export function showPluginSettings(plugin: RemotePlugin): void {
  const id = getPluginId(plugin);
  if (!id) return;
  showSettings(id);
}
