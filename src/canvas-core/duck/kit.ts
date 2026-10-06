// DUCKCODE KIT. Shared palette, easing, text and small marker-comic helpers for the duck films.
// Marker comic (koi.ts is the plate): flat cel fills, a hard shadow shape on the side away from
// the light, gel-pen whites, and one heavy brush-pen contour that thickens away from the light.
// Light from the upper left, always.
import { Gfx, type P } from "../core";
import { clamp, ink, type InkOpts } from "../gallery";

export const INK = "#1a1530";
export const LIGHT: P = [-0.62, -0.78];
export const FONT_ROUND = "Fredoka", FONT_MONO = "JetBrains Mono";
export const FONTS = {
  "Fredoka:500": "assets/fonts/fredoka-latin-500-normal.woff2",
  "Fredoka:700": "assets/fonts/fredoka-latin-700-normal.woff2",
  "JetBrains Mono:500": "assets/fonts/jetbrains-mono-latin-500-normal.woff2",
  "JetBrains Mono:700": "assets/fonts/jetbrains-mono-latin-700-normal.woff2",
};

// ---------------------------------------------------------------- easing
export const ease = {
  out: (t: number) => 1 - Math.pow(1 - clamp(t), 3),
  inOut: (t: number) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  back: (t: number) => { const x = clamp(t), c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  // a spring settling to 1: overshoot, wobble, rest
  spring: (t: number) => { const x = Math.max(0, t); return x >= 1.6 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(11 * x); },
};
// 0 before f0, ramps to 1 over dur frames
export const prog = (f: number, f0: number, dur: number) => clamp((f - f0) / Math.max(1, dur));
// 1 inside [f0, f1), with in/out ramps of r frames
export const window1 = (f: number, f0: number, f1: number, r = 6) => clamp(Math.min((f - f0) / r, (f1 - f) / r));

// ---------------------------------------------------------------- lettering
export type TextOpts = { size: number; weight?: number; family?: string; fill: string; stroke?: string; sw?: number; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; alpha?: number };
export const text = (g: Gfx, s: string, x: number, y: number, o: TextOpts) => {
  const c = g.cur, { size, weight = 700, family = FONT_ROUND, fill, stroke, sw = 0, align = "center", baseline = "middle", alpha = 1 } = o;
  if (alpha <= 0) return 0;
  c.save(); c.globalAlpha = alpha; c.font = `${weight} ${size}px "${family}"`; c.textAlign = align; c.textBaseline = baseline;
  const w = c.measureText(s).width, x0 = align === "center" ? x - w / 2 : align === "right" || align === "end" ? x - w : x;
  g.touch(x0 - sw - 4, y - size - sw, x0 + w + sw + 4, y + size + sw);
  if (stroke && sw > 0) { c.lineJoin = "round"; c.miterLimit = 2; c.lineWidth = sw; c.strokeStyle = stroke; c.strokeText(s, x, y); }
  c.fillStyle = fill; c.fillText(s, x, y); c.restore();
  return w;
};
export const measure = (g: Gfx, s: string, size: number, weight = 700, family = FONT_ROUND) => { const c = g.cur; c.save(); c.font = `${weight} ${size}px "${family}"`; const w = c.measureText(s).width; c.restore(); return w; };

// ---------------------------------------------------------------- shapes
export const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 28, rot = 0): P[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)] as P; });
export const roundRect = (x: number, y: number, w: number, h: number, r: number, per = 5): P[] => {
  const out: P[] = [], q = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= per; i++) { const a = a0 + (i / per) * (Math.PI / 2); out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  q(x + w - r, y + r, -Math.PI / 2); q(x + w - r, y + h - r, 0); q(x + r, y + h - r, Math.PI / 2); q(x + r, y + r, Math.PI);
  return out;
};
export const shift = (pts: P[], dx: number, dy: number): P[] => pts.map(([x, y]) => [x + dx, y + dy]);
// a closed contour, heavier away from the light (the comic inker's rule)
export const contour = (g: Gfx, pts: P[], w: number, seed: number, o: Partial<InkOpts> = {}, color = INK, alpha = 1) => ink(g, pts, color, { w, closed: true, light: LIGHT, shadow: 0.85, seed, rough: 0.35, ...o }, alpha);
export const stroke = (g: Gfx, pts: P[], w: number, seed: number, o: Partial<InkOpts> = {}, color = INK, alpha = 1) => ink(g, pts, color, { w, light: LIGHT, shadow: 0.6, seed, taper: [0.15, 0.2], rough: 0.3, ...o }, alpha);
