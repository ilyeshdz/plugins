import type { Plugin } from "./plugins.js";
import type { RemoteTheme } from "./themes.js";

export type PluginStatusFilter = "all" | "enabled" | "disabled" | "installed";
export type ThemeStatusFilter = "all" | "installed";

function includesQuery(value: string | undefined, query: string): boolean {
  return value?.toLowerCase().includes(query) ?? false;
}

export function filterPluginList(
  plugins: Plugin[],
  search: string,
  status: PluginStatusFilter,
): Plugin[] {
  const query = search.trim().toLowerCase();

  return plugins.filter((plugin) => {
    if (status === "enabled" && !(plugin.installed && plugin.enabled)) {
      return false;
    }
    if (status === "disabled" && !(plugin.installed && !plugin.enabled)) {
      return false;
    }
    if (status === "installed" && !plugin.installed) {
      return false;
    }
    if (!query) return true;

    return (
      includesQuery(plugin.name, query) ||
      includesQuery(plugin.description, query) ||
      includesQuery(plugin.author, query)
    );
  });
}

export function filterThemeList(
  themes: (RemoteTheme & { installed: boolean })[],
  search: string,
  status: ThemeStatusFilter,
): (RemoteTheme & { installed: boolean })[] {
  const query = search.trim().toLowerCase();

  return themes.filter((theme) => {
    if (status === "installed" && !theme.installed) return false;
    if (!query) return true;

    return (
      includesQuery(theme.name, query) ||
      includesQuery(theme.description, query) ||
      includesQuery(theme.author?.discord_name, query)
    );
  });
}
