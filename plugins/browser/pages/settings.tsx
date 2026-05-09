import { createSignal, For } from "solid-js";
import {
    getSources,
    addSource,
    removeSource,
    updateSource,
    type PluginSource
} from "../../../lib/api.js";
import css from "./settings.scss";

const {
    ui: {
        TextBox,
        Button,
        ButtonColors,
        ButtonSizes,
        SwitchItem,
        injectCss
    }
} = shelter;

export const unloadSettingsCss = injectCss(css);

function TrashIcon({ onClick }: { onClick: () => void }) {
    return (
        <svg class="trash-icon" onClick={onClick} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
    );
}

export function SettingsPage() {
    const [sources, setSources] = createSignal<PluginSource[]>(getSources());
    const [newSourceUrl, setNewSourceUrl] = createSignal("");
    const [newSourceName, setNewSourceName] = createSignal("");

    const handleToggle = (url: string, enabled: boolean) => {
        updateSource(url, { enabled });
        setSources(getSources());
    };

    const handleRemove = (url: string) => {
        removeSource(url);
        setSources(getSources());
    };

    const handleAdd = () => {
        const url = newSourceUrl().trim();
        if (!url) return;

        let name = newSourceName().trim();
        if (!name) {
            try {
                name = new URL(url).hostname;
            } catch {
                name = "Custom Source";
            }
        }

        addSource({ url, enabled: true, name });
        setSources(getSources());
        setNewSourceUrl("");
        setNewSourceName("");
    };

    return (
        <div class="settings-page">
            <div class="settings-section">
                <div class="add-source-form">
                    <TextBox
                        value={newSourceName()}
                        onInput={setNewSourceName}
                        placeholder="Name (optional)"
                    />
                    <TextBox
                        value={newSourceUrl()}
                        onInput={setNewSourceUrl}
                        placeholder="https://example.com/data"
                    />
                    <Button
                        class="add-btn"
                        color={ButtonColors.PRIMARY}
                        size={ButtonSizes.SMALL}
                        onClick={handleAdd}
                        disabled={!newSourceUrl().trim()}
                    >
                        Add Source
                    </Button>
                </div>

                <div class="source-list">
                    <For each={sources()} children={(source) => (
                        <div class={`source-item ${!source.enabled ? 'disabled' : ''}`}>
                            <div class="source-info">
                                <div class="source-name">{source.name}</div>
                                <div class="source-url">{source.url}</div>
                            </div>
                            <div class="source-toggle">
                                <SwitchItem
                                    checked={source.enabled}
                                    onChange={(enabled: boolean) => handleToggle(source.url, enabled)}
                                    hideBorder
                                />
                            </div>
                            <div class="source-actions">
                                <TrashIcon onClick={() => handleRemove(source.url)} />
                            </div>
                        </div>
                    )} />
                </div>
            </div>
        </div>
    );
}