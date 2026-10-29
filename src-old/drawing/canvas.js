/* =====================================================================
   LASER MAZE  —  drawing/canvas.js
   ---------------------------------------------------------------------
   Small tools every drawing file shares: sizing a canvas to fit the
   screen, and drawing a straight line.
   ===================================================================== */


/* ---------------------------------------------------------------------
   sizeBoard — makes a table fit the screen.
   It picks a cell size that fits the available width, then sets the
   canvas to exactly rows × cols cells. Used for the game board and for
   the small picture on the start screen.
   "devicePixelRatio" keeps lines sharp on phones and Retina screens.
   --------------------------------------------------------------------- */
export function sizeBoard(canvas, rows, cols, maxWidth) {
  const wrap = canvas.parentElement;
  const available = Math.min(wrap.clientWidth, maxWidth);
  const cell = Math.floor(available / cols);   // size of one cell
  const width = cell * cols;
  const height = cell * rows;
  const dpr = window.devicePixelRatio || 1;

  canvas.style.width = width + "px";     // size on screen
  canvas.style.height = height + "px";
  canvas.width = width * dpr;            // real pixels inside the canvas
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d");   // ctx = the "pen" we draw with
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, cell, width, height };
}


/* Draw a straight line from (x1, y1) to (x2, y2). */
export function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
