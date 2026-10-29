/* =====================================================================
   LASER MAZE  —  storage/progress.js
   ---------------------------------------------------------------------
   Remembers each visitor's progress in their own browser, using
   "localStorage": a small notebook every website gets in the browser.
   Nothing is sent anywhere; it stays on the visitor's device.

   What is saved:
     stars      the best stars earned on each level, by level name,
                e.g. { "First Bounce": 3, "Periscope": 2 }
     lastLevel  the level they were on, so they can pick up again

   Every read and write is wrapped in try { } catch { } because some
   browsers block storage (private windows, strict privacy settings).
   If that happens the game still works; it just won't remember.
   ===================================================================== */

const STORAGE_KEY = "laser-maze-progress";

/* Read saved progress, or start fresh if there is none. */
export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      return {
        stars: saved.stars || {},
        lastLevel: saved.lastLevel || 0,
      };
    }
  } catch {
    // Storage blocked or the saved text was damaged: start fresh.
  }
  return { stars: {}, lastLevel: 0 };
}

/* Write progress to the browser's storage. */
export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage blocked: carry on without saving.
  }
}

/* Forget everything (used by the "Clear saved progress" button). */
export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do.
  }
}
