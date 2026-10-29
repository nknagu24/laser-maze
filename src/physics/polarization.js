/* =====================================================================
   LASER MAZE  —  physics/polarization.js
   ---------------------------------------------------------------------
   Everything about polarization in one place, used by the pieces and
   by the detectors.

   A beam's polarization ("pol") is one of:
     0, 45, 90, 135   linear: the wave wiggles along that angle
                      (0 —   45 /   90 |   135 \), seen along the beam
     "R"              right-handed circular: the wiggle spins round
     "L"              left-handed circular: it spins the other way
     null             unpolarized: a jumble of every direction

   All angles here are multiples of 45°, so every rule below is exact.
   ===================================================================== */


/* Keeps an angle between 0 and 179, e.g. 180 → 0, −45 → 135.
   (A wiggle along 180° is the same as along 0°.) */
export function normalize(angle) {
  return ((angle % 180) + 180) % 180;
}

export function isCircular(pol) {
  return pol === "R" || pol === "L";
}

/* Swaps R and L; leaves everything else alone. */
export function flipHand(pol) {
  if (pol === "R") return "L";
  if (pol === "L") return "R";
  return pol;
}


/* ---------------------------------------------------------------------
   reflectPol — what a mirror does to polarization.
   Reflection reverses circular light's handedness: R comes back as L.
   (It's like a spinning top seen in a mirror.) Linear light keeps its
   angle in this game.
   --------------------------------------------------------------------- */
export function reflectPol(pol) {
  return flipHand(pol);
}


/* ---------------------------------------------------------------------
   throughPolarizer — Malus's law. Returns how much of the light gets
   through a polarizer whose axis is at `axis`:
     linear light     cos²(angle difference)
     circular light   always half
     unpolarized      always half
   --------------------------------------------------------------------- */
export function throughPolarizer(pol, axis) {
  if (pol === null || isCircular(pol)) return 0.5;
  const difference = ((pol - axis) * Math.PI) / 180;
  const share = Math.cos(difference) ** 2;
  // cos²90° should be exactly 0, but computers give 0.0000…0037;
  // round such crumbs down to a clean 0.
  return share < 1e-9 ? 0 : share;
}


/* ---------------------------------------------------------------------
   halfWave — a half-wave plate with its axis at `axis`.
   It mirrors linear polarization across the axis: an angle that was
   d degrees one side of the axis ends up d degrees the other side.
   So a plate at 45° turns — (0°) into | (90°). It also swaps R and L.
   No light is lost.
   --------------------------------------------------------------------- */
export function halfWave(pol, axis) {
  if (pol === null) return null;
  if (isCircular(pol)) return flipHand(pol);
  return normalize(2 * axis - pol);
}


/* ---------------------------------------------------------------------
   quarterWave — a quarter-wave plate with its axis at `axis`.
   It converts between linear and circular light:
     linear 45° anticlockwise of the axis  →  R
     linear 45° clockwise of the axis      →  L
     R  →  linear 45° clockwise of the axis
     L  →  linear 45° anticlockwise of the axis
     linear along or across the axis       →  unchanged
   Two quarter-wave plates in a row act like one half-wave plate.
   No light is lost.
   --------------------------------------------------------------------- */
export function quarterWave(pol, axis) {
  if (pol === null) return null;
  if (pol === "R") return normalize(axis - 45);
  if (pol === "L") return normalize(axis + 45);

  const offset = normalize(pol - axis);
  if (offset === 45) return "R";
  if (offset === 135) return "L";
  return pol;   // along (0) or across (90) the axis: unchanged
}


/* ---------------------------------------------------------------------
   acceptedShare — how much of a beam a detector counts.
   Most detectors count everything. A detector with an "accepts"
   setting only counts one kind of polarization, like a real detector
   with an analyzer in front of it:
     accepts: 90    counts the part wiggling at 90° (Malus's law)
     accepts: "R"   counts the right-handed part:
                    R → all, L → none, linear or unpolarized → half
   --------------------------------------------------------------------- */
export function acceptedShare(detector, pol) {
  const wants = detector.accepts;
  if (wants === undefined) return 1;

  if (isCircular(wants)) {
    if (pol === wants) return 1;
    if (isCircular(pol)) return 0;   // the opposite hand
    return 0.5;
  }
  return throughPolarizer(pol, wants);
}
