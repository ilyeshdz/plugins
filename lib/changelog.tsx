/**
 * @fileoverview Changelog utility — Discord Beta-style minimalist changelog
 *
 * Uses localStorage to persist the last seen version per plugin.
 * On plugin load, shows a clean, minimal changelog modal styled with
 * Discord's own CSS variables.
 */

import { type Component } from "solid-js";

const {
  ui: {
    openModal,
    ModalRoot,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalSizes,
    Button,
    ButtonColors,
    ButtonSizes,
    niceScrollbarsClass,
  },
} = shelter;

const STORAGE_PREFIX = "hdzilyes_changelog_";

// ─── Color mapping for section types ──────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  added: "var(--green-360)",
  fixed: "var(--yellow-300)",
  improved: "var(--blue-360)",
  removed: "var(--red-400)",
  changed: "var(--brand-360)",
  default: "var(--text-muted)",
};

function typeColor(type?: string): string {
  return TYPE_COLORS[type ?? "default"] ?? TYPE_COLORS.default;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChangeGroup {
  /** Section title, e.g. "New Features", "Bugs Eliminated" */
  title: string;
  /** Visual category: added | fixed | improved | removed | changed */
  type?: string;
  /** Optional short summary shown above the bullet list */
  blurb?: string;
  /** Bullet items */
  items: string[];
}

export interface ChangelogEntry {
  /** Version string, e.g. "1.1.0" */
  version: string;
  /** Optional release date */
  date?: string;
  /** Grouped changes for this version */
  changes: ChangeGroup[];
}

export interface ChangelogOptions {
  /** Plugin name shown in the modal header */
  title: string;
  /** Version subtitle, e.g. `version ${version}` */
  subtitle?: string;
  /** Short description shown under the title */
  blurb?: string;
  /** Internal plugin identifier used for localStorage key */
  pluginName: string;
  /** Current version from plugin.json */
  currentVersion: string;
  /** Changelog entries ordered newest first */
  entries: ChangelogEntry[];
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function storageKey(pluginName: string): string {
  return `${STORAGE_PREFIX}${pluginName}`;
}

export function getLastSeenVersion(pluginName: string): string | null {
  try {
    return localStorage.getItem(storageKey(pluginName));
  } catch {
    return null;
  }
}

export function setLastSeenVersion(pluginName: string, version: string): void {
  try {
    localStorage.setItem(storageKey(pluginName), version);
  } catch {}
}

export function shouldShowChangelog(
  pluginName: string,
  currentVersion: string,
): boolean {
  return getLastSeenVersion(pluginName) !== currentVersion;
}

function filterNewEntries(
  entries: ChangelogEntry[],
  lastSeen: string | null,
): ChangelogEntry[] {
  if (!lastSeen) return entries;
  return entries.filter((e) => e.version > lastSeen);
}

// ─── Styles using Discord CSS variables ───────────────────────────────────────

const styles = {
  headerWrap: {
    display: "flex",
    "flex-direction": "column",
    gap: "2px",
    "margin-bottom": "16px",
  } as Record<string, string>,

  headerTitle: {
    "font-size": "20px",
    "font-weight": "700",
    color: "var(--header-primary)",
    "line-height": "1.25",
  } as Record<string, string>,

  headerSubtitle: {
    "font-size": "12px",
    color: "var(--text-muted)",
    "font-weight": "500",
  } as Record<string, string>,

  headerBlurb: {
    "font-size": "14px",
    color: "var(--text-normal)",
    "margin-top": "8px",
    "line-height": "1.4",
  } as Record<string, string>,

  divider: {
    height: "1px",
    background: "var(--background-modifier-accent)",
    margin: "12px 0",
  } as Record<string, string>,

  group: {
    "margin-bottom": "16px",
  } as Record<string, string>,

  groupHeader: {
    display: "flex",
    "align-items": "center",
    gap: "8px",
    "margin-bottom": "6px",
  } as Record<string, string>,

  typeDot: {
    width: "8px",
    height: "8px",
    "border-radius": "50%",
    "flex-shrink": "0",
  } as Record<string, string>,

  groupTitle: {
    "font-size": "12px",
    "font-weight": "700",
    "text-transform": "uppercase",
    "letter-spacing": "0.06em",
    color: "var(--header-secondary)",
  } as Record<string, string>,

  groupBlurb: {
    "font-size": "13px",
    color: "var(--text-muted)",
    "margin-bottom": "8px",
    "margin-left": "16px",
    "line-height": "1.35",
  } as Record<string, string>,

  item: {
    display: "flex",
    "align-items": "baseline",
    gap: "8px",
    "font-size": "14px",
    color: "var(--text-normal)",
    "line-height": "1.5",
    padding: "2px 0",
    "padding-left": "16px",
  } as Record<string, string>,

  itemBullet: {
    color: "var(--text-muted)",
    "font-size": "14px",
    "line-height": "1",
    "flex-shrink": "0",
  } as Record<string, string>,

  footerHint: {
    "font-size": "12px",
    color: "var(--text-muted)",
  } as Record<string, string>,
} as const;

// ─── Modal component ──────────────────────────────────────────────────────────

const ChangelogModal: Component<{
  close(): void;
  options: ChangelogOptions;
  entries: ChangelogEntry[];
}> = (props) => {
  const opts = props.options;

  return (
    <ModalRoot size={ModalSizes.MEDIUM}>
      <ModalHeader close={props.close} />

      <ModalBody>
        {/* Title block */}
        <div style={styles.headerWrap}>
          <div style={styles.headerTitle}>{opts.title}</div>
          {opts.subtitle && (
            <div style={styles.headerSubtitle}>{opts.subtitle}</div>
          )}
          {opts.blurb && <div style={styles.headerBlurb}>{opts.blurb}</div>}
        </div>

        <div style={styles.divider} />

        {/* Entries */}
        <div class={niceScrollbarsClass()}>
          {props.entries.map((entry) => (
            <div>
              {entry.changes.map((group) => {
                const color = typeColor(group.type);
                return (
                  <div style={styles.group}>
                    <div style={styles.groupHeader}>
                      <span
                        style={{
                          ...styles.typeDot,
                          background: color,
                        }}
                      />
                      <span style={styles.groupTitle}>{group.title}</span>
                    </div>

                    {group.blurb && (
                      <div style={styles.groupBlurb}>{group.blurb}</div>
                    )}

                    {group.items.map((item) => (
                      <div style={styles.item}>
                        <span style={styles.itemBullet}>—</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ModalBody>

      <ModalFooter>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
            width: "100%",
          }}
        >
          <span style={styles.footerHint}>
            {opts.pluginName} · v{opts.currentVersion}
          </span>
          <Button
            color={ButtonColors.PRIMARY}
            size={ButtonSizes.SMALL}
            onClick={props.close}
          >
            Got it
          </Button>
        </div>
      </ModalFooter>
    </ModalRoot>
  );
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function showChangelogModal(options: ChangelogOptions): void {
  const lastSeen = getLastSeenVersion(options.pluginName);
  const newEntries = filterNewEntries(options.entries, lastSeen);
  const entriesToShow = newEntries.length > 0 ? newEntries : options.entries;

  openModal((props: { close(): void }) => (
    <ChangelogModal
      close={props.close}
      options={options}
      entries={entriesToShow}
    />
  ));

  setLastSeenVersion(options.pluginName, options.currentVersion);
}

/** Convenience helper for `onLoad` — always shows for testing */
export function registerChangelogOnLoad(options: ChangelogOptions): void {
  showChangelogModal(options);
}

/** Create a "Changelog" button for use in plugin settings pages */
export function createChangelogButton(options: ChangelogOptions): Component {
  return () => (
    <Button
      color={ButtonColors.SECONDARY}
      size={ButtonSizes.SMALL}
      onClick={() => showChangelogModal(options)}
    >
      Changelog
    </Button>
  );
}
