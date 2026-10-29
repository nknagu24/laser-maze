/* =====================================================================
   LASER MAZE  —  screens/bubbles.js
   ---------------------------------------------------------------------
   The messages around the board:
     pill    a small status line ("2 of 3 detectors lit")
     toast   a short pop-up over the top of the board that disappears
             by itself ("Not there!")
     bubble  a speech bubble, in three kinds:
               "guide"  a training step, with a button to go on
               "win"    "Solved!", with a Next level button
               "info"   the level's physics note (the ⓘ button)
               "piece"  what an optic does (the small i on its tray card)

   A guide bubble can also hold an animated light wave
   (drawing/wave.js), shown above its text.

   The board is redrawn many times a second during training (to make
   the guide glow), so these functions only touch the page when
   something actually changed. That keeps buttons from flickering.
   ===================================================================== */

import { playWave, stopWave } from "../drawing/wave.js";

/* pill: text for the status line ("" hides it). */
export function renderPill(ui, text) {
  if (ui.pill.textContent !== text) ui.pill.textContent = text;
  ui.pill.hidden = text === "";
}

/* toast: text for the pop-up ("" hides it). */
export function renderToast(ui, text) {
  if (ui.toast.textContent !== text) ui.toast.textContent = text;
  ui.toast.hidden = text === "";
}

/* bubble: null to hide it, or
     { kind: "guide" | "win" | "info" | "piece",
       title: "…" (optional, shown in bold above the text),
       text: "…",
       wave: { input, element } or null   (an animated light wave),
       button: { label: "Next", action: "tutorial-next" } or null,
       closable: true / false } */
export function renderBubble(ui, bubble) {
  if (!bubble) {
    if (!ui.bubble.hidden) stopWave();
    ui.bubble.hidden = true;
    ui.bubble.dataset.key = "";
    return;
  }

  // A "key" describing the bubble; if it hasn't changed, do nothing.
  const key = [
    bubble.kind, bubble.title, bubble.text, bubble.button?.label, bubble.closable,
    JSON.stringify(bubble.wave || null),
  ].join("|");
  ui.bubble.hidden = false;
  if (ui.bubble.dataset.key === key) return;
  ui.bubble.dataset.key = key;

  ui.bubble.dataset.kind = bubble.kind;          // CSS colours it by kind
  ui.bubbleText.textContent = bubble.text;
  ui.bubbleTitle.textContent = bubble.title || "";
  ui.bubbleTitle.hidden = !bubble.title;
  ui.bubbleClose.hidden = !bubble.closable;

  // The animated wave, if this bubble has one.
  if (bubble.wave) {
    ui.bubbleWave.hidden = false;
    playWave(ui.bubbleWave, bubble.wave);
  } else {
    ui.bubbleWave.hidden = true;
    stopWave();
  }

  if (bubble.button) {
    ui.bubbleMain.hidden = false;
    ui.bubbleMain.textContent = bubble.button.label;
    ui.bubbleMain.dataset.action = bubble.button.action;
  } else {
    ui.bubbleMain.hidden = true;
  }
}
