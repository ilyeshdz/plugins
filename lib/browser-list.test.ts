import { describe, expect, it } from "vitest";

import { filterPluginList, filterThemeList } from "./browser-list.js";
import type { Plugin } from "./plugins.js";
import type { RemoteTheme } from "./themes.js";

function makePlugin(overrides: Partial<Plugin>): Plugin {
  return {
    name: "Example",
    author: "someone",
    description: "an example plugin",
    url: "https://example.com/plugin.json",
    installed: false,
    enabled: false,
    ...overrides,
  };
}

function makeTheme(
  overrides: Partial<RemoteTheme> & { installed: boolean },
): RemoteTheme & { installed: boolean } {
  return {
    id: 1,
    name: "Example Theme",
    type: "theme",
    description: "an example theme",
    author: {
      discord_snowflake: "123",
      discord_name: "someone",
      github_name: "someone",
    },
    tags: [],
    thumbnail_url: "",
    release_date: "2024-01-01",
    guild: null,
    content: "",
    source: "",
    likes: 0,
    downloads: 0,
    ...overrides,
  };
}

describe("filterPluginList", () => {
  const plugins: Plugin[] = [
    makePlugin({ name: "Better Search", installed: true, enabled: true }),
    makePlugin({ name: "Worse Search", installed: true, enabled: false }),
    makePlugin({ name: "Not Installed" }),
  ];

  it("returns everything when status is all and query is empty", () => {
    expect(filterPluginList(plugins, "", "all")).toHaveLength(3);
  });

  it("filters by enabled status", () => {
    const result = filterPluginList(plugins, "", "enabled");
    expect(result.map((p) => p.name)).toEqual(["Better Search"]);
  });

  it("filters by disabled status (installed but not enabled)", () => {
    const result = filterPluginList(plugins, "", "disabled");
    expect(result.map((p) => p.name)).toEqual(["Worse Search"]);
  });

  it("filters by installed status regardless of enabled", () => {
    const result = filterPluginList(plugins, "", "installed");
    expect(result.map((p) => p.name)).toEqual([
      "Better Search",
      "Worse Search",
    ]);
  });

  it("search is case-insensitive", () => {
    const result = filterPluginList(plugins, "BETTER", "all");
    expect(result.map((p) => p.name)).toEqual(["Better Search"]);
  });

  it("search matches on author and description, not just name", () => {
    expect(filterPluginList(plugins, "someone", "all")).toHaveLength(3);
    expect(
      filterPluginList(
        [makePlugin({ description: "unique-phrase" })],
        "unique-PHRASE",
        "all",
      ),
    ).toHaveLength(1);
  });

  it("search trims whitespace before matching", () => {
    const result = filterPluginList(plugins, "   better   ", "all");
    expect(result.map((p) => p.name)).toEqual(["Better Search"]);
  });

  it("search and status compose together", () => {
    // "Worse Search" matches the query but is not enabled
    expect(filterPluginList(plugins, "search", "enabled")).toEqual([
      plugins[0],
    ]);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterPluginList(plugins, "zzz-no-match", "all")).toEqual([]);
  });
});

describe("filterThemeList", () => {
  const themes = [
    makeTheme({ name: "Dark Matter", installed: true }),
    makeTheme({ name: "Light Year", installed: false }),
  ];

  it("returns everything when status is all", () => {
    expect(filterThemeList(themes, "", "all")).toHaveLength(2);
  });

  it("filters by installed status", () => {
    const result = filterThemeList(themes, "", "installed");
    expect(result.map((t) => t.name)).toEqual(["Dark Matter"]);
  });

  it("search is case-insensitive across name and author", () => {
    expect(filterThemeList(themes, "dark", "all")).toHaveLength(1);
    expect(filterThemeList(themes, "SOMEONE", "all")).toHaveLength(2);
  });

  it("composes installed filter with search", () => {
    // "Light Year" matches the query but is not installed
    expect(filterThemeList(themes, "light", "installed")).toEqual([]);
    expect(filterThemeList(themes, "dark", "installed")).toHaveLength(1);
  });
});
