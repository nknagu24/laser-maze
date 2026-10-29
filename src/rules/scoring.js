/* =====================================================================
   LASER MAZE  —  rules/scoring.js
   ---------------------------------------------------------------------
   Stars, unlocking, level names, and where "Continue" should take the
   player.
   ===================================================================== */

import { LEVELS } from "../data/levels.js";
import { state } from "../state.js";
import { saveProgress } from "../storage/progress.js";


/* Guided levels have a "tutorial" list. Those in chapter 0 are the
   "Training" levels at the start; those in later chapters are "Guides"
   that introduce a new idea partway through the game. */
export function isTraining(index) {
  return Boolean(LEVELS[index].tutorial);
}

export function isWarmUp(index) {
  return LEVELS[index].chapter === 0;
}

/* The name shown for a level: "Training 2", "Guide 1" or "Level 5".
   Each kind is counted separately, so the first Reflection level is
   still "Level 1". */
export function levelLabel(index) {
  let training = 0;
  let guides = 0;
  let ordinary = 0;
  for (let i = 0; i <= index; i++) {
    if (isWarmUp(i)) training++;
    else if (isTraining(i)) guides++;
    else ordinary++;
  }
  if (isWarmUp(index)) return `Training ${training}`;
  if (isTraining(index)) return `Guide ${guides}`;
  return `Level ${ordinary}`;
}

/* Short version for the level-select buttons: "T2", "G1" or "5". */
export function levelShortLabel(index) {
  return levelLabel(index)
    .replace("Training ", "T")
    .replace("Guide ", "G")
    .replace("Level ", "");
}


/* Stars for solving a level with `used` pieces:
   par or fewer → 3, one over par → 2, anything more → 1.
   Levels without a par (like training) always count as 3, so they
   unlock what comes next, but no stars are shown for them. */
export function starsFor(level, used) {
  if (level.par === undefined) return 3;
  if (used <= level.par) return 3;
  if (used === level.par + 1) return 2;
  return 1;
}

/* Turns a number of stars into text, e.g. 2 → "★★☆". */
export function starText(count) {
  return "★".repeat(count) + "☆".repeat(3 - count);
}

/* Best stars saved for a level (0 if never solved). */
export function bestStars(index) {
  return state.progress.stars[LEVELS[index].name] || 0;
}

/* Remember a result, but only if it beats the player's best. */
export function recordStars(index, stars) {
  if (stars > bestStars(index)) {
    state.progress.stars[LEVELS[index].name] = stars;
    saveProgress(state.progress);
  }
}

/* Which levels can be played:
     • the Training levels (chapter 0) are always open
     • a level the player has already solved stays open
     • a level opened with "Jump to a chapter" stays open
     • any other level opens once the last ordinary (non-guided) level
       before it is solved. Guides are optional: skipping one never
       locks what comes after it. */
export function isUnlocked(index) {
  if (isWarmUp(index)) return true;
  if (bestStars(index) > 0) return true;
  if ((state.progress.opened || []).includes(LEVELS[index].name)) return true;

  for (let i = index - 1; i >= 0; i--) {
    if (!isTraining(i)) return bestStars(i) > 0;   // the last ordinary level
  }
  return true;   // nothing ordinary before it (Level 1)
}

/* Opens a level for good (used by "Jump to a chapter"). */
export function openLevel(index) {
  const name = LEVELS[index].name;
  if (!state.progress.opened.includes(name)) {
    state.progress.opened.push(name);
    saveProgress(state.progress);
  }
}


/* ---------------------------------------------------------------------
   Chapters, for the "Jump to a chapter" menu.
   For each chapter: its number and title, where to start WITH the
   guides (its guide levels; for Chapter 1, the Training), and where to
   start WITHOUT them (its first ordinary level).
   --------------------------------------------------------------------- */
export function chapterStarts() {
  const chapters = [...new Set(LEVELS.map((l) => l.chapter))].filter((c) => c > 0);
  return chapters.map((chapter) => {
    const inChapter = LEVELS.map((l, i) => i).filter((i) => LEVELS[i].chapter === chapter);
    const plain = inChapter.find((i) => !isTraining(i));
    let guided = inChapter.find((i) => isTraining(i));
    if (guided === undefined && chapter === 1) guided = LEVELS.findIndex((l) => l.chapter === 0);
    // A guided start only makes sense if it comes before the first ordinary level.
    if (guided !== undefined && guided !== -1 && guided > plain) guided = undefined;
    return { chapter, guided: guided === -1 ? undefined : guided, plain };
  });
}

/* Find a level's position from its saved name (or an old saved number). */
function savedLevelIndex() {
  const last = state.progress.lastLevel;
  if (typeof last === "string") return LEVELS.findIndex((l) => l.name === last);
  if (typeof last === "number" && last < LEVELS.length) return last;
  return -1;
}

/* Has this visitor played before? */
export function hasProgress() {
  return Object.keys(state.progress.stars).length > 0 || savedLevelIndex() > 0;
}

/* The level "Continue" should open: the last one played, if it still
   exists and is unlocked; otherwise the very first level. */
export function continueLevel() {
  const index = savedLevelIndex();
  return index >= 0 && isUnlocked(index) ? index : 0;
}
