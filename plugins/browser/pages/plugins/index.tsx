import { createSignal, createResource, createMemo } from "solid-js";
import { Dropdown } from "../../../../components/dropdown/index.js";
import { ItemCard } from "../../../../components/item-card/index.js";
import { ItemGrid } from "../../../../components/item-grid/index.js";
import { fetchPlugins, togglePlugin, installPlugin, uninstallPlugin, hasPluginSettings, showPluginSettings, type Plugin, type FilterOptions } from "../../../../lib/api.js";
import { SettingsIcon } from "../../icons/settings-icon.jsx";
import sharedClasses from "../shared.scss";
import classes from "./index.scss";

const {
    ui: {
        Header,
        Text,
        TextTags,
        HeaderTags,
        TextBox,
        SwitchItem,
        Button,
        ButtonColors,
        ButtonSizes,
    }
} = shelter;

export function PluginsPage() {
    const [search, setSearch] = createSignal("");
    const [filter, setFilter] = createSignal<FilterOptions["status"]>("all");
    const [refetchKey, setRefetchKey] = createSignal(0);

    const [plugins, { refetch }] = createResource(() => refetchKey(), fetchPlugins);

    const filteredPlugins = createMemo(() => {
        const items = plugins() ?? [];
        const query = search().toLowerCase();
        const status = filter();

        return items.filter(p => {
            if (status === "enabled" && !(p.installed && p.enabled)) return false;
            if (status === "disabled" && !(p.installed && !p.enabled)) return false;
            if (status === "installed" && !p.installed) return false;
            if (!query) return true;
            return p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.author.toLowerCase().includes(query);
        });
    });

    const refresh = () => setRefetchKey(k => k + 1);

    const withRefresh = (fn: (p: Plugin) => Promise<void>) => async (plugin: Plugin) => {
        await fn(plugin);
        refresh();
    };

    return (
        <div class={sharedClasses.page}>
            <Header tag={HeaderTags.H2}>Browse plugins</Header>
            <div class={sharedClasses.searchContainer}>
                <TextBox
                    value={search()}
                    onInput={setSearch}
                    placeholder="Search for a plugin..."
                />
            </div>

            <div class={sharedClasses.filtersRow}>
                <Dropdown
                    options={[
                        { value: "all", label: "All Plugins" },
                        { value: "enabled", label: "Enabled" },
                        { value: "disabled", label: "Disabled" },
                        { value: "installed", label: "Installed" },
                    ]}
                    value={filter()}
                    onChange={setFilter}
                />
            </div>

            <div class={sharedClasses.sectionHeader}>
                <Header tag={HeaderTags.H3} margin={false}>Plugins</Header>
            </div>

            <ItemGrid<Plugin>
                data={filteredPlugins}
                loading={() => plugins.loading}
                emptyMessage="No plugins found"
                children={(items) => items.map(p => (
                    <ItemCard
                        title={<Header tag={HeaderTags.H4} margin={false}>{p.name}</Header>}
                        description={<Text tag={TextTags.textSM}>{p.description}</Text>}
                        author={p.author}
                        action={p.installed ? (
                            <div class={classes.pluginToggleRow}>
                                <SwitchItem
                                    checked={p.enabled}
                                    onChange={() => withRefresh(togglePlugin)(p)}
                                    hideBorder
                                >{""}</SwitchItem>
                                <Button
                                    color={ButtonColors.SECONDARY}
                                    size={ButtonSizes.SMALL}
                                    onClick={() => withRefresh(uninstallPlugin)(p)}
                                >
                                    Uninstall
                                </Button>
                            </div>
                        ) : (
                            <Button
                                color={ButtonColors.PRIMARY}
                                size={ButtonSizes.SMALL}
                                onClick={() => withRefresh(installPlugin)(p)}
                            >
                                Install
                            </Button>
                        )}
                        extra={p.installed && hasPluginSettings(p) && (
                            <span
                                class={classes.pluginIconSettings}
                                title="Settings"
                                onClick={() => showPluginSettings(p)}
                            >
                                <SettingsIcon />
                            </span>
                        )}
                        actionsClass={classes.pluginActions}
                    />
                ))}
            />
        </div>
    );
}
