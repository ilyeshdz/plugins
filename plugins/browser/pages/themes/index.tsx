import { createSignal, createResource, createMemo } from "solid-js";

import { Dropdown } from "../../../../components/dropdown/index.js";
import { ItemCard } from "../../../../components/item-card/index.js";
import { ItemGrid } from "../../../../components/item-grid/index.js";
import {
  fetchThemes,
  installTheme,
  uninstallTheme,
  loadInstalledThemes,
  type RemoteTheme,
} from "../../../../lib/api.js";
import {
  filterThemeList,
  type ThemeStatusFilter,
} from "../../../../lib/browser-list.js";

import sharedClasses from "../shared.scss";
import classes from "./index.scss";

const {
  ui: {
    Header,
    Text,
    TextTags,
    HeaderTags,
    TextBox,
    Button,
    ButtonColors,
    ButtonSizes,
  },
} = shelter;

export function onLoadThemes(): void {
  loadInstalledThemes();
}

export function ThemesPage() {
  const [search, setSearch] = createSignal("");
  const [filter, setFilter] = createSignal<ThemeStatusFilter>("all");
  const [refetchKey, setRefetchKey] = createSignal(0);

  const [themes] = createResource(() => refetchKey(), fetchThemes);

  const filteredThemes = createMemo(() => {
    return filterThemeList(themes() ?? [], search(), filter());
  });

  const refresh = () => setRefetchKey((k) => k + 1);

  const handleInstall = async (theme: RemoteTheme) => {
    await installTheme(theme);
    refresh();
  };

  const handleUninstall = async (theme: RemoteTheme) => {
    await uninstallTheme(theme);
    refresh();
  };

  return (
    <div class={sharedClasses.page}>
      <Header tag={HeaderTags.H2}>Browse themes</Header>
      <div class={sharedClasses.searchContainer}>
        <TextBox
          value={search()}
          onInput={setSearch}
          placeholder="Search for a theme..."
        />
      </div>

      <div class={sharedClasses.filtersRow}>
        <Dropdown
          options={[
            { value: "all", label: "All Themes" },
            { value: "installed", label: "Installed" },
          ]}
          value={filter()}
          onChange={setFilter}
        />
      </div>

      <div class={sharedClasses.sectionHeader}>
        <Header tag={HeaderTags.H3} margin={false}>
          Themes
        </Header>
      </div>

      <ItemGrid<RemoteTheme & { installed: boolean }>
        data={filteredThemes}
        error={() => themes.error}
        loading={() => themes.loading}
        emptyMessage="No themes found"
        children={(items) =>
          items.map((t) => (
            <ItemCard
              title={
                <Header tag={HeaderTags.H4} margin={false}>
                  {t.name}
                </Header>
              }
              description={<Text tag={TextTags.textSM}>{t.description}</Text>}
              author={t.author?.discord_name}
              action={
                t.installed ? (
                  <Button
                    color={ButtonColors.SECONDARY}
                    size={ButtonSizes.SMALL}
                    onClick={() => handleUninstall(t)}
                  >
                    Uninstall
                  </Button>
                ) : (
                  <Button
                    color={ButtonColors.PRIMARY}
                    size={ButtonSizes.SMALL}
                    onClick={() => handleInstall(t)}
                  >
                    Install
                  </Button>
                )
              }
              extra={
                <div class={classes.themeStats}>
                  <Text tag={TextTags.textXS}>{t.likes} likes</Text>
                  <Text tag={TextTags.textXS}>{t.downloads} downloads</Text>
                </div>
              }
            />
          ))
        }
      />
    </div>
  );
}
