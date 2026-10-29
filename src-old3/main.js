/* =====================================================================
   LASER MAZE  —  main.js
   ---------------------------------------------------------------------
   The front door. The browser runs this file first. It loads the
   styles, finds the box Hugo puts on the page (data-tool="laser-maze")
   and starts the game inside it. Everything else lives in the folders:

     settings.js   sizes and colours you are likely to tweak
     state.js      what the game remembers while it runs
     frame.js      the HTML skeleton of the game
     game.js       the conductor: screens, buttons, taps

     data/         levels (the file you'll edit most)
     physics/      what light does: pieces and beam tracing
     rules/        moves on the table, stars and unlocking
     drawing/      everything painted on the canvas
     screens/      filling in the start, levels and board screens
     storage/      saving progress in the browser
     styles/       how it looks
   ===================================================================== */

import "./styles/index.css";
import { startGame } from "./game.js";

const mount = document.querySelector('[data-tool="laser-maze"]');
if (mount) {
  startGame(mount);
}
