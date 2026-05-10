const {
    settings: { registerSection },
    util: { log },
} = shelter;

import { LeaverPage } from "./pages/leaver.jsx";
import { LeaverIcon } from "./icons/leaver.jsx";

const unregister = registerSection("section", "hdzilyes-leaver", "Leaver", LeaverPage, { icon: LeaverIcon });

log("Leaver plugin loaded");

export function onUnload() {
    unregister();
}