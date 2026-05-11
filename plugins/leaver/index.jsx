const {
  settings: { registerSection },
  util: { log },
} = shelter;

import {
  createChangelogButton,
  registerChangelogOnLoad,
} from "../../lib/changelog.js";
import { LeaverIcon } from "./icons/leaver.jsx";
import { LeaverPage } from "./pages/leaver.jsx";
import { version } from "./plugin.json";

export const changelogOptions = {
  title: "Leaver",
  subtitle: `version ${version}`,
  blurb:
    "Clean up your server list by leaving multiple Discord servers at once.",
  pluginName: "leaver",
  currentVersion: version,
  entries: [
    {
      version: "1.0.0",
      date: "2025-05-11",
      changes: [
        {
          title: "New Features",
          type: "added",
          blurb:
            "Bulk server leaving with search, filtering, and safety checks.",
          items: [
            "Leave multiple Discord servers at once without opening each",
            "Search and filter servers by name to find targets quickly",
            "Select individual servers with checkboxes or use select-all/none",
            "Guild icons and names are displayed for easy identification",
            "Excludes servers you own from the leave list for safety",
            "Confirmation prompt before executing the bulk leave action",
          ],
        },
      ],
    },
  ],
};

const unregister = registerSection(
  "section",
  "hdzilyes-leaver",
  "Leaver",
  LeaverPage,
  {
    icon: LeaverIcon,
  },
);

log("Leaver plugin loaded");

export function onUnload() {
  unregister();
}

export function onLoad() {
  registerChangelogOnLoad(changelogOptions);
}

export const ChangelogButton = createChangelogButton(changelogOptions);
