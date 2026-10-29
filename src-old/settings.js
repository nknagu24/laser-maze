/* =====================================================================
   LASER MAZE  —  settings.js
   ---------------------------------------------------------------------
   The numbers and colours you are most likely to tweak. Every drawing
   file reads its colours from here, so changing a value here changes
   it everywhere in the game.
   ===================================================================== */

export const SETTINGS = {
  rows: 8,              // number of cells from top to bottom
  cols: 8,              // number of cells from left to right
  maxBoardSize: 560,    // the board never grows wider than this (pixels)

  colors: {
    table:       "#1c1f26",                 // dark metal surface of the table
    tableEdge:   "#2a2e38",                 // slightly lighter rim around it
    hole:        "#0d0f13",                 // the screw holes themselves
    holeRim:     "#353a46",                 // faint ring around each hole

    beam:        "#ff2a2a",                 // laser colour
    beamGlow:    "rgba(255, 42, 42, 0.45)", // soft halo around the beam
    beamCore:    "#ffe0e0",                 // bright white-hot centre line

    housing:     "#3b414e",                 // metal body of laser and detector
    housingEdge: "#5a6170",                 // its outline
    warning:     "#ffb000",                 // yellow laser-warning stripe
    sensorOff:   "#0d0f13",                 // detector window when dark
    sensorOn:    "#5dffa0",                 // detector window when lit
    wall:        "#0a0b0e",                 // beam block
    wallEdge:    "#4a505e",                 // beam block outline and hatching

    mount:       "#2c313c",                 // round base a mirror stands on
    mountFixed:  "#6b4f1d",                 // base of a bolted-down (fixed) piece
    mirrorFace:  "#dfe7f1",                 // silvered front of a mirror
    mirrorBack:  "#7d8696",                 // darker back of a mirror
    hover:       "rgba(255, 255, 255, 0.10)", // highlight under the pointer
  },
};
