// CRAYON KIT for duckcode. The crayon plate's hand (balloon.ts): wax on toothy paper, every fill a
// back-and-forth scribble that skips the valleys of the sheet, a darker crayon worked across the
// shade side, a pale crayon burnishing the highlight, a fat wobbly contour gone over twice.
// The palette is muted on purpose: dusty, grown-up colours on warm paper, never primaries.
//
// Moving things are drawn ONCE into a sprite (in their own frame) and blitted with a transform, so
// the wax texture rides on the object instead of swimming through it, and a frame costs a blit.
import { Gfx, rng, type Ctx, type Env, type Layer, type Medium, type P } from "../core";
import { bounds, clipped, fillShape, hatchRuns, inside, mix } from "../gallery";

export const CRAYON_M: Medium = { nib: 2.6, taper: 0.3, pressure: 0.8, retrace: true, wobble: 1.8, rough: 1.2 };
export const PAPER = "#efe6d3";
export const C = {
  ink: "#3a302b", inkSoft: "#5a4d44",
  duck: "#e2b64e", duckS: "#a97a2c", duckL: "#f6e2a6", bill: "#cf7438", billS: "#97502a", cheek: "#c98a82",
  sky: "#a7c0c9", skyD: "#8aa7b4", sun: "#e3c66f", cloud: "#f3ecdd", cloudS: "#bfc9cc",
  hill: "#a8b58a", hillS: "#7f9468", hill2: "#8ea374", hill2S: "#677c56", tree: "#6d8a59", treeS: "#4c6741", trunk: "#7a5a43",
  far: "#9dbcc2", water: "#7aa2ae", deep: "#5d8695", deepest: "#4b7282", glint: "#e2ebe6",
  roof: "#a95546", roofS: "#7d3c33", wall: "#ddcaa8", wallS: "#b49d7a", door: "#d08f55", wood: "#9b7350", woodS: "#6e4f37",
  pad: "#7f9e5f", padS: "#5c7745", rose: "#c46f84", teal: "#5c9e98", gold: "#d2a23d",
};
export const darker = (c: string, t = 0.42) => mix(c, "#2a2230", t);

// a scribble fill: hatch runs joined end to end into one back-and-forth stroke
export const scribble = (g: Gfx, region: P[], color: string, o: { angle: number; gap: number; w: number; alpha: number; seed: number; keep?: (x: number, y: number) => boolean; over?: number }) => {
  const { angle, gap, w, alpha, seed, keep = () => true, over = 1.035 } = o, r = rng(seed), b = bounds(region);
  const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, grown = region.map(([x, y]) => [cx + (x - cx) * over, cy + (y - cy) * over] as P);
  const runs = hatchRuns({ x0: b.x0 - 8, y0: b.y0 - 8, x1: b.x1 + 8, y1: b.y1 + 8 }, angle, gap, (x, y) => inside(grown, x, y) && keep(x, y), 5, seed);
  const c = g.cur; g.touch(b.x0 - 14, b.y0 - 14, b.x1 + 14, b.y1 + 14);
  c.save(); c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = color; c.lineWidth = w;
  let prev: P | null = null;
  runs.forEach((run, i) => {
    const pts = (i % 2 ? [...run].reverse() : run).filter((_, k, a) => k % 3 === 0 || k === a.length - 1).map(([x, y]) => [x + (r() - 0.5) * 1.6, y + (r() - 0.5) * 1.6] as P);
    const jump = prev ? Math.hypot(pts[0][0] - prev[0], pts[0][1] - prev[1]) : 0;
    c.globalAlpha = alpha * (0.72 + r() * 0.4);
    c.beginPath();
    if (prev && jump < gap * 3.2) { c.moveTo(prev[0], prev[1]); pts.forEach(([x, y]) => c.lineTo(x, y)); }
    else pts.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke(); prev = pts[pts.length - 1];
  });
  c.restore();
};
// the contour: a fat wobbly crayon line, gone over twice
export const cline = (g: Gfx, pts: P[], color: string, w: number, seed: number, op = 0.92, wob = 1) => g.pen(pts, { w, color, seed, wobble: wob, boil: 0, opacity: op, retrace: true, taper: 1 });
export const closed = (pts: P[], every = 3): P[] => { const s = pts.filter((_, i) => i % every === 0); return [...s, s[0]]; };
// wax skips the valleys of the sheet: every crayon layer is punched by the paper's tooth
export const wax = (g: Gfx, fn: () => void) => g.group("plain", fn, { textures: ["pencilTooth"] });

// a coloured shape the crayon way: paper knock-out, the colour scribbled in two directions, the
// shade crayon on the side away from the light (lower right), a burnish toward it, the contour twice
export type ShapeOpts = { col: string; shade?: string; seed: number; line?: string; lw?: number; angle?: number; gap?: number; w?: number; shadeKeep?: (x: number, y: number) => boolean; burnish?: (x: number, y: number) => boolean; burnCol?: string; noLine?: boolean; every?: number };
export const crayonShape = (g: Gfx, pts: P[], o: ShapeOpts) => {
  const b = bounds(pts), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, rx = (b.x1 - b.x0) / 2 || 1, ry = (b.y1 - b.y0) / 2 || 1;
  const { col, shade = darker(col), seed, line = C.ink, lw = 2.4, angle = 1.15, gap = 4.6, w = 5 } = o;
  const keepS = o.shadeKeep ?? ((x: number, y: number) => (x - cx) / rx * 0.8 + (y - cy) / ry * 0.9 > 0.35);
  fillShape(g, pts, PAPER);
  scribble(g, pts, col, { angle, gap, w, alpha: 0.9, seed });
  scribble(g, pts, col, { angle: angle - 1.5, gap: gap * 1.8, w: w * 0.8, alpha: 0.45, seed: seed + 1 });
  scribble(g, pts, shade, { angle: 0.55, gap: gap * 1.3, w: w * 0.85, alpha: 0.7, seed: seed + 2, keep: keepS });
  if (o.burnish) scribble(g, pts, o.burnCol ?? "#fbf6e8", { angle: 1.0, gap: gap * 1.05, w: w * 0.85, alpha: 0.6, seed: seed + 3, keep: o.burnish, over: 1 });
  if (!o.noLine) cline(g, closed(pts, o.every ?? 3), line, lw, seed + 4, 0.9, 0.8);
};
export const knock = (g: Gfx, pts: P[]) => fillShape(g, pts, PAPER);
export { clipped };

// ---------------------------------------------------------------- sprites
// draw fn in a local frame into an offscreen layer once (per env scale); origin at (ox, oy)
export type Sprite = { L: Layer; w: number; h: number; ox: number; oy: number };
export const sprite = (env: Env, key: string, w: number, h: number, ox: number, oy: number, fn: (g: Gfx) => void): Sprite => {
  const k = `duckcode:sprite:${key}:${env.scale}`, hit = env.cache.get(k) as Sprite | undefined; if (hit) return hit;
  const sub: Env = { W: w, H: h, scale: env.scale, canvas: env.canvas, cache: env.cache };
  const L = env.canvas(Math.round(w * env.scale), Math.round(h * env.scale)), g = new Gfx(L.ctx, sub, 0, CRAYON_M);
  g.push(ox, oy, 1); fn(g); g.pop();
  const s = { L, w, h, ox, oy }; env.cache.set(k, s); return s;
};
// blit a sprite at (x, y) in logical coords, scaled (sx, sy) and rotated about its origin
export const blit = (ctx: Ctx, env: Env, s: Sprite, x: number, y: number, sx = 1, sy = sx, rot = 0, alpha = 1) => {
  if (alpha <= 0 || sx <= 0.001 || sy <= 0.001) return;
  ctx.save(); ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0); ctx.globalAlpha = alpha;
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy);
  ctx.drawImage(s.L.canvas as CanvasImageSource, -s.ox, -s.oy, s.w, s.h);
  ctx.restore();
};
