/* =====================================================================
   LASER MAZE  —  frame.js
   ---------------------------------------------------------------------
   The HTML skeleton of the game: the start screen, the level bar, the
   level-select screen and the board with its tray. Nothing here moves
   or reacts; game.js and the screens/ files fill it in and show one
   screen at a time.

   Every class name starts with "lm-" (Laser Maze) so it can never
   clash with the classes already used elsewhere on your site.

   To change the words on the start screen, edit them right here.
   ===================================================================== */

export function buildFrame(mount) {
  mount.innerHTML = `
    <div class="lm-game">

      <!-- ===== Screen 1: start ===== -->
      <section class="lm-start">
        <h2 class="lm-title">Laser Maze</h2>
        <canvas class="lm-hero" aria-hidden="true"></canvas>

        <p class="lm-intro">
          Guide a laser beam into the detector by placing mirrors on an
          optical table. Every level teaches one idea about how light
          behaves, the same ideas physicists use to build real experiments.
        </p>
        <p class="lm-howto">
          Tap a hole to place a mirror. Tap the mirror to turn it, and tap
          it once more to pick it up.
        </p>

        <div class="lm-start-buttons">
          <button class="lm-continue"></button>
          <button class="lm-new">New game</button>
        </div>

        <aside class="lm-disclaimer">
          <p class="lm-disclaimer-title">For young physicists</p>
          <p>
            Laser Maze is a learning tool for kids (and curious grown-ups)
            to practise steering light and building optical setups. The
            physics is simplified: these mirrors are perfect and the beams
            never spread out.
          </p>
          <p>
            Real lasers can permanently damage your eyes. Never look into
            a laser beam or point one at anyone, and only use real lasers
            with an adult's supervision.
          </p>
        </aside>
      </section>

      <!-- ===== The bar above the board (board and levels screens) ===== -->
      <div class="lm-bar">
        <button class="lm-nav" data-move="-1" aria-label="Previous level">‹</button>
        <button class="lm-level" aria-expanded="false" title="Choose a level"></button>
        <button class="lm-nav" data-move="1" aria-label="Next level">›</button>
      </div>

      <!-- ===== Screen 3: level select ===== -->
      <div class="lm-levels"></div>

      <!-- ===== Screen 2: the board and everything under it ===== -->
      <div class="lm-play">
        <div class="lm-board-wrap">
          <canvas class="lm-board" aria-label="Laser Maze game board"></canvas>
        </div>

        <div class="lm-tray-row">
          <div class="lm-tray"></div>
          <div class="lm-actions">
            <button class="lm-reset">Reset</button>
            <button class="lm-to-start" aria-label="Back to start screen" title="Back to start screen">
              <!-- a small house icon, drawn with two lines -->
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
                   fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11 12 3l9 8" />
                <path d="M5 10v10h5v-6h4v6h5V10" />
              </svg>
            </button>
          </div>
        </div>
        <p class="lm-hint">Choose a piece in the tray, then tap an empty hole to place it. Tap a placed piece to turn it; tap it again to pick it up.</p>

        <p class="lm-status" aria-live="polite"></p>
        <p class="lm-note"></p>
      </div>

    </div>
  `;

  // Hand back the parts the rest of the game will talk to.
  // Everywhere else they are reached as ui.something, e.g. ui.canvas.
  return {
    game: mount.querySelector(".lm-game"),

    start: mount.querySelector(".lm-start"),
    hero: mount.querySelector(".lm-hero"),
    continueButton: mount.querySelector(".lm-continue"),
    newButton: mount.querySelector(".lm-new"),

    bar: mount.querySelector(".lm-bar"),
    levelName: mount.querySelector(".lm-level"),
    prevButton: mount.querySelector('[data-move="-1"]'),
    nextButton: mount.querySelector('[data-move="1"]'),

    levelPanel: mount.querySelector(".lm-levels"),

    play: mount.querySelector(".lm-play"),
    canvas: mount.querySelector(".lm-board"),
    tray: mount.querySelector(".lm-tray"),
    resetButton: mount.querySelector(".lm-reset"),
    homeButton: mount.querySelector(".lm-to-start"),
    status: mount.querySelector(".lm-status"),
    note: mount.querySelector(".lm-note"),
  };
}
