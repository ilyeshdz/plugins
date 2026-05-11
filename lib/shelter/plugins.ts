export interface ShelterPluginRecord {
  on: boolean;
  manifest?: {
    name?: string;
    author?: string;
  };
}

export interface ShelterPluginIdentity {
  name: string;
  author: string;
}

export function getInstalledPlugins(): Record<string, ShelterPluginRecord> {
  return shelter.plugins.installedPlugins();
}

export function findInstalledPlugin(
  plugin: ShelterPluginIdentity,
): [string, ShelterPluginRecord] | undefined {
  return Object.entries(getInstalledPlugins()).find(
    ([, installed]) =>
      installed.manifest?.name === plugin.name &&
      installed.manifest?.author === plugin.author,
  );
}

export function getInstalledPluginId(
  plugin: ShelterPluginIdentity,
): string | undefined {
  return findInstalledPlugin(plugin)?.[0];
}

export function addRemotePlugin(name: string, url: string): Promise<void> {
  return shelter.plugins.addRemotePlugin(name, url, true);
}

export function removePlugin(id: string): void {
  shelter.plugins.removePlugin(id);
}

export function startPlugin(id: string): void {
  shelter.plugins.startPlugin(id);
}

export function stopPlugin(id: string): void {
  shelter.plugins.stopPlugin(id);
}

export function updateStoredPlugin(
  id: string,
  plugin: ShelterPluginRecord,
): void {
  shelter.plugins.editPlugin(id, plugin as never);
}

export function hasSettings(id: string): boolean {
  return !!shelter.plugins.getSettings(id);
}

export function showSettings(id: string): void {
  shelter.plugins.showSettingsFor(id);
}
