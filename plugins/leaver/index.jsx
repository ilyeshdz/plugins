const {
  settings: { registerSection },
  util: { log },
} = shelter;

import { LeaverIcon } from "./icons/leaver.jsx";
import { LeaverPage } from "./pages/leaver.jsx";

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
