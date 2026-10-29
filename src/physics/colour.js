/* =====================================================================
   LASER MAZE  —  physics/colour.js
   ---------------------------------------------------------------------
   Colour, kept simple: light is made of up to three colours, "red",
   "green" and "blue". White light is all three together.

   A beam carries a list of the colours in it, e.g. ["red"] for a red
   laser, or ["red", "green", "blue"] for white light. Its power is
   shared equally between the colours it carries, so white light is
   ⅓ red, ⅓ green and ⅓ blue.
   ===================================================================== */

export const ALL_COLOURS = ["red", "green", "blue"];

/* Turns a laser's colour setting into the list of colours it makes. */
export function coloursOf(name) {
  if (name === "white") return [...ALL_COLOURS];
  return [name || "red"];
}

/* What share of a beam's power is in the given colours. */
export function shareOf(beamColours, wanted) {
  const matching = beamColours.filter((c) => wanted.includes(c)).length;
  return matching / beamColours.length;
}

/* The colour to draw a beam, by adding its colours together the way
   light does: red + green = yellow, all three = white. */
const RGB = { red: [255, 42, 42], green: [42, 230, 90], blue: [60, 120, 255] };

export function drawColour(beamColours) {
  if (beamColours.length === 3) return "rgb(255, 250, 240)";   // white
  const mix = [0, 0, 0];
  for (const c of beamColours) {
    for (let i = 0; i < 3; i++) mix[i] = Math.min(255, mix[i] + RGB[c][i]);
  }
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

/* A name for a list of colours, for messages: "red", "white"… */
export function colourName(beamColours) {
  if (beamColours.length === 3) return "white";
  return beamColours.join(" + ");
}
