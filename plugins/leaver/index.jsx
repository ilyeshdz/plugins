const {
  util: { log },
} = shelter;

import { registerPage } from "../../lib/shelter/settings.js";
import { LeaverIcon } from "./icons/leaver.jsx";
import { LeaverPage } from "./pages/leaver.jsx";

const unregister = registerPage(
  "hdzilyes-leaver",
  "Leaver",
  LeaverPage,
  LeaverIcon,
);

log("Leaver plugin loaded");

export function onUnload() {
  unregister();
}

export function onLoad() {}
