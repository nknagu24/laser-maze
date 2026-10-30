/* =====================================================================
   LASER MAZE  —  physics/pieces.js
   ---------------------------------------------------------------------
   The optical pieces a player can place, and what each one does to
   the beam. To add a new piece, add one more entry here, plus a
   drawing function in drawing/parts.js.

   Every piece answers one question, in its "split" function:
     "A beam arrives travelling in this direction, carrying this light
      (its polarization and its colours). What comes out?"
   Each piece also has:
     label   its name in the tray
     short   its name printed on the table
     about   the explanation shown by the small ⓘ on its tray button
     more    (optional) a longer explanation behind a "Learn more"
             button in that bubble; a blank line starts a new paragraph
     wave    (optional) an animated wave for that explanation,
             see drawing/wave.js

   The answer is a list of outgoing beams, each with
     direction  where it goes
     share      how much of the light it carries (1 = all, 0.5 = half)
     pol        its polarization afterwards
     colours    (optional) its colours afterwards; left out = unchanged
     shift      (optional) the beam first steps sideways one cell in
                this direction, then carries on (used by calcite)

   ANGLES
   Angles are in degrees, measured from the horizontal, turning
   anticlockwise:   0° —    45° /    90° |    135° \
   For mirrors and splitters the angle is how the surface sits on the
   table. For polarizers and wave plates it's the direction of their axis.

   The polarization rules themselves live in physics/polarization.js.
   ===================================================================== */

import {
  reflectPol, throughPolarizer, halfWave, quarterWave,
} from "./polarization.js";
import { ALL_COLOURS } from "./colour.js";


/* The "Learn more" text shared by every dye. */
const DYE_MORE = "How it works: the dye's molecules swallow light of some colours, and a moment later give the energy back as light of a lower-energy, redder colour. That's why you can judge what light will make a dye glow just by looking at its colour: it absorbs the colours it doesn't show you.\n\nYou've seen this without realising it:\n\nRubies glow deep red under green or blue light. The very first laser, built in 1960, was a ruby crystal.\n\nHighlighter pens look so bright because they also turn invisible ultraviolet into visible colour.\n\nWhite shirts and paper glow blue under a black light, thanks to brighteners added to make them look whiter.\n\nTonic water glows blue under ultraviolet light, and the gem fluorite glows so well that fluorescence was named after it.";


export const PIECES = {
  mirror: {
    label: "Mirror",       // the name in the tray
    short: "Mirror",       // the name printed on the table (kept short)
    about: "A mirror reflects light: the angle in equals the angle out. Set at 45° to the beam, it turns the beam by exactly 90°. Tap a placed mirror to turn it between / and \\.",

    // Tapping a placed piece steps through these angles in order.
    // One more tap after the last angle picks it back up.
    angles: [45, 135],

    // Law of reflection: angle in = angle out. A mirror at 45° to the
    // beam turns it by exactly 90°; all the light goes the new way.
    // Reflection also flips circular light from R to L and back.
    split(direction, angle, { pol }) {
      return [{ direction: reflect(direction, angle), share: 1, pol: reflectPol(pol) }];
    },
  },

  splitter: {
    label: "Beam splitter",
    short: "Splitter",
    about: "A 50:50 beam splitter is a glass cube with a half-silvered surface inside. Half the light goes straight through; the other half reflects, just like from a mirror. Each half carries 50% of the power.",
    angles: [45, 135],

    // A 50:50 beam splitter is a glass cube with a half-silvered
    // surface inside. Half the light passes straight through; the
    // other half reflects, exactly as it would from a mirror.
    split(direction, angle, { pol }) {
      return [
        { direction: direction, share: 0.5, pol },                               // passes through
        { direction: reflect(direction, angle), share: 0.5, pol: reflectPol(pol) }, // reflects
      ];
    },
  },

  polarizer: {
    label: "Polarizer",
    short: "Polarizer",
    about: "A polarizer only lets through the part of the light wiggling along its lines (its axis). What comes out is polarized along the axis, with cos² of the angle difference of its power. Tap it to turn it in 45° steps.",
    wave: { input: 45, element: { type: "polarizer", angle: 0 } },
    more: "You use polarizers every day without noticing.\n\nPolarized sunglasses cut glare: light reflected off water, wet roads and car bonnets is mostly horizontally polarized, so a vertical polarizer blocks it.\n\nPhone and laptop screens (LCDs) have a polarizer on the front. Look at one through polarized sunglasses and tilt your head: the screen can go dark!\n\n3D cinema glasses use polarization to send a different picture to each eye.",
    angles: [0, 45, 90, 135],

    // Only lets through the part of the wave wiggling along its axis
    // (Malus's law). What comes out is polarized along the axis.
    split(direction, angle, { pol }) {
      return [{ direction, share: throughPolarizer(pol, angle), pol: angle }];
    },
  },

  wollaston: {
    label: "Wollaston prism",
    short: "Wollaston",
    about: "A Wollaston prism is two wedges of birefringent crystal glued together. It splits light into its horizontal and vertical parts and sends them off in two different directions, so neither goes straight on. Invented by William Hyde Wollaston in the early 1800s.",
    angles: [45, 135],   // which side the horizontal part goes to

    // Horizontal part to one side, vertical part to the other. How much
    // goes each way is the same as through a horizontal or vertical
    // polarizer (so diagonal, circular or unpolarized light: half each).
    split(direction, angle, { pol }) {
      const flatSide = angle === 45 ? LEFT_OF[direction] : RIGHT_OF[direction];
      const uprightSide = angle === 45 ? RIGHT_OF[direction] : LEFT_OF[direction];
      return [
        { direction: flatSide, share: throughPolarizer(pol, 0), pol: 0 },
        { direction: uprightSide, share: throughPolarizer(pol, 90), pol: 90 },
      ];
    },
  },

  halfwave: {
    label: "Half-wave plate",
    short: "λ/2 plate",
    about: "A half-wave plate turns the polarization without losing any light. It mirrors the wiggle across its axis, so a plate at 45° turns flat light upright. It also swaps R and L.",
    wave: { input: 0, element: { type: "halfwave", angle: 45 } },
    angles: [0, 45, 90, 135],

    // Turns the polarization without losing any light.
    split(direction, angle, { pol }) {
      return [{ direction, share: 1, pol: halfWave(pol, angle) }];
    },
  },

  quarterwave: {
    label: "Quarter-wave plate",
    short: "λ/4 plate",
    about: "A quarter-wave plate turns straight-line polarization into circular (R or L), and back again, without losing any light. It works when its axis is 45° from the light's wiggle.",
    wave: { input: 0, element: { type: "quarterwave", angle: 135 } },
    angles: [0, 45, 90, 135],

    // Turns linear light into circular light (and back), without
    // losing any light.
    split(direction, angle, { pol }) {
      return [{ direction, share: 1, pol: quarterWave(pol, angle) }];
    },
  },


  /* ---------------- Chapter 4: Birefringence ---------------- */

  pbs: {
    label: "Polarizing splitter",
    short: "PBS",
    about: "A polarizing beam splitter sorts light by polarization: the flat (—) part goes straight through, the upright (|) part reflects. Diagonal light splits half and half; circular light too.",
    angles: [45, 135],

    // How much of the light is flat and how much upright is the same
    // as what a flat or an upright polarizer would let through.
    split(direction, angle, { pol }) {
      return [
        { direction, share: throughPolarizer(pol, 0), pol: 0 },                         // flat: straight on
        { direction: reflect(direction, angle), share: throughPolarizer(pol, 90), pol: 90 }, // upright: reflected
      ];
    },
  },

  displacer: {
    label: "Calcite crystal",
    short: "Calcite",
    about: "Calcite is birefringent: it has two refractive indices. The flat part of the light (the ordinary ray) goes straight through, while the upright part (the extraordinary ray) is pushed sideways. Look at writing through calcite and you see it twice!",
    wave: { input: 45, crystal: { retard: 90 } },
    angles: [45, 135],   // which side the upright beam is pushed to

    split(direction, angle, { pol }) {
      const side = angle === 45 ? LEFT_OF[direction] : RIGHT_OF[direction];
      return [
        { direction, share: throughPolarizer(pol, 0), pol: 0 },                 // ordinary ray
        { direction, share: throughPolarizer(pol, 90), pol: 90, shift: side },  // extraordinary ray
      ];
    },
  },


  /* ---------------- Chapter 5: Colour ---------------- */

  prism: {
    label: "Prism",
    short: "Prism",
    about: "Glass bends blue light more than red, so a prism fans white light out into its colours: that's how rainbows form. On this table it sorts them: red goes straight on, green and blue leave by the two sides.",
    angles: [45, 135],   // which side green goes to (blue goes to the other)

    split(direction, angle, { pol, colours }) {
      const greenSide = angle === 45 ? LEFT_OF[direction] : RIGHT_OF[direction];
      const blueSide = angle === 45 ? RIGHT_OF[direction] : LEFT_OF[direction];
      const way = { red: direction, green: greenSide, blue: blueSide };
      return colours.map((c) => ({
        direction: way[c],
        share: 1 / colours.length,
        pol,
        colours: [c],
      }));
    },
  },

  /* Fluorescent dyes. Each one absorbs some colours and glows in
     another, always a "redder" one (lower energy). The colour a dye
     LOOKS tells you what it absorbs: it looks like the colours it
     doesn't soak up. See makeDye below. */
  dye: makeDye({
    label: "Yellow dye",
    looks: "#d9f23a",
    absorbs: ["blue"],
    glows: "green",
    about: "This dye looks yellow because it soaks up blue light (yellow is what's left of white light without the blue). Blue light makes it glow green, in every direction. Green or red light can't: they don't carry enough energy.",
  }),

  "dye-orange": makeDye({
    label: "Orange dye",
    looks: "#ff9a2e",
    absorbs: ["blue", "green"],
    glows: "red",
    about: "This dye looks orange because it soaks up blue and green light. Either one makes it glow red, in every direction. Red light can't make it glow: it doesn't carry enough energy.",
  }),
};


/* ---------------------------------------------------------------------
   Dichroic mirrors: one for each colour. A dichroic mirror is a glass
   plate with a special coating that reflects one colour and lets the
   others straight through. They're named "dichroic-red",
   "dichroic-green" and "dichroic-blue".
   --------------------------------------------------------------------- */
for (const colour of ALL_COLOURS) {
  const Name = colour[0].toUpperCase() + colour.slice(1);
  PIECES[`dichroic-${colour}`] = {
    label: `${Name} dichroic`,
    short: "Dichroic",
    colour,
    about: `A dichroic mirror has a coating that reflects one colour and lets the rest through. This one reflects ${colour} light like a mirror; every other colour passes straight on.`,
    angles: [45, 135],

    split(direction, angle, { pol, colours }) {
      const outputs = [];
      const rest = colours.filter((c) => c !== colour);
      if (colours.includes(colour)) {
        outputs.push({
          direction: reflect(direction, angle),
          share: 1 / colours.length,
          pol: reflectPol(pol),
          colours: [colour],
        });
      }
      if (rest.length > 0) {
        outputs.push({ direction, share: rest.length / colours.length, pol, colours: rest });
      }
      return outputs;
    },
  };
}


/* ---------------------------------------------------------------------
   reflect — which way a beam goes after bouncing off a surface at 45°
   or 135°. Shared by the mirror and the beam splitter.
   --------------------------------------------------------------------- */

// Surface like  /   e.g. a beam travelling right is sent up.
const REFLECT_45 = { right: "up", up: "right", left: "down", down: "left" };

// Surface like  \   e.g. a beam travelling right is sent down.
const REFLECT_135 = { right: "down", down: "right", left: "up", up: "left" };

function reflect(direction, angle) {
  return angle === 45 ? REFLECT_45[direction] : REFLECT_135[direction];
}

/* The direction a quarter turn to the left or right of travel.
   (A beam going right has "up" on its left.) */
const LEFT_OF = { right: "up", up: "left", left: "down", down: "right" };
const RIGHT_OF = { right: "down", down: "left", left: "up", up: "right" };



/* ---------------------------------------------------------------------
   makeDye — builds a fluorescent dye piece.
     looks     the colour it's drawn in
     absorbs   the colours that make it glow
     glows     the colour of its glow
   The glow goes out on all four sides, a quarter each, and is
   unpolarized (the dye forgets the light's polarization). Colours it
   doesn't absorb are simply stopped.
   --------------------------------------------------------------------- */
function makeDye({ label, looks, absorbs, glows, about }) {
  return {
    label,
    short: "Dye",
    looks,
    about,
    more: DYE_MORE,
    angles: [0],

    split(direction, angle, { colours }) {
      const absorbed = colours.filter((c) => absorbs.includes(c)).length / colours.length;
      if (absorbed === 0) return [];
      return ["up", "down", "left", "right"].map((d) => ({
        direction: d,
        share: absorbed / 4,
        pol: null,
        colours: [glows],
      }));
    },
  };
}
