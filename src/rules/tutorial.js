/* =====================================================================
   LASER MAZE  —  rules/tutorial.js
   ---------------------------------------------------------------------
   The rules for training levels: which step the player is on, which
   taps are allowed, and when a step is finished.
   (The steps themselves are written in data/levels.js.)
   ===================================================================== */

import { PIECES } from "../physics/pieces.js";
import { findAt } from "../physics/beam.js";
import { state } from "../state.js";


/* The current step, or null when there is none (an ordinary level,
   or a training level whose steps are all done). */
export function currentStep(level) {
  if (!level.tutorial) return null;
  return level.tutorial[state.tutorialStep] || null;
}

/* Go on to the next step, skipping any that are already done
   (for example, if the player chose the right piece early). */
export function advance(level) {
  state.tutorialStep++;
  let step = currentStep(level);
  while (step && isStepDone(step)) {
    state.tutorialStep++;
    step = currentStep(level);
  }
}

/* Is this step's job done? ("next" steps only end with the button.) */
export function isStepDone(step) {
  if (step.select) return state.selected === step.select;

  if (step.place) {
    const i = findAt(state.placed, step.place.row, step.place.col);
    return i !== -1 && state.placed[i].type === step.place.type;
  }

  if (step.turn) {
    const i = findAt(state.placed, step.turn.row, step.turn.col);
    return i !== -1 && state.placed[i].angle === step.turn.until;
  }

  return false;
}

/* The player tapped the board at (row, col). Is that allowed now?
   Returns null if it is, or a short message explaining what to do. */
export function checkTap(level, row, col) {
  const step = currentStep(level);
  if (!step) return null;

  if (step.next) {
    return `Read the tip, then press "${step.next}".`;
  }

  if (step.select) {
    return `First choose the ${PIECES[step.select].label} in the tray.`;
  }

  if (step.place) {
    if (state.selected !== step.place.type) {
      return `First choose the ${PIECES[step.place.type].label} in the tray.`;
    }
    if (row !== step.place.row || col !== step.place.col) {
      return "Not there! Place it on the glowing hole.";
    }
    return null;
  }

  if (step.turn) {
    if (row !== step.turn.row || col !== step.turn.col) {
      return "Tap the glowing piece to turn it.";
    }
    return null;
  }

  return null;
}

/* Is the player allowed to choose this tray piece now? */
export function checkTraySelect(level, type) {
  const step = currentStep(level);
  if (step && step.select && type !== step.select) {
    return `Choose the ${PIECES[step.select].label} for now.`;
  }
  return null;
}

/* The cell to make glow, and whether to draw the turning arrow. */
export function guideFor(level) {
  const step = currentStep(level);
  if (!step) return null;
  if (step.place) return { row: step.place.row, col: step.place.col, arrow: false };
  if (step.turn) return { row: step.turn.row, col: step.turn.col, arrow: true };
  return null;
}
