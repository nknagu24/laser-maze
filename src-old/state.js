/* =====================================================================
   LASER MAZE  —  state.js
   ---------------------------------------------------------------------
   What the game "remembers" while it runs. There is only one state
   object, and every file that needs it imports it from here, so they
   all see the same, up-to-date values.
   ===================================================================== */

import { loadProgress } from "./storage/progress.js";

export const state = {
  levelIndex: 0,    // 0 = the first level in data/levels.js
  placed: [],       // pieces the player has put on the table, e.g.
                    //   { row: 2, col: 5, type: "mirror", angle: 45 }
  selected: null,   // which tray piece is chosen ("mirror"), or null
  hover: null,      // the cell under the mouse: { row, col }, or null
  screen: "start",  // which screen is showing: "start", "board" or "levels"
  played: false,    // becomes true once a level has been opened this visit
  progress: loadProgress(),   // saved stars and last level (storage/progress.js)
};
