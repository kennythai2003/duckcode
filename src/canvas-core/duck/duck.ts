// THE DUCK · crayon. A rubber duck seen from the side and a touch from the front, facing right: a
// boat-shaped body with the tail flicked up behind, a round head set forward on the chest, a flat
// rounded bill, one dark eye. Its value is written on a pale roundel on the chest.
//
// Crayon order (balloon.ts): paper knock-out, the mustard scribbled in two directions, the darker
// crayon worked over the shade side (lower right), a pale crayon burnishing the lit back, the fat
// contour gone over twice. Drawn once per state into a sprite and blitted, so the wax rides on the
// duck. Below the waterline the pond hides it; a hopping duck shows all of itself.
import { Gfx, type Ctx, type Env, type P } from "../core";
import { fillShape, smooth } from "../gallery";
import { C, blit, cline, closed, crayonShape, scribble, sprite, wax } from "./crayon";
import { ellipse, text } from "./kit";

export type Eye = "open" | "happy" | "blink" | "wide" | "worried";
export type DuckPose = {
  x: number; y: number;       // the waterline under the duck's middle (world)
  k: number;                  // overall scale
  lift: number;               // world px above the water
  sx?: number; sy?: number;   // squash and stretch about the duck's base
  tilt?: number;              // radians, + = leans forward (nose down)
  eye?: Eye; look?: number;   // look: -1 back .. 1 forward
  label: string; seed: number;
  mouth?: number;             // 0..1 bill open (a quack)
};

// the duck in its own frame: origin on the waterline at its middle, y down, ~240 wide
const BODY = smooth([[-104, -74], [-86, -46], [-56, -36], [-16, -40], [26, -46], [72, -34], [96, -4], [88, 26], [52, 44], [0, 50], [-52, 44], [-88, 22], [-104, -10], [-112, -50]], true, 8);
const HEAD_C: P = [40, -100], HEAD_R: P = [52, 49];
const HEAD = ellipse(HEAD_C[0], HEAD_C[1], HEAD_R[0], HEAD_R[1], 40);
const BILL_UP = smooth([[80, -104], [104, -106], [130, -98], [134, -88], [118, -82], [94, -82], [82, -86]], true, 6);
const BILL_LO = smooth([[86, -86], [110, -84], [124, -80], [116, -72], [96, -72], [86, -78]], true, 6);
const WING = smooth([[2, -18], [-14, -34], [-46, -34], [-74, -22], [-64, -12], [-74, -4], [-58, 2], [-62, 10], [-36, 8], [-10, 4]], true, 6);
const ROUND_C: P = [44, 4], ROUND_R = 31;
export const WATERLINE = 30;

const tf = (p: DuckPose) => {
  const sx = p.sx ?? 1, sy = p.sy ?? 1, t = p.tilt ?? 0, c = Math.cos(t), s = Math.sin(t);
  return ([x, y]: P): P => { const X = x * sx, Y = (y - 50) * sy; return [p.x + (X * c - Y * s) * p.k, p.y - p.lift + (X * s + Y * c + 50) * p.k]; };
};
export const headTop = (p: DuckPose): P => tf(p)([HEAD_C[0] - 4, HEAD_C[1] - HEAD_R[1] + 2]);
export const chest = (p: DuckPose): P => tf(p)(ROUND_C);

const drawEye = (g: Gfx, e: Eye, look: number, seed: number) => {
  const E: P = [58 + look * 4, -110];
  if (e === "happy") { cline(g, smooth([[E[0] - 11, E[1] + 4], [E[0], E[1] - 7], [E[0] + 11, E[1] + 4]], false, 6), C.ink, 3.4, seed); return; }
  if (e === "blink") { cline(g, [[E[0] - 10, E[1] + 1], [E[0], E[1] + 3], [E[0] + 10, E[1] + 1]], C.ink, 3, seed); return; }
  const big = e === "wide" ? 1.25 : 1;
  fillShape(g, ellipse(E[0], E[1], 8 * big, 11.5 * big, 20), C.ink);
  fillShape(g, ellipse(E[0] - 2.5 * big, E[1] - 4.5 * big, 3 * big, 3.6 * big, 10), "#f6efe0");
  if (e === "worried") cline(g, [[E[0] - 12, E[1] - 21], [E[0] + 8, E[1] - 17]], C.ink, 2.6, seed + 1);
};

// the duck, drawn whole in its own frame, for one (label, eye, look, mouth) state
const duckSprite = (env: Env, label: string, eye: Eye, look: number, mouth: number, seed: number) =>
  sprite(env, `duck:${label}:${eye}:${look}:${mouth}:${seed}`, 300, 300, 140, 236, (g) => {
    wax(g, () => {
      crayonShape(g, BODY, { col: C.duck, shade: C.duckS, seed, lw: 2.8, burnish: (x, y) => (x + 70) ** 2 / 900 + (y + 48) ** 2 / 200 < 1, burnCol: C.duckL,
        shadeKeep: (x, y) => x * 0.006 + y * 0.022 > 0.35 });
      crayonShape(g, WING, { col: "#d4a443", shade: C.duckS, seed: seed + 10, lw: 2, gap: 4, shadeKeep: (_x, y) => y > -8 });
      [[[-58, 2], [-46, -4]], [[-62, -10], [-48, -14]], [[-66, -21], [-52, -24]]].forEach((s, i) => cline(g, s as P[], C.inkSoft, 1.4, seed + 20 + i, 0.8, 0.4));
      const rnd = ellipse(ROUND_C[0], ROUND_C[1], ROUND_R, ROUND_R, 30);
      crayonShape(g, rnd, { col: "#efe4cc", shade: "#cbbd9e", seed: seed + 30, lw: 2, gap: 4, w: 4 });
    });
    text(g, label, ROUND_C[0], ROUND_C[1] + 1, { size: label.length > 3 ? 20 : label.length > 2 ? 26 : label.length > 1 ? 31 : 36, weight: 700, fill: C.ink });
    wax(g, () => {
      crayonShape(g, HEAD, { col: C.duck, shade: C.duckS, seed: seed + 40, lw: 2.8, burnish: (x, y) => (x - 22) ** 2 / 500 + (y + 128) ** 2 / 150 < 1, burnCol: C.duckL });
      const lo = BILL_LO.map(([x, y]) => [x + mouth * 2, y + mouth * 12 * Math.max(0, (x - 84) / 40)] as P);
      if (mouth > 0.05) fillShape(g, smooth([[88, -86], [120, -86], [118, -74], [94, -74]], true, 4), "#6e3426");
      crayonShape(g, lo, { col: C.billS, shade: darkBill, seed: seed + 50, lw: 2, gap: 3.6, w: 4 });
      crayonShape(g, BILL_UP, { col: C.bill, shade: C.billS, seed: seed + 60, lw: 2.2, gap: 3.6, w: 4 });
      scribble(g, ellipse(58, -80, 12, 6.5, 16), C.cheek, { angle: 0.3, gap: 3.4, w: 3.6, alpha: 0.5, seed: seed + 70 });
      drawEye(g, eye, look, seed + 80);
    });
    void closed;
  });
const darkBill = "#7a3f22";

// the duck in the world: its shadow on the water, the duck, the water's skin across its keel
export const drawDuck = (ctx: Ctx, env: Env, g: Gfx, p: DuckPose, f: number) => {
  const k = p.k, sink = Math.max(0, 1 - p.lift / (60 * k));
  g.group("plain", () => fillShape(g, ellipse(p.x + 8 * k, p.y + 26 * k, 116 * k * (0.55 + 0.45 * sink), 15 * k * (0.55 + 0.45 * sink), 30), C.deepest, 0.35 + 0.15 * sink));
  const s = duckSprite(env, p.label, p.eye ?? "open", p.look ?? 0.3, (p.mouth ?? 0) > 0.5 ? 1 : 0, p.seed);
  const afloat = p.lift < 40 * k;
  ctx.save();
  if (afloat) {
    // clip to above the water's skin: a gentle wave across the duck
    ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0); ctx.beginPath();
    const w = 175 * k, y0 = p.y + 30 * k; ctx.moveTo(p.x - w, p.y - 400 * k);
    for (let i = 0; i <= 24; i++) { const u = i / 24; ctx.lineTo(p.x - w + 2 * w * u, y0 + Math.sin(u * 9 + f * 0.1 + p.seed) * 2.2 * k); }
    ctx.lineTo(p.x + w, p.y - 400 * k); ctx.closePath(); ctx.clip();
  }
  // tf as a canvas transform: about the base (local y 50), squash, then tilt
  const t = p.tilt ?? 0;
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  ctx.translate(p.x, p.y - p.lift + 50 * k); ctx.rotate(t); ctx.scale(k * (p.sx ?? 1), k * (p.sy ?? 1)); ctx.translate(0, -50);
  ctx.drawImage(s.L.canvas as CanvasImageSource, -s.ox, -s.oy, s.w, s.h);
  ctx.restore();
  // where it meets the water: broken pale crayon strokes on the skin
  if (p.lift < 30 * k) g.group("plain", () => {
    const y0 = p.y + 32 * k, a = 1 - p.lift / (30 * k);
    [[-118, -40], [-20, 30], [50, 120]].forEach(([u0, u1], i) => {
      const pts: P[] = []; for (let j = 0; j <= 6; j++) { const u = u0 + ((u1 - u0) * j) / 6; pts.push([p.x + u * k, y0 + Math.sin(u * 0.05 + i) * 2 * k]); }
      cline(g, pts, C.glint, 2.4 * k, p.seed + 90 + i, 0.8 * a, 0.6);
    });
  });
};

// ---------------------------------------------------------------- the pointer
// A small pennant on a stick, planted on the asking duck's head, with the pointer's name on it.
const pennant = (env: Env, letter: string) => sprite(env, `pennant:${letter}`, 140, 150, 40, 130, (g) => {
  wax(g, () => {
    cline(g, [[0, 0], [1, -60], [2, -118]], C.wood, 4, 1, 0.95, 0.4);
    const flag: P[] = smooth([[3, -118], [70, -102], [4, -84]], true, 4);
    crayonShape(g, flag, { col: C.rose, shade: darkerRose, seed: 5, lw: 2.2, gap: 3.6, w: 4.2 });
  });
  text(g, letter, 26, -101, { size: 24, weight: 700, fill: "#f6efe0" });
});
const darkerRose = "#8f4a5c";
export const drawPointer = (ctx: Ctx, env: Env, at: P, k: number, tilt: number, letter: string) => blit(ctx, env, pennant(env, letter), at[0], at[1], k, k, tilt);
