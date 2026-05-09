export interface Plugin {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    tags: string[];
    hasSettings: boolean;
    enabled: boolean;
    installed: boolean;
    downloads: number;
    rating: number;
}

export interface Tag {
    id: string;
    name: string;
    description: string;
    count: number;
}

const mockPlugins: Plugin[] = [
    {
        id: "account-panel",
        name: "AccountPanelServer",
        description: "Right click your account panel in the bottom left to view your profile in the current server",
        version: "1.2.0",
        author: "Qwerty",
        tags: ["utility", "profile"],
        hasSettings: true,
        enabled: true,
        installed: true,
        downloads: 15420,
        rating: 4.5
    },
    {
        id: "always-animate",
        name: "AlwaysAnimate",
        description: "Animates anything that can be animated",
        version: "2.1.0",
        author: "DevTeam",
        tags: ["appearance", "fun"],
        hasSettings: false,
        enabled: false,
        installed: true,
        downloads: 8932,
        rating: 4.2
    },
    {
        id: "always-expand",
        name: "AlwaysExpandRoles",
        description: "Always expands the role list in profile popouts",
        version: "1.0.3",
        author: "ModTools",
        tags: ["utility", "ui"],
        hasSettings: false,
        enabled: false,
        installed: false,
        downloads: 3210,
        rating: 3.8
    },
    {
        id: "always-trust",
        name: "AlwaysTrust",
        description: "Removes the annoying untrusted domain and suspicious file popup",
        version: "3.0.1",
        author: "SecurityFix",
        tags: ["utility", "security"],
        hasSettings: true,
        enabled: false,
        installed: false,
        downloads: 28450,
        rating: 4.8
    },
    {
        id: "better-emojis",
        name: "BetterEmojis",
        description: "Display emojis in high quality across all channels",
        version: "1.5.2",
        author: "EmojiMaster",
        tags: ["appearance", "ui"],
        hasSettings: true,
        enabled: true,
        installed: true,
        downloads: 45120,
        rating: 4.6
    },
    {
        id: "clone-tags",
        name: "CloneTags",
        description: "Clone role tags to multiple roles at once",
        version: "0.9.0",
        author: "RoleTools",
        tags: ["utility", "moderation"],
        hasSettings: false,
        enabled: false,
        installed: false,
        downloads: 1280,
        rating: 3.5
    }
];

const mockTags: Tag[] = [
    { id: "all", name: "All", description: "All plugins", count: 6 },
    { id: "utility", name: "Utility", description: "General utility plugins", count: 4 },
    { id: "appearance", name: "Appearance", description: "UI/Theme plugins", count: 2 },
    { id: "moderation", name: "Moderation", description: "Mod tools", count: 1 },
    { id: "security", name: "Security", description: "Security plugins", count: 1 }
];

export async function fetchPlugins(): Promise<Plugin[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockPlugins];
}

export async function fetchPlugin(id: string): Promise<Plugin | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockPlugins.find(p => p.id === id) || null;
}

export async function fetchTags(): Promise<Tag[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...mockTags];
}

export async function searchPlugins(query: string): Promise<Plugin[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const lowerQuery = query.toLowerCase();
    return mockPlugins.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
}

export async function filterPlugins(options: {
    search?: string;
    tag?: string;
    status?: "all" | "enabled" | "disabled" | "installed";
}): Promise<Plugin[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    let results = [...mockPlugins];

    if (options.search) {
        const lowerQuery = options.search.toLowerCase();
        results = results.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery)
        );
    }

    if (options.tag && options.tag !== "all") {
        results = results.filter(p => p.tags.includes(options.tag!));
    }

    switch (options.status) {
        case "enabled":
            results = results.filter(p => p.enabled);
            break;
        case "disabled":
            results = results.filter(p => !p.enabled);
            break;
        case "installed":
            results = results.filter(p => p.installed);
            break;
    }

    return results;
}

export async function togglePlugin(id: string): Promise<Plugin | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const plugin = mockPlugins.find(p => p.id === id);
    if (plugin) {
        plugin.enabled = !plugin.enabled;
        return { ...plugin };
    }
    return null;
}

export async function installPlugin(id: string): Promise<Plugin | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const plugin = mockPlugins.find(p => p.id === id);
    if (plugin) {
        plugin.installed = true;
        plugin.enabled = true;
        return { ...plugin };
    }
    return null;
}

export async function uninstallPlugin(id: string): Promise<Plugin | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const plugin = mockPlugins.find(p => p.id === id);
    if (plugin) {
        plugin.installed = false;
        plugin.enabled = false;
        return { ...plugin };
    }
    return null;
}