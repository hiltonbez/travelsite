// What's printed on the foil: a dot-matrix world, guilloche security lines, zone rules and the poster type.

export const RED = "#ce2029";
export const COBALT = "#0047ab";
export const CREAM = "#f6ebd0";

const MONO = '"Rubik Mono One", "Arial Black", sans-serif';
const COND = '"Barlow Condensed", "Arial Narrow", sans-serif';

/** A coarse world, one character to a dot. */
const WORLD = [
  "             ###  ##          ####",
  "    ########## ######  #     ###         ##    ##########",
  " ################### ###  #          # ######################",
  "  #  ################ #             # ############################",
  "       ###############            ### ##############################",
  "        ##############           ## ##############################",
  "         ############             ###  ##########################  #",
  "          #########              ### ## ######################  ##",
  "          ######                ####### ####  #############  #",
  "           ####                ############# ###  ######## #",
  "            ###  #             #############   #   ####    ##",
  "              #####             ###########         ## #   # ",
  "               #######            ########           ## #  ##",
  "               #########           ######             #  #  ###",
  "                ########           ######  #             ######",
  "                 ######            #####  ##           ########",
  "                  ####              ####  #            ########",
  "                  ###               ###                 ##   ##",
  "                  ##                                          #",
  "                  #",
];
const WORLD_COLS = 72;
const HOME = { col: 38, row: 17 };

function worldTile(
  x: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  width: number,
  colour: string,
) {
  const step = width / WORLD_COLS;
  x.fillStyle = colour;
  x.beginPath();
  WORLD.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== "#") continue;
      const cx = ox + i * step;
      const cy = oy + j * step;
      x.moveTo(cx + step * 0.36, cy);
      x.arc(cx, cy, step * 0.36, 0, Math.PI * 2);
    }
  });
  x.fill();
  // Home, in red.
  x.fillStyle = RED;
  x.beginPath();
  x.arc(ox + HOME.col * step, oy + HOME.row * step, step * 0.8, 0, Math.PI * 2);
  x.fill();
}

function worldField(
  x: CanvasRenderingContext2D,
  w: number,
  h: number,
  tile: number,
  colour: string,
) {
  const th = (tile / WORLD_COLS) * (WORLD.length + 3);
  let odd = false;
  for (let y = 6; y < h; y += th) {
    for (let px = odd ? -tile / 2 : 0; px < w; px += tile) worldTile(x, px, y, tile * 0.94, colour);
    odd = !odd;
  }
}

/** Interlaced sine waves, the look of banknote borders. */
function guillocheBand(
  x: CanvasRenderingContext2D,
  w: number,
  y: number,
  amp: number,
  colour: string,
  lines = 7,
) {
  x.strokeStyle = colour;
  x.lineWidth = 0.7;
  for (let k = 0; k < lines; k++) {
    x.beginPath();
    for (let px = 0; px <= w; px += 3) {
      const py =
        y +
        Math.sin(px * 0.035 + (k * Math.PI) / lines) * amp * Math.sin(px * 0.0052 + k * 0.5 + 1);
      if (px) x.lineTo(px, py);
      else x.moveTo(px, py);
    }
    x.stroke();
  }
}

/** A spirograph rosette. */
function rosette(
  x: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  colour: string,
  petals = 11,
) {
  x.strokeStyle = colour;
  x.lineWidth = 0.7;
  x.beginPath();
  const r = R / petals;
  const d = R * 0.62;
  for (let t = 0; t <= Math.PI * 2 * 3 + 0.01; t += 0.012) {
    const k = (R - r) * 0.62;
    const px = cx + k * Math.cos(t) + d * Math.cos(((R - r) / r) * t) * 0.62;
    const py = cy + k * Math.sin(t) - d * Math.sin(((R - r) / r) * t) * 0.62;
    if (t) x.lineTo(px, py);
    else x.moveTo(px, py);
  }
  x.stroke();
}

function fitSize(x: CanvasRenderingContext2D, text: string, font: string, width: number) {
  x.font = `100px ${font}`;
  return (100 * width) / x.measureText(text).width;
}

/** Type with the two inks slightly out of register, as a cheap ticket press would print it. */
function pressed(
  x: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  size: number,
  sy: number,
) {
  x.save();
  x.font = `${size}px ${MONO}`;
  x.textAlign = "center";
  x.textBaseline = "alphabetic";
  x.translate(cx, y);
  x.scale(1, sy);
  const off = Math.max(1.5, size * 0.024);
  x.fillStyle = COBALT;
  x.fillText(text, off, off);
  x.fillStyle = RED;
  x.fillText(text, 0, 0);
  x.restore();
}

function label(
  x: CanvasRenderingContext2D,
  text: string,
  px: number,
  py: number,
  size: number,
  colour: string,
  align: CanvasTextAlign = "left",
  spacing = 0,
) {
  x.font = `700 ${size}px ${COND}`;
  x.textAlign = align;
  x.textBaseline = "alphabetic";
  x.fillStyle = colour;
  if ("letterSpacing" in x)
    (x as unknown as { letterSpacing: string }).letterSpacing = `${spacing}px`;
  x.fillText(text, px, py);
  if ("letterSpacing" in x) (x as unknown as { letterSpacing: string }).letterSpacing = "0px";
}

/** The hero's zones, across the screen on a wide one and down it on a tall one. Must match .stw-zones in style.css. */
export const zoneGrid = (w: number, h: number) =>
  w >= h ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 };

export function heroInk(codes: string[], serial: string) {
  return (x: CanvasRenderingContext2D, w: number, h: number) => {
    const wide = w >= h;
    worldField(
      x,
      w,
      h,
      wide ? Math.max(300, w / 4.4) : Math.max(210, w * 0.68),
      "rgba(0,71,171,.3)",
    );
    guillocheBand(x, w, h * 0.09, 18, "rgba(206,32,41,.65)");
    guillocheBand(x, w, h * 0.91, 18, "rgba(206,32,41,.65)");
    rosette(x, wide ? w * 0.13 : w * 0.12, h * 0.8, wide ? 120 : 76, "rgba(0,71,171,.55)");
    rosette(x, wide ? w * 0.87 : w * 0.88, h * 0.2, wide ? 120 : 76, "rgba(206,32,41,.55)", 13);

    // Zones: where the first scratch lands picks the place.
    const { cols, rows } = zoneGrid(w, h);
    x.strokeStyle = "rgba(0,71,171,.5)";
    x.lineWidth = 1;
    x.setLineDash([3, 6]);
    x.beginPath();
    for (let i = 1; i < cols; i++) {
      x.moveTo((w * i) / cols, 0);
      x.lineTo((w * i) / cols, h);
    }
    for (let j = 1; j < rows; j++) {
      x.moveTo(0, (h * j) / rows);
      x.lineTo(w, (h * j) / rows);
    }
    x.stroke();
    x.setLineDash([]);

    // The poster type, as wide as it can go, then stretched tall on a phone.
    const room = wide ? h * 0.5 : h * 0.44;
    const maxW = w * (wide ? 0.86 : 0.92);
    let s1 = fitSize(x, "SCRATCH", MONO, maxW);
    let s2 = fitSize(x, "ANYWHERE", MONO, maxW);
    const cap = 0.74;
    const gap = 0.14;
    let total = (s1 + s2) * cap + s2 * gap;
    let sy = 1;
    if (total > room) {
      s1 *= room / total;
      s2 *= room / total;
      total = room;
    } else {
      sy = Math.min(2.5, room / total);
    }
    const blockH = total * sy;
    const top = h * 0.47 - blockH / 2;
    pressed(x, "SCRATCH", w / 2, top + s1 * cap * sy, s1, sy);
    pressed(x, "ANYWHERE", w / 2, top + (s1 * cap + s2 * gap + s2 * cap) * sy, s2, sy);

    // The rule of the game, on a strip of cobalt.
    const stripSize = Math.max(16, Math.min(30, w * 0.03));
    const strip = "WHERE YOU START DECIDES WHERE YOU LAND";
    x.font = `700 ${stripSize}px ${COND}`;
    const tw = Math.min(w - 24, x.measureText(strip).width + 36);
    const ty = top + blockH + stripSize * 0.9;
    x.save();
    x.translate(w / 2, ty);
    x.rotate(-0.016);
    x.fillStyle = COBALT;
    x.fillRect(-tw / 2, -stripSize * 0.86, tw, stripSize * 1.5);
    label(x, strip, 0, stripSize * 0.26, stripSize, CREAM, "center", 0.5);
    x.restore();
    label(
      x,
      "Every ticket is a real holiday. Nobody loses.",
      w / 2,
      ty + stripSize * 1.75,
      Math.max(15, stripSize * 0.76),
      "#3c2a06",
      "center",
    );

    // Zone tickets, stuck on after the type so none is ever hidden by it. Top row sits under the masthead.
    const codeSize = wide ? 24 : 19;
    codes.forEach((code, n) => {
      const i = n % cols;
      const j = Math.floor(n / cols);
      const zx = (w * i) / cols + 10;
      const zy = j === 0 ? 72 : (h * j) / rows + (wide && j === 1 ? h * 0.33 : 10);
      x.font = `700 ${codeSize}px ${COND}`;
      const cw = x.measureText(code).width + 44;
      x.fillStyle = CREAM;
      x.fillRect(zx, zy, cw, codeSize + 8);
      x.strokeStyle = COBALT;
      x.lineWidth = 1.5;
      x.strokeRect(zx, zy, cw, codeSize + 8);
      label(x, "ZONE", zx + 5, zy + codeSize + 1, 10, RED, "left", 1);
      label(x, code, zx + cw - 6, zy + codeSize + 1, codeSize, COBALT, "right", 1);
    });

    // Serial, along the bottom of the ticket, kept clear of the gallery pill on the left.
    label(x, serial, w - 16, h - (wide ? 84 : 124), wide ? 18 : 14, RED, "right", 2);
  };
}

export function panelInk(code: string, serial: string) {
  return (x: CanvasRenderingContext2D, w: number, h: number) => {
    worldField(x, w, h, Math.max(150, w * 0.8), "rgba(0,71,171,.3)");
    guillocheBand(x, w, h * 0.13, 7, "rgba(206,32,41,.6)", 5);
    guillocheBand(x, w, h * 0.87, 7, "rgba(206,32,41,.6)", 5);
    rosette(x, w / 2, h * 0.5, Math.min(w, h) * 0.46, "rgba(0,71,171,.35)", 9);
    const size = fitSize(x, "SCRATCH", MONO, w * 0.84);
    pressed(x, "SCRATCH", w / 2, h * 0.5 + (size * 0.74 * 1.5) / 2, size, 1.5);
    label(x, code, 10, 30, 22, COBALT, "left", 1);
    label(x, serial, w - 10, h - 12, 13, RED, "right", 1);
  };
}

export function windowInk(word: string) {
  return (x: CanvasRenderingContext2D, w: number, h: number) => {
    worldField(x, w, h, Math.max(170, w * 0.7), "rgba(0,71,171,.28)");
    guillocheBand(x, w, h * 0.16, 7, "rgba(206,32,41,.6)", 5);
    guillocheBand(x, w, h * 0.84, 7, "rgba(206,32,41,.6)", 5);
    const size = Math.min(fitSize(x, word, MONO, w * 0.8), h * 0.42);
    pressed(x, word, w / 2, h * 0.5 + size * 0.37, size, 1);
  };
}
