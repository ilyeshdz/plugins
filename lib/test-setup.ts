import { vi } from "vitest";

// Some lib modules read the `shelter` global at module scope (e.g.
// lib/leaver destructures `shelter.ui` on import). Provide a minimal
// stub so they can be imported under the node test environment.
vi.stubGlobal("shelter", {
  ui: { showToast: vi.fn(), ToastColors: {} },
  util: { log: vi.fn() },
});
