// THE POND · marker comic. A storybook pond on a fine day: a flat sky with two comic clouds and
// a sun, rolling hills in two greens with hard shadow shapes, lollipop trees, the ducks' own
// little house on stilts at the water's edge, and the pond itself in three flat bands of blue.
// The static plate is drawn once per scale and cached; the water's moving glints are drawn per frame.
import { Gfx, PENCIL, rng, type Env, type Layer, type P } from "../core";
import { clipped, fillShape, mix, smooth } from "../gallery";
import { INK, LIGHT, contour, ellipse, roundRect, shift, stroke } from "./kit";

export const POND = {
  SKY: "#8fd6f2", SKY_L: "#c9eefa", SUN: "#ffe27a",
  HILL_B: "#9ad67e", HILL_BS: "#79bd63", HILL_F: "#6cc160", HILL_FS: "#4f9f4a",
  TREE: "#3fa457", TREE_S: "#2b7f45", TRUNK: "#8a5a3c",
  FAR: "#86dbe8", WATER: "#45b5d0", DEEP: "#2f93bf", GLINT: "#e8fbff",
  HORIZON: 560,
};

// a clump of circles inked as ONE shape: expanded ink discs first, then the cel fills over them
const clump = (g: Gfx, discs: [number, number, number][], col: string, shade: string, seed: number, line = 6, lift = 9) => {
  discs.forEach(([x, y, r], i) => fillShape(g, ellipse(x, y, r + line * 0.6 + (i % 2) * 0.6, r + line * 0.6, 30), INK));
  discs.forEach(([x, y, r]) => fillShape(g, ellipse(x, y, r, r, 30), shade));
  discs.forEach(([x, y, r]) => { const d = ellipse(x, y, r, r, 30); clipped(g, d, () => fillShape(g, shift(d, LIGHT[0] * lift, LIGHT[1] * lift), col)); });
  void seed;
};

const sky = (g: Gfx, W: number) => {
  g.group("plain", () => {
    fillShape(g, [[0, 0], [W, 0], [W, POND.HORIZON], [0, POND.HORIZON]], POND.SKY);
    // the paler band near the horizon, a hard comic edge with a little wave in it
    const band: P[] = [[0, POND.HORIZON]]; for (let i = 0; i <= 20; i++) band.push([(W * i) / 20, 330 + Math.sin(i * 0.9) * 8]); band.push([W, POND.HORIZON]);
    fillShape(g, band, POND.SKY_L);
    // the sun, top right, with short comic rays
    const sun = ellipse(920, 150, 62, 62, 36);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.2; stroke(g, [[920 + Math.cos(a) * 84, 150 + Math.sin(a) * 84], [920 + Math.cos(a) * 112, 150 + Math.sin(a) * 112]], 6, 70 + i, { shadow: 0 }, "#ffc94a"); }
    fillShape(g, sun, "#ffc94a"); clipped(g, sun, () => fillShape(g, shift(sun, -10, -12), POND.SUN));
    contour(g, sun, 5.5, 60);
    clump(g, [[150, 170, 36], [196, 150, 48], [246, 168, 38], [205, 186, 30]], "#ffffff", "#d7eef8", 81, 5.5);
    clump(g, [[640, 110, 28], [676, 94, 38], [716, 112, 28]], "#ffffff", "#d7eef8", 82, 5);
  });
};

const hills = (g: Gfx, W: number) => {
  g.group("plain", () => {
    const H = POND.HORIZON;
    const ridge = (y0: number, amp: number, ph: number, n = 24): P[] => Array.from({ length: n + 1 }, (_, i) => [(-40 + ((W + 80) * i) / n), y0 + Math.sin(i * 0.42 + ph) * amp + Math.sin(i * 0.17 + ph * 2) * amp * 0.8] as P);
    const back = ridge(430, 26, 0.6), front = ridge(492, 22, 2.4);
    const fillBelow = (r: P[], col: string, shade: string) => {
      const s: P[] = [...r, [W + 40, H + 10], [-40, H + 10]];
      fillShape(g, s, shade); clipped(g, s, () => fillShape(g, shift(s, -60, -14), col));
      stroke(g, r, 6, 90, { shadow: 0.5, taper: [0.02, 0.02] });
    };
    fillBelow(back, POND.HILL_B, POND.HILL_BS);
    // trees on the back ridge: lollipops, trunk then canopy
    const r = rng(404);
    [[250, 0.9], [330, 1.1], [770, 1.15], [850, 0.9], [1010, 1.05]].forEach(([x, s], i) => {
      const yb = 430 + Math.sin((x / (W + 80)) * 24 * 0.42 + 0.6) * 26 + 4, h = 46 * s;
      const trunk = roundRect(x - 6 * s, yb - h, 12 * s, h + 10, 4);
      fillShape(g, trunk, POND.TRUNK); contour(g, trunk, 4, 100 + i);
      const cr = 34 * s;
      clump(g, [[x - cr * 0.55, yb - h - cr * 0.3, cr * 0.7], [x + cr * 0.5, yb - h - cr * 0.25, cr * 0.72], [x, yb - h - cr * 0.85, cr * 0.85]], POND.TREE, POND.TREE_S, 110 + i, 6);
      void r;
    });
    fillBelow(front, POND.HILL_F, POND.HILL_FS);
    // a few grass ticks on the front hill
    for (let i = 0; i < 18; i++) { const x = 40 + i * 58 + (i % 3) * 9, y = 520 + (i % 4) * 9; stroke(g, [[x, y], [x + 5, y - 12]], 3, 130 + i, { shadow: 0 }, POND.HILL_FS); stroke(g, [[x + 9, y], [x + 11, y - 9]], 3, 150 + i, { shadow: 0 }, POND.HILL_FS); }
  });
};

const water = (g: Gfx, W: number, H: number) => {
  g.group("plain", () => {
    const y0 = POND.HORIZON;
    fillShape(g, [[0, y0], [W, y0], [W, H], [0, H]], POND.DEEP);
    const wave = (y: number, amp: number, ph: number): P[] => Array.from({ length: 25 }, (_, i) => [(W * i) / 24, y + Math.sin(i * 0.8 + ph) * amp] as P);
    fillShape(g, [[0, y0], [W, y0], ...wave(1200, 10, 1).reverse()], POND.WATER);
    fillShape(g, [[0, y0], [W, y0], ...wave(690, 7, 2.2).reverse()], POND.FAR);
    // the shore: a bright line of foam where the hill meets the water
    stroke(g, wave(y0 + 2, 2, 0.4), 7, 160, { shadow: 0, taper: [0.02, 0.02] }, "#f3fdff");
    stroke(g, wave(y0 - 4, 2, 0.4), 5, 161, { shadow: 0, taper: [0.02, 0.02] });
  });
};

// the ducks' house: a little red-roofed hut on stilts, its round door glowing
const house = (g: Gfx) => {
  g.group("plain", () => {
    const x = 60, y = 430, w = 150, h = 112;
    for (let i = 0; i < 3; i++) { const sx = x + 22 + i * 52; const leg = roundRect(sx, y + h - 6, 12, 92, 4); fillShape(g, leg, POND.TRUNK); contour(g, leg, 4, 200 + i); }
    const ramp: P[] = [[x + w - 10, y + h - 4], [x + w + 70, y + h + 86], [x + w + 54, y + h + 94], [x + w - 26, y + h + 6]];
    fillShape(g, ramp, "#c98b55"); contour(g, ramp, 4, 210);
    [0.3, 0.55, 0.8].forEach((t, i) => stroke(g, [[x + w - 18 + 80 * t - 10, y + h + 90 * t - 2], [x + w - 18 + 80 * t + 8, y + h + 90 * t - 14]], 3, 211 + i, { shadow: 0 }, "#8a5a3c"));
    const wall = roundRect(x, y, w, h, 8);
    fillShape(g, wall, "#ead2a8"); clipped(g, wall, () => fillShape(g, shift(wall, -16, -12), "#fff0d2"));
    contour(g, wall, 6, 220);
    const door = ellipse(x + w * 0.5, y + h * 0.58, 30, 34, 28);
    fillShape(g, door, "#ff9f3a"); clipped(g, door, () => fillShape(g, ellipse(x + w * 0.5 - 6, y + h * 0.58 - 6, 20, 24, 20), "#ffd36e"));
    contour(g, door, 4.5, 221);
    const roof: P[] = smooth([[x - 26, y + 14], [x + w * 0.5, y - 62], [x + w + 26, y + 14], [x + w * 0.5, y + 4]], true, 4);
    fillShape(g, roof, "#c0352c"); clipped(g, roof, () => fillShape(g, shift(roof, -14, -10), "#ec5545"));
    contour(g, roof, 6, 222);
    [0.25, 0.5, 0.75].forEach((t, i) => stroke(g, [[x - 20 + (w + 40) * t * 0.5, y + 8 - 66 * t], [x + w + 20 - (w + 40) * t * 0.5, y + 8 - 66 * t]], 3, 223 + i, { shadow: 0 }, "#9e2a22", 0.6));
  });
};

// a lily pad seen at the pond's angle: an ellipse with its notch, two greens, veins, the contour
export const padShapeP = (cx: number, cy: number, rx: number, ry: number, notch: number): P[] => {
  const rim: P[] = []; for (let i = 0; i <= 40; i++) { const a = notch + 0.22 + (i / 40) * (Math.PI * 2 - 0.44); rim.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return [[cx, cy], ...rim];
};
export const padInPerspective = (g: Gfx, cx: number, cy: number, rx: number, notch: number, seed: number, flower = false, squash = 0.42, col = "#56bb5c", glow = 0) => {
  const ry = rx * squash, pad = padShapeP(cx, cy, rx, ry, notch);
  g.group("plain", () => {
    fillShape(g, shift(pad, 6, 10), "#0d4f66", 0.35);
    fillShape(g, pad, "#2f9a4f"); clipped(g, pad, () => { fillShape(g, shift(pad, -10, -7), glow ? mix(col, "#fff3a0", glow) : col); fillShape(g, ellipse(cx - rx * 0.35, cy - ry * 0.3, rx * 0.3, ry * 0.25, 16), "#a6e486", 0.7); });
    for (let i = 0; i < 9; i++) { const a = notch + 0.4 + (i / 8) * (Math.PI * 2 - 0.8); stroke(g, [[cx, cy], [cx + Math.cos(a) * rx * 0.8, cy + Math.sin(a) * ry * 0.8]], 2.2, seed + i, { shadow: 0, taper: [0.1, 0.5] }, "#1c6a3a", 0.6); }
    contour(g, pad, 5, seed + 20);
    if (flower) {
      const fx = cx + rx * 0.15, fy = cy - ry * 0.3;
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.42, l = 34 + (i % 2) * 6; const tip: P = [fx + Math.cos(a) * l, fy + Math.sin(a) * l * 0.9], nx = -Math.sin(a) * 10, ny = Math.cos(a) * 10; const pt = smooth([[fx, fy], [fx + Math.cos(a) * l * 0.5 + nx, fy + Math.sin(a) * l * 0.45 + ny], tip, [fx + Math.cos(a) * l * 0.5 - nx, fy + Math.sin(a) * l * 0.45 - ny]], true, 5); fillShape(g, pt, "#f2a2bd"); clipped(g, pt, () => fillShape(g, shift(pt, -4, -4), "#ffd3e2")); contour(g, pt, 3, seed + 40 + i); }
      const eye = ellipse(fx, fy - 4, 9, 7, 14); fillShape(g, eye, "#ffcc2e"); contour(g, eye, 2.6, seed + 60);
    }
  });
};

export const pondPlate = (env: Env): Layer => {
  const key = `duckcode:pond:${env.scale}:${env.W}x${env.H}`, hit = env.cache.get(key) as Layer | undefined;
  if (hit) return hit;
  const L = env.canvas(Math.round(env.W * env.scale), Math.round(env.H * env.scale)), g = new Gfx(L.ctx, env, 0, PENCIL);
  L.ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  sky(g, env.W); hills(g, env.W); water(g, env.W, env.H); house(g);
  padInPerspective(g, 1010, 700, 70, 2.6, 3501, true);
  padInPerspective(g, 60, 1000, 64, 0.4, 3502);
  padInPerspective(g, 1040, 1150, 50, 3.4, 3503);
  env.cache.set(key, L);
  return L;
};

// the moving part of the water: short glints that drift and breathe, every frame
export const waterGlints = (g: Gfx, f: number, W: number, H: number) => {
  g.group("plain", () => {
    const r = rng(777);
    for (let i = 0; i < 26; i++) {
      const y = POND.HORIZON + 40 + r() * (H - POND.HORIZON - 60), depth = (y - POND.HORIZON) / (H - POND.HORIZON);
      const len = 30 + r() * 60 * (0.5 + depth), speed = 0.25 + r() * 0.35, ph = r() * 6.28;
      const x = ((r() * (W + 200) + f * speed) % (W + 200)) - 100;
      const a = 0.35 + 0.35 * Math.sin(f * 0.05 + ph);
      const pts: P[] = [[x, y], [x + len * 0.5, y - 2 - depth * 2], [x + len, y]];
      stroke(g, pts, 3 + depth * 3, 900 + i, { shadow: 0, taper: [0.4, 0.4] }, i % 3 ? POND.GLINT : mix(POND.GLINT, POND.FAR, 0.4), a);
    }
  });
};
