// THE DUCK · marker comic. A rubber duck seen from the side and a touch from the front, facing
// right: a boat-shaped body with the tail flicked up behind, a big round head set forward on the
// chest, a flat rounded bill, one glossy eye, a blush. Its value is painted on a white roundel on
// the chest, the way a racing boat wears its number.
//
// Marker order (koi.ts): flat yellow cel, the hard shade shape on the side away from the light,
// gel-pen whites, the heavy brush contour LAST. Everything below the waterline is hidden by the
// water: a floating duck shows its top two thirds, a hopping duck shows all of it.
import { Gfx, rng, type P } from "../core";
import { clipped, fillShape, mix, smooth } from "../gallery";
import { INK, LIGHT, contour, ellipse, shift, stroke, text } from "./kit";

export const DUCK = { Y: "#ffd23a", YS: "#f39c12", YL: "#fff4b0", BILL: "#ff8b3d", BILLS: "#d9571c", CHEEK: "#ff8fa6", ROUND: "#fffaf0", ROUNDS: "#e7d9bd" };
export type Eye = "open" | "happy" | "blink" | "wide" | "worried" | "closed";
export type DuckPose = {
  x: number; y: number;       // the waterline under the duck's middle (world)
  k: number;                  // overall scale
  lift: number;               // world px above the water
  sx?: number; sy?: number;   // squash and stretch about the duck's base
  tilt?: number;              // radians, + = leans forward (nose down)
  eye?: Eye; look?: number;   // look: pupil shift -1..1 (back..forward)
  label: string; seed: number;
  tint?: number;              // 0..1 a warm glow on the body (found!)
  mouth?: number;             // 0..1 bill open (a quack)
};

// the duck in its own frame: origin on the waterline at its middle, y up is negative, ~210 wide
const BODY_CTRL: P[] = [[-104, -74], [-86, -46], [-56, -36], [-16, -40], [26, -46], [72, -34], [96, -4], [88, 26], [52, 44], [0, 50], [-52, 44], [-88, 22], [-104, -10], [-112, -50]];
const BODY = smooth(BODY_CTRL, true, 8);
const HEAD_C: P = [40, -100], HEAD_R: P = [52, 49];
const HEAD = ellipse(HEAD_C[0], HEAD_C[1], HEAD_R[0], HEAD_R[1], 36);
const BILL_UP = smooth([[80, -104], [104, -106], [130, -98], [134, -88], [118, -82], [94, -82], [82, -86]], true, 6);
const BILL_LO = smooth([[86, -86], [110, -84], [124, -80], [116, -72], [96, -72], [86, -78]], true, 6);
const WING = smooth([[2, -18], [-14, -34], [-46, -34], [-74, -22], [-64, -12], [-74, -4], [-58, 2], [-62, 10], [-36, 8], [-10, 4]], true, 6);
const ROUND_C: P = [44, 4], ROUND_R = 30;
export const WATERLINE = 30; // local y where the water cuts the body when afloat

// the head's top in world coords, for whatever sits on it (the pointer hat)
export const headTop = (p: DuckPose): P => tf(p)([HEAD_C[0] - 4, HEAD_C[1] - HEAD_R[1] + 4]);
export const duckCenter = (p: DuckPose): P => tf(p)([10, -40]);

const tf = (p: DuckPose) => {
  const sx = p.sx ?? 1, sy = p.sy ?? 1, t = p.tilt ?? 0, c = Math.cos(t), s = Math.sin(t);
  return ([x, y]: P): P => { const X = x * sx, Y = (y - 50) * sy + 50; return [p.x + (X * c - (Y - 50) * s) * p.k, p.y - p.lift + ((X * s + (Y - 50) * c) + 50) * p.k]; };
};

// the water's skin across the duck: a gentle wave, in world coords
const waterClip = (p: DuckPose, f: number): P[] => {
  const w = 170 * p.k, y0 = p.y + WATERLINE * p.k, pts: P[] = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24, x = p.x - w + 2 * w * u; pts.push([x, y0 + Math.sin(u * 9 + f * 0.12 + p.seed) * 2.2 * p.k]); }
  return [[p.x - w, p.y - 600 * p.k], ...pts, [p.x + w, p.y - 600 * p.k]];
};

export const drawDuck = (g: Gfx, p: DuckPose, f: number) => {
  const T = tf(p), map = (s: P[]) => s.map(T), k = p.k, sub = p.lift < 40 * k; // afloat: the water hides the keel
  const lx = LIGHT[0], ly = LIGHT[1];
  const sink = Math.max(0, 1 - p.lift / (60 * k));
  // its shadow on the water, shrinking as it rises
  g.group("plain", () => {
    const sh = ellipse(p.x + 8 * k, p.y + 24 * k, 118 * k * (0.55 + 0.45 * sink), 16 * k * (0.55 + 0.45 * sink), 30);
    fillShape(g, sh, "#145f7a", 0.28 + 0.12 * sink);
  });
  g.group("plain", () => {
    const body = () => {
      const b = map(BODY), bl = map(shift(BODY, lx * 16, ly * 16));
      // tail and body: shade cel, the lit flat pushed toward the light, a warm reflected rim
      fillShape(g, b, DUCK.YS);
      clipped(g, b, () => { fillShape(g, bl, p.tint ? mix(DUCK.Y, "#ffe58a", p.tint) : DUCK.Y); fillShape(g, map(ellipse(-60, -50, 34, 12, 20, -0.4)), DUCK.YL, 0.9); });
      // the wing: a shade-side cel and three feather notches
      const w = map(WING), wl = map(shift(WING, lx * 7, ly * 7));
      fillShape(g, w, DUCK.YS); clipped(g, w, () => fillShape(g, wl, mix(DUCK.Y, DUCK.YS, 0.25)));
      contour(g, w, 3.6, p.seed + 3);
      [[[-58, 2], [-46, -4]], [[-62, -10], [-48, -14]], [[-66, -21], [-52, -24]]].forEach((s, i) => stroke(g, map(s as P[]), 2.6, p.seed + 10 + i));
      // the chest roundel and its number
      const r = map(ellipse(ROUND_C[0], ROUND_C[1], ROUND_R, ROUND_R * 0.98, 28)), rl = map(ellipse(ROUND_C[0] + lx * 5, ROUND_C[1] + ly * 5, ROUND_R, ROUND_R * 0.98, 28));
      fillShape(g, r, DUCK.ROUNDS); clipped(g, r, () => fillShape(g, rl, DUCK.ROUND));
      contour(g, r, 3.4, p.seed + 4);
      const c = T(ROUND_C), size = (p.label.length > 2 ? 26 : p.label.length > 1 ? 32 : 38) * k * Math.min(p.sx ?? 1, p.sy ?? 1);
      text(g, p.label, c[0], c[1] + 2 * k, { size, weight: 700, fill: INK });
      // the body's contour, heavy, last
      contour(g, b, 7.5 * k, p.seed + 1, { min: 0.4 });
      // gel-pen gloss along the back
      stroke(g, map(smooth([[-92, -60], [-76, -44], [-50, -38]], false, 6)), 4.2 * k, p.seed + 7, { shadow: 0, taper: [0.4, 0.4] }, "#ffffff", 0.9);
    };
    // the water hides what's below it while the duck floats
    if (sub) clipped(g, waterClip(p, f), body); else body();

    // the head: shade cel, lit flat, a glint, the contour
    const h = map(HEAD), hl = map(shift(HEAD, lx * 13, ly * 13));
    fillShape(g, h, DUCK.YS); clipped(g, h, () => { fillShape(g, hl, p.tint ? mix(DUCK.Y, "#ffe58a", p.tint) : DUCK.Y); });
    // the bill: lower jaw (opens on a quack), then the upper
    const mo = p.mouth ?? 0, lo = BILL_LO.map(([x, y]) => [x + mo * 2, y + mo * 12 * Math.max(0, (x - 84) / 40)] as P);
    if (mo > 0.05) fillShape(g, map(smooth([[88, -86], [120, -86], [118, -86 + mo * 14], [94, -78 + mo * 6]], true, 4)), "#8a2a1a");
    fillShape(g, map(lo), DUCK.BILLS); contour(g, map(lo), 3.4, p.seed + 20);
    const bu = map(BILL_UP), bul = map(shift(BILL_UP, lx * 5, ly * 5));
    fillShape(g, bu, DUCK.BILLS); clipped(g, bu, () => fillShape(g, bul, DUCK.BILL));
    contour(g, bu, 4.2, p.seed + 21);
    stroke(g, map([[104, -101], [116, -99]]), 2.2, p.seed + 22, { shadow: 0 }, "#ffffff", 0.85); // a nostril glint
    contour(g, h, 7.5 * k, p.seed + 2, { min: 0.4 });
    // gloss on the crown
    stroke(g, map(smooth([[6, -128], [18, -140], [36, -146]], false, 6)), 5 * k, p.seed + 8, { shadow: 0, taper: [0.4, 0.4] }, "#ffffff", 0.95);

    // blush and eye
    fillShape(g, map(ellipse(60, -80, 13, 7, 18)), DUCK.CHEEK, 0.85);
    drawEye(g, p, T, f);
  });
  // where it meets the water: two broken rings of light on the skin
  if (p.lift < 30 * k) g.group("plain", () => {
    const y0 = p.y + WATERLINE * k, a = 1 - p.lift / (30 * k), r = rng(p.seed * 7 + 1);
    [[-120, -40], [-20, 30], [50, 128]].forEach(([u0, u1], i) => {
      const pts: P[] = []; for (let j = 0; j <= 8; j++) { const u = u0 + ((u1 - u0) * j) / 8; pts.push([p.x + u * k, y0 + 3 * k + Math.sin(u * 0.05 + f * 0.1 + i) * 2 * k]); }
      stroke(g, pts, (4.2 - i * 0.4) * k, p.seed + 30 + i, { shadow: 0, taper: [0.35, 0.35] }, "#e8fbff", 0.85 * a);
    });
    void r;
  });
};

// the eye: a tall glossy oval, or a happy ^, or a blink
const drawEye = (g: Gfx, p: DuckPose, T: (q: P) => P, f: number) => {
  const e = p.eye ?? "open", look = p.look ?? 0.3, E: P = [58 + look * 4, -110];
  if (e === "happy" || e === "closed") {
    const pts = e === "happy" ? [[E[0] - 11, E[1] + 4], [E[0], E[1] - 9], [E[0] + 11, E[1] + 4]] : [[E[0] - 11, E[1]], [E[0], E[1] + 5], [E[0] + 11, E[1]]];
    stroke(g, smooth((pts as P[]).map(T), false, 6), 5.2 * p.k, p.seed + 40, { taper: [0.25, 0.25] });
    return;
  }
  if (e === "blink") { stroke(g, [[E[0] - 10, E[1] + 1], [E[0] + 10, E[1] + 1]].map((q) => T(q as P)), 4.6 * p.k, p.seed + 41); return; }
  const big = e === "wide" ? 1.28 : 1, rx = 9.5 * big, ry = 13.5 * big;
  fillShape(g, ellipse(...T(E), rx * p.k, ry * p.k, 22, p.tilt ?? 0), INK);
  fillShape(g, ellipse(...T([E[0] - 3 * big, E[1] - 5 * big]), 3.8 * big * p.k, 4.6 * big * p.k, 12), "#ffffff");
  fillShape(g, ellipse(...T([E[0] + 3.5 * big, E[1] + 6 * big]), 1.8 * p.k, 1.8 * p.k, 8), "#ffffff", 0.8);
  if (e === "worried") stroke(g, [[E[0] - 12, E[1] - 22], [E[0] + 8, E[1] - 18]].map((q) => T(q as P)), 4 * p.k, p.seed + 42); // a brow, raised at the back
  void f;
};

// ---------------------------------------------------------------- the pointer hat
// A paper party hat, worn at a jaunty angle, with the pointer's name on it (i, j, lo, hi...).
export const drawHat = (g: Gfx, at: P, k: number, tilt: number, letter: string, seed: number, color = "#ff5fa2") => {
  const c = Math.cos(tilt), s = Math.sin(tilt), R = (x: number, y: number): P => [at[0] + (x * c - y * s) * k, at[1] + (x * s + y * c) * k];
  const cone: P[] = smooth([R(-30, 4), R(-8, -38), R(4, -66), R(14, -40), R(32, 2), R(0, 10)], true, 5);
  g.group("plain", () => {
    fillShape(g, cone, mix(color, "#8a1d55", 0.35));
    clipped(g, cone, () => {
      fillShape(g, shift(cone, LIGHT[0] * 8 * k, LIGHT[1] * 8 * k), color);
      [-0.15, 0.25, 0.62].forEach((v, i) => fillShape(g, [R(-40, 10 - v * 70), R(40, -6 - v * 70), R(40, 4 - v * 70), R(-40, 20 - v * 70)], "#ffe3f0", 0.55 + i * 0));
    });
    contour(g, cone, 4.6 * k, seed);
    const pom = ellipse(...R(4, -68), 10 * k, 10 * k, 16);
    fillShape(g, pom, "#ffe066"); contour(g, pom, 3.2 * k, seed + 1);
    const lc = R(0, -14);
    text(g, letter, lc[0], lc[1], { size: 30 * k, weight: 700, fill: "#ffffff", stroke: INK, sw: 6 * k });
  });
};
