// FX · marker comic props for the duck films: speech bubbles, the "seen" signpost, the magnifier,
// sparkles, hearts, a comic burst, splashes and index tags. Each is drawn whole, in the same hand.
import { Gfx, rng, type P } from "../core";
import { clipped, fillShape, mix, smooth } from "../gallery";
import { INK, LIGHT, contour, ellipse, roundRect, shift, stroke, text, measure } from "./kit";

// a comic speech bubble: rounded box, a tail to the speaker, white flat with a pale shade side.
// parts: [string, colour][] so a result can be picked out in colour.
export const bubble = (g: Gfx, cx: number, cy: number, parts: [string, string][], to: P, q: number, seed: number, size = 40) => {
  if (q <= 0) return;
  const s = Math.max(0.01, q), full = parts.map((p) => p[0]).join(""), w = measure(g, full, size, 700) + 56, h = size + 44;
  const x0 = cx - w / 2, y0 = cy - h / 2, box = roundRect(x0, y0, w, h, 26, 6);
  const tx = Math.max(x0 + 40, Math.min(x0 + w - 40, to[0]));
  const tail: P[] = [[tx - 18, y0 + h - 4], [to[0], to[1]], [tx + 16, y0 + h - 4]];
  const sc = (pts: P[]) => pts.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s] as P);
  g.group("plain", () => {
    const body = sc(box), tl = sc(tail);
    fillShape(g, shift(body, 6, 9), "#0b2a3d", 0.25);
    fillShape(g, tl, INK); fillShape(g, body, "#e3ecf5"); clipped(g, body, () => fillShape(g, shift(body, -8, -8), "#ffffff"));
    contour(g, body, 6 * s, seed);
    fillShape(g, sc([[tx - 12, y0 + h - 8], [to[0] + (tx - to[0]) * 0.25, to[1] - 14], [tx + 10, y0 + h - 8]]), "#ffffff");
    stroke(g, sc([[tx - 16, y0 + h - 2], [to[0], to[1]]]), 5 * s, seed + 1, { taper: [0.05, 0.6] });
    stroke(g, sc([[tx + 16, y0 + h - 2], [to[0], to[1]]]), 5 * s, seed + 2, { taper: [0.05, 0.6] });
    let x = cx - (measure(g, full, size * s, 700)) / 2;
    parts.forEach(([t, col]) => { text(g, t, x, cy + 2 * s, { size: size * s, weight: 700, fill: col, align: "left" }); x += measure(g, t, size * s, 700); });
  });
};

// the dictionary's signpost: a little wooden board on a post, stuck in the pond
export const signpost = (g: Gfx, x: number, y: number, label: string, q: number, seed: number) => {
  if (q <= 0) return;
  const s = q, R = (px: number, py: number): P => [x + px * s, y + py * s];
  g.group("plain", () => {
    const post = [R(-8, -10), R(8, -10), R(8, 70), R(-8, 70)];
    fillShape(g, post, "#8a5a3c"); contour(g, post, 4 * s, seed);
    const board = roundRect(x - 86 * s, y - 64 * s, 172 * s, 70 * s, 12 * s, 4);
    fillShape(g, board, "#b8773f"); clipped(g, board, () => fillShape(g, shift(board, -8, -8), "#d99a5c"));
    [[-70, -40, 40], [10, -18, 54]].forEach(([a, b, l], i) => stroke(g, [R(a, b), R(a + l, b + 2)], 2.6 * s, seed + 5 + i, { shadow: 0 }, "#9a5f30", 0.7));
    contour(g, board, 5.5 * s, seed + 1);
    text(g, label, x, y - 28 * s, { size: 38 * s, weight: 700, fill: "#fff7e6", stroke: INK, sw: 7 * s });
    const rip = ellipse(x, y + 70 * s, 22 * s, 6 * s, 18);
    stroke(g, [...rip, rip[0]], 3, seed + 9, { shadow: 0, taper: [0.3, 0.3] }, "#e8fbff", 0.8);
  });
};

// a magnifying glass, for "is it in there?"
export const magnifier = (g: Gfx, x: number, y: number, k: number, tilt: number, seed: number) => {
  const c = Math.cos(tilt), s = Math.sin(tilt), R = (px: number, py: number): P => [x + (px * c - py * s) * k, y + (px * s + py * c) * k];
  g.group("plain", () => {
    const handle = smooth([R(30, 30), R(70, 70), R(78, 62), R(38, 22)], true, 3);
    fillShape(g, handle, "#8a5a3c"); contour(g, handle, 4 * k, seed);
    const rimO = ellipse(x, y, 44 * k, 44 * k, 30), rimI = ellipse(x, y, 34 * k, 34 * k, 30);
    fillShape(g, rimO, "#7d86a8"); fillShape(g, rimI, "#d7f3ff", 0.55);
    clipped(g, rimI, () => stroke(g, [R(-22, -10), R(-10, -24)], 6 * k, seed + 2, { shadow: 0 }, "#ffffff", 0.9));
    contour(g, rimO, 5 * k, seed + 3); contour(g, rimI, 3.5 * k, seed + 4);
  });
};

// a 4-point sparkle star, gel-pen white with an ink edge
export const sparkle = (g: Gfx, x: number, y: number, r: number, seed: number, col = "#fff6b0") => {
  if (r <= 0.5) return;
  const pts: P[] = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.32 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  g.group("plain", () => { const s = smooth(pts, true, 3); fillShape(g, s, col); contour(g, s, Math.max(2, r * 0.12), seed); });
};

export const heartShape = (cx: number, cy: number, s: number): P[] => Array.from({ length: 24 }, (_, i) => { const t = (i / 24) * Math.PI * 2; return [cx + s * Math.pow(Math.sin(t), 3), cy - (s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))) / 16] as P; });
export const heart = (g: Gfx, x: number, y: number, s: number, seed: number, alpha = 1) => {
  if (s <= 0.5 || alpha <= 0) return;
  g.group("plain", () => { const h = heartShape(x, y, s); fillShape(g, h, "#e8456f"); clipped(g, h, () => fillShape(g, shift(h, -s * 0.18, -s * 0.18), "#ff6f93")); stroke(g, [[x - s * 0.5, y - s * 0.4], [x - s * 0.25, y - s * 0.6]], s * 0.14, seed + 1, { shadow: 0 }, "#ffffff", 0.9); contour(g, h, Math.max(2.5, s * 0.14), seed); }, { alpha });
};

// a comic burst: the jagged star a comic shouts in
export const burst = (g: Gfx, cx: number, cy: number, rx: number, ry: number, q: number, seed: number, col = "#ffd23a") => {
  if (q <= 0) return;
  const r = rng(seed), pts: P[] = [], n = 22;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = (i % 2 ? 0.78 : 1.06 + r() * 0.12) * q; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  g.group("plain", () => {
    fillShape(g, shift(pts, 8, 12), "#0b2a3d", 0.25);
    fillShape(g, pts, mix(col, "#e0761b", 0.5)); clipped(g, pts, () => fillShape(g, shift(pts, LIGHT[0] * 16, LIGHT[1] * 16), col));
    contour(g, pts, 7 * q, seed + 1, { min: 0.5 });
  });
};

// a splash: droplets thrown up and out from where something hit the water, then fallen back
export const splash = (g: Gfx, x: number, y: number, t: number, seed: number, k = 1) => {
  if (t <= 0 || t >= 1) return;
  const r = rng(seed);
  g.group("plain", () => {
    // the ring spreading on the skin
    const ring = ellipse(x, y, (40 + 110 * t) * k, (8 + 22 * t) * k, 30);
    stroke(g, [...ring, ring[0]], 5 * (1 - t) * k + 1, seed + 1, { shadow: 0, taper: [0.3, 0.3] }, "#f3fdff", 1 - t);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.2, v = (90 + r() * 70) * k, px = x + Math.cos(a) * v * t * 1.1, py = y + Math.sin(a) * v * t * 1.6 + 260 * t * t * k, rr = (7 + r() * 6) * (1 - t * 0.6) * k;
      const d = ellipse(px, py, rr, rr * 1.15, 12);
      fillShape(g, d, "#d9f6ff"); contour(g, d, 2.6 * k, seed + 10 + i);
    }
  });
};

// an index tag under a duck: a little round plaque floating on the water
export const indexTag = (g: Gfx, x: number, y: number, s: string, seed: number, hot = 0) => {
  g.group("plain", () => {
    const w = 46, b = roundRect(x - w / 2, y - 20, w, 40, 14, 4);
    fillShape(g, b, hot > 0 ? mix("#1f6f8f", "#ff5fa2", hot) : "#1f6f8f", 0.9);
    contour(g, b, 3.5, seed);
    text(g, s, x, y + 1, { size: 26, weight: 700, fill: "#ffffff" });
  });
};

// a ring on the water around a duck: the reference's state marker (current, seen, answer)
export const waterRing = (g: Gfx, x: number, y: number, k: number, col: string, q: number, seed: number) => {
  if (q <= 0) return;
  g.group("plain", () => {
    const o = ellipse(x, y, 118 * k * (0.8 + 0.2 * q), 24 * k * (0.8 + 0.2 * q), 40), i = ellipse(x, y, 98 * k * (0.8 + 0.2 * q), 16 * k * (0.8 + 0.2 * q), 40);
    const ring: P[] = [...o, o[0], ...[...i, i[0]].reverse()];
    const c = g.cur; c.save(); c.globalAlpha = q; c.fillStyle = col; c.beginPath(); ring.forEach(([px, py], j) => (j ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.fill("evenodd"); c.restore();
    g.touch(x - 130 * k, y - 30 * k, x + 130 * k, y + 30 * k);
    contour(g, o, 3 * k, seed, {}, INK, q); contour(g, i, 2.4 * k, seed + 1, {}, INK, q);
  });
};
