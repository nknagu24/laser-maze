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
  showLabels: true,     // print names ("Mirror", "Laser"…) under things on the table
  toastSeconds: 2.5,    // how long a "Not there!" pop-up stays on screen

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
    detector:     "#3e5f7d",                 // detector body: steel blue, so it stands out from the table
    detectorEdge: "#8fb3d4",                 // detector outline
    sensorOff:   "#0d0f13",                 // detector window when dark
    sensorOn:    "#5dffa0",                 // detector window when it has enough light
    sensorLow:   "#ffb000",                 // detector window with some light, but not enough
    sensorHigh:  "#ff4d4d",                 // detector window with too much light
    label:       "#c9d1dc",                 // small numbers printed on detectors
    wall:        "#0a0b0e",                 // beam block
    wallEdge:    "#4a505e",                 // beam block outline and hatching

    mount:       "#2c313c",                 // round base a mirror stands on
    mountFixed:  "#6b4f1d",                 // base of a bolted-down (fixed) piece
    mirrorFace:  "#dfe7f1",                 // silvered front of a mirror
    mirrorBack:  "#7d8696",                 // darker back of a mirror
    glass:       "rgba(150, 200, 255, 0.22)", // the glass cube of a beam splitter
    glassEdge:   "#9fc4ff",                 // its outline
    filter:      "#2a2f3a",                 // the dark disc of a polarizer
    filterLines: "#c9d1dc",                 // the lines showing a polarizer's axis
    halfWave:    "#2f4a6e",                 // the crystal of a half-wave plate
    quarterWave: "#55346e",                 // the crystal of a quarter-wave plate
    pbsGlass:    "rgba(255, 190, 90, 0.25)", // polarizing beam splitter glass (amber)
    pbsEdge:     "#ffc46b",                 // its outline and marks
    calcite:     "rgba(235, 240, 255, 0.35)", // calcite crystal (clear, slightly milky)
    calciteEdge: "#e8eef8",                 // its outline and arrow
    dye:         "#c8f04a",                 // fluorescent dye (yellow-green)
    dyeEdge:     "#7fa82a",                 // its rim
    polTicks:    "rgba(255, 235, 235, 0.9)", // polarization ticks on the beam
    polBadge:    "rgba(20, 22, 28, 0.9)",  // the small dark disc behind each tick

    labelPill:   "rgba(12, 14, 18, 0.82)", // dark background behind name labels
    labelText:   "#e6ebf2",                 // name label text
    guide:       "#ffd84d",                 // training: glowing hole and turning arrow
    hover:       "rgba(255, 255, 255, 0.10)", // highlight under the pointer
  },
};
