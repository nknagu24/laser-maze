/* =====================================================================
   LASER MAZE  —  frame.js
   ---------------------------------------------------------------------
   The HTML skeleton of the game: the start screen, the level bar, the
   level-select screen, and the board with its message panel and tray. Nothing here moves
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
          Steer a laser beam into the detector with mirrors and other
          optics. Every level teaches one idea about how light behaves.
        </p>

        <!-- The start screen has three small "views"; one shows at a time. -->

        <!-- View 1: the main menu -->
        <div class="lm-view" data-view="menu">
          <button class="lm-menu-button" data-go="story">Story mode</button>
          <button class="lm-menu-button" data-go="chapters">Jump to a chapter</button>
          <button class="lm-menu-button" data-go="sandbox">Sandbox</button>
        </div>

        <!-- View 2: Story mode -->
        <div class="lm-view" data-view="story" hidden>
          <p class="lm-view-title">Story mode</p>
          <div class="lm-start-buttons">
            <button class="lm-continue"></button>
            <button class="lm-new">New game</button>
          </div>
          <button class="lm-back" data-go="menu">‹ Back</button>
        </div>

        <!-- View 3: Jump to a chapter (the list is filled in by screens/start.js) -->
        <div class="lm-view" data-view="chapters" hidden>
          <p class="lm-view-title">Jump to a chapter</p>
          <div class="lm-chapter-list"></div>
          <button class="lm-back" data-go="menu">‹ Back</button>
        </div>
      </section>

      <!-- ===== The bar above the board (board and levels screens) ===== -->
      <div class="lm-bar">
        <button class="lm-nav" data-move="-1" aria-label="Previous level">‹</button>
        <button class="lm-level" aria-expanded="false" title="Choose a level"></button>
        <button class="lm-nav" data-move="1" aria-label="Next level">›</button>
      </div>

      <!-- ===== Screen 3: level select ===== -->
      <div class="lm-levels"></div>

      <!-- ===== Screen 2: the board, its message panel, and the tray ===== -->
      <div class="lm-play">
        <!-- On wide screens the panel sits beside the board; on narrow
             screens it sits just above it. Either way it never covers
             the table. (See styles/bubbles.css.) -->
        <div class="lm-play-area">
          <div class="lm-board-wrap">
            <!-- The "stage" is exactly the size of the board, so the
                 pop-up can float on top of it. -->
            <div class="lm-stage">
              <canvas class="lm-board" aria-label="Laser Maze game board"></canvas>
              <div class="lm-overlay">
                <p class="lm-toast" role="alert" hidden></p>
              </div>
            </div>
          </div>

          <aside class="lm-panel">
            <p class="lm-pill" aria-live="polite"></p>
            <div class="lm-bubble" hidden>
              <button class="lm-bubble-close" data-action="close" aria-label="Close">×</button>
              <p class="lm-bubble-title" hidden></p>
              <canvas class="lm-bubble-wave" aria-hidden="true" hidden></canvas>
              <p class="lm-bubble-text"></p>
              <button class="lm-bubble-main"></button>
            </div>

            <!-- Sandbox only: the laser's settings -->
            <div class="lm-sandbox" hidden>
              <p class="lm-sandbox-title">Laser colour</p>
              <div class="lm-chips" data-setting="color">
                <button data-value="red">Red</button>
                <button data-value="green">Green</button>
                <button data-value="blue">Blue</button>
                <button data-value="white">White</button>
              </div>
              <p class="lm-sandbox-title">Laser polarization</p>
              <div class="lm-chips" data-setting="polarization">
                <button data-value="0" title="Flat">—</button>
                <button data-value="45" title="Diagonal">/</button>
                <button data-value="90" title="Upright">|</button>
                <button data-value="135" title="Diagonal">\</button>
                <button data-value="R" title="Right-handed circular">R</button>
                <button data-value="L" title="Left-handed circular">L</button>
                <button data-value="none" title="Unpolarized">none</button>
              </div>
            </div>
          </aside>
        </div>

        <div class="lm-tray-row">
          <div class="lm-tray-box">
            <p class="lm-tray-caption">Your optics: tap one to choose it</p>
            <div class="lm-tray"></div>
          </div>
          <div class="lm-actions">
            <button class="lm-reset">Reset</button>
            <button class="lm-icon lm-info" aria-label="About this level" title="About this level">
              <!-- an "i" in a circle -->
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
                   fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v6" />
                <path d="M12 7.5v.01" />
              </svg>
            </button>
            <button class="lm-icon lm-to-start" aria-label="Back to start screen" title="Back to start screen">
              <!-- a small house -->
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
                   fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11 12 3l9 8" />
                <path d="M5 10v10h5v-6h4v6h5V10" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  `;

  // Hand back the parts the rest of the game will talk to.
  // Everywhere else they are reached as ui.something, e.g. ui.canvas.
  return {
    game: mount.querySelector(".lm-game"),

    start: mount.querySelector(".lm-start"),
    hero: mount.querySelector(".lm-hero"),
    startViews: mount.querySelectorAll(".lm-view"),
    chapterList: mount.querySelector(".lm-chapter-list"),
    continueButton: mount.querySelector(".lm-continue"),
    newButton: mount.querySelector(".lm-new"),

    bar: mount.querySelector(".lm-bar"),
    levelName: mount.querySelector(".lm-level"),
    prevButton: mount.querySelector('[data-move="-1"]'),
    nextButton: mount.querySelector('[data-move="1"]'),

    levelPanel: mount.querySelector(".lm-levels"),

    play: mount.querySelector(".lm-play"),
    boardWrap: mount.querySelector(".lm-board-wrap"),
    canvas: mount.querySelector(".lm-board"),
    tray: mount.querySelector(".lm-tray"),
    resetButton: mount.querySelector(".lm-reset"),
    infoButton: mount.querySelector(".lm-info"),
    homeButton: mount.querySelector(".lm-to-start"),

    panel: mount.querySelector(".lm-panel"),
    sandboxBox: mount.querySelector(".lm-sandbox"),
    pill: mount.querySelector(".lm-pill"),
    toast: mount.querySelector(".lm-toast"),
    bubble: mount.querySelector(".lm-bubble"),
    bubbleTitle: mount.querySelector(".lm-bubble-title"),
    bubbleWave: mount.querySelector(".lm-bubble-wave"),
    bubbleText: mount.querySelector(".lm-bubble-text"),
    bubbleMain: mount.querySelector(".lm-bubble-main"),
    bubbleClose: mount.querySelector(".lm-bubble-close"),
  };
}
