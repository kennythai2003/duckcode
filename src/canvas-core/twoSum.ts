// TWO SUM · duckcode, marker comic, 9:16, 24 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Four ducks float in a row, each wearing its number: the array.
// The first duck asks "who do I need?", finds nobody in the seen-pond yet, and leaves its number
// on a lily pad. The second duck needs exactly that number, finds it on the pad, and the two
// ducks are the answer: [0, 1].
// The token: the number "2", which leaves duck 0 as a lily pad and comes back as the answer.
import { Gfx, PENCIL, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { POND, pondPlate, waterGlints, padInPerspective } from "./duck/pond";
import { drawDuck, drawHat, headTop, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { bubble, burst, heart, indexTag, magnifier, signpost, sparkle, splash, waterRing } from "./duck/fx";
import { FONTS, INK, ease, prog, roundRect, text, window1 } from "./duck/kit";
import { contour } from "./duck/kit";
import { fillShape, lerp } from "./gallery";
import { twoSumAudio } from "./twoSumSound";

const FPS = 30, BPM = 120, DURATION = 720;
const W = 1080, H = 1920;
const PINK = "#ff4f9a", TEAL = "#3fd6c6", GOLD = "#ffc22e";

// ---------------------------------------------------------------- the problem
const NUMS = [2, 7, 11, 15], TARGET = 9;
const CODE = [
  "nums = [2, 7, 11, 15]",
  "target = 9",
  "",
  "def two_sum(nums, target):",
  "    seen = {}",
  "    for i, x in enumerate(nums):",
  "        need = target - x",
  "        if need in seen:",
  "            return [seen[need], i]",
  "        seen[x] = i",
  "",
  "print(two_sum(nums, target))",
];

// ---------------------------------------------------------------- the cue table (frames)
export const CUE = {
  land: [15, 23, 30, 38],      // the ducks drop into the pond
  nums: 45, target: 60, call: 75, seen: 90,
  i0: 120, need0: 180, look0: 240, store0: 300,
  i1: 360, need1: 420, look1: 480, ret: 540, print: 600, party: 630,
};
// the running line: [frame, line]
const RUN: [number, number][] = [[CUE.nums, 0], [CUE.target, 1], [CUE.call, 11], [CUE.seen, 4], [CUE.i0, 5], [CUE.need0, 6], [CUE.look0, 7], [CUE.store0, 9], [CUE.i1, 5], [CUE.need1, 6], [CUE.look1, 7], [CUE.ret, 8], [CUE.print, 11]];
// the watch strip: [frame, name, value]
const WATCH: [number, string, string][] = [[CUE.i0, "i", "0"], [CUE.i0, "x", "2"], [CUE.need0 + 8, "need", "7"], [CUE.store0 + 30, "seen", "{2: 0}"], [CUE.i1, "i", "1"], [CUE.i1, "x", "7"], [CUE.need1 + 8, "need", "2"]];

// a beat every 15 frames: every cue above sits on the grid
for (const [k, v] of Object.entries(CUE)) for (const f of [v].flat()) if (k !== "land" && f % 15) throw new Error(`twoSum: cue ${k} at ${f} is off the beat`);

// ---------------------------------------------------------------- layout
const DUCK_Y = 830, DUCK_K = 0.95, DUCK_X = [195, 425, 655, 885];
const TAG_Y = 915, PAD_Y = 1082, PAD_X = 400, SIGN: P = [150, 1080];
const PANEL: PanelLayout = { x: 46, y: 1196, w: 988, size: 29, lh: 40, pad: 18 };
const TOP = (i: number) => headTop(pose(i, 0)); // where a hat sits, for any frame

// ---------------------------------------------------------------- motion helpers
// a hop: anticipation squash, a stretched rise, a squash on landing that springs back
const hop = (f: number, f0: number, h = 70, dur = 16) => {
  const t = (f - f0) / dur;
  if (f < f0 - 4) return { lift: 0, sx: 1, sy: 1 };
  if (f < f0) { const a = (f - (f0 - 4)) / 4; return { lift: 0, sx: 1 + 0.08 * a, sy: 1 - 0.1 * a }; }
  if (t <= 1) return { lift: h * 4 * t * (1 - t), sx: t < 0.35 ? 0.93 : 1, sy: t < 0.35 ? 1.1 : 1 };
  const a = (f - f0 - dur) / 10; if (a > 1.6) return { lift: 0, sx: 1, sy: 1 };
  const d = Math.exp(-4 * a) * Math.cos(9 * a); return { lift: 0, sx: 1 + 0.12 * d, sy: 1 - 0.14 * d };
};
// a drop into the pond from above the frame
const drop = (f: number, land: number) => {
  const fall = 14, t = (f - (land - fall)) / fall;
  if (t < 0) return null;
  if (t < 1) return { lift: 1000 * (1 - t * t), sx: 0.92, sy: 1.12 };
  return hop(f, land - 16, 0, 16);
};
const HOPS: [number, number, number][] = [ // duck, frame, height
  [0, CUE.i0 + 6, 70], [1, CUE.i1 + 18, 70], [1, CUE.look1 + 30, 46],
  [0, CUE.ret, 90], [1, CUE.ret + 6, 90], [0, CUE.ret + 30, 50], [1, CUE.ret + 36, 50],
  ...[0, 1, 2, 3].map((i) => [i, CUE.party + i * 6, 64] as [number, number, number]),
  ...[0, 1, 2, 3].map((i) => [i, CUE.party + 45 + i * 6, 40] as [number, number, number]),
];

const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open";
  if (i === 0 && f >= CUE.look0 + 30 && f < CUE.store0 + 6) e = "worried";
  if (i === 1 && f >= CUE.look1 + 20 && f < CUE.ret) e = "wide";
  if ((i <= 1 && f >= CUE.ret) || f >= CUE.party - 6) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const lookOf = (i: number, f: number) => {
  if (f >= CUE.look0 && f < CUE.store0 + 30 && i === 0) return -0.8; // looks back at the seen pond
  if (f >= CUE.look1 && f < CUE.ret && i === 1) return -0.8;
  return 0.3;
};
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const quack = [CUE.land[i] + 2, i === 1 ? CUE.look1 + 22 : -99, i <= 1 ? CUE.ret + 2 : -99, CUE.party + i * 6 + 2].some((q) => f >= q && f < q + 9);
  return {
    x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.03 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1),
    eye: eyeOf(i, f), look: lookOf(i, f), label: String(NUMS[i]), seed: 1000 + i * 100,
    tint: i <= 1 && f >= CUE.ret ? 0.6 : i === 1 && f >= CUE.look1 + 20 ? 0.3 : 0,
    mouth: quack ? 1 : 0,
  };
};

// the pointer hat: flies in, rides duck 0's head, hops across to duck 1
const hatAt = (f: number): { at: P; tilt: number } | null => {
  if (f < CUE.i0) return null;
  const p0 = headTop(pose(0, f)), p1 = headTop(pose(1, f));
  if (f < CUE.i0 + 12) { const t = ease.out((f - CUE.i0) / 12); return { at: [lerp(p0[0] - 200, p0[0], t), lerp(-120, p0[1], t)], tilt: lerp(-1.2, -0.25, t) }; }
  if (f < CUE.i1) return { at: p0, tilt: -0.25 };
  if (f < CUE.i1 + 18) { const t = ease.inOut((f - CUE.i1) / 18); return { at: [lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t) - 140 * 4 * t * (1 - t)], tilt: -0.25 + 6.283 * t }; }
  return { at: p1, tilt: -0.25 };
};

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = new Gfx(ctx, env, f, PENCIL);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const plate = pondPlate(env); ctx.drawImage(plate.canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  waterGlints(g, f, W, H);

  // the water rings: pink = the duck being asked, teal = already asked, gold = the answer
  const ring = (i: number, col: string, f0: number, f1 = 1e9) => waterRing(g, DUCK_X[i], DUCK_Y + 14, DUCK_K, col, ease.out(prog(f, f0, 8)) * (f < f1 ? 1 : 0), 500 + i);
  ring(0, PINK, CUE.i0 + 12, CUE.store0 + 20); ring(0, TEAL, CUE.store0 + 20, CUE.ret); ring(1, PINK, CUE.i1 + 18, CUE.ret);
  if (f >= CUE.ret) { ring(0, GOLD, CUE.ret); ring(1, GOLD, CUE.ret); }

  // index tags, popping in under the ducks as `nums` is read
  NUMS.forEach((_, i) => { const q = ease.back(prog(f, CUE.nums + i * 3, 8)); if (q > 0) { const c = g.cur; c.save(); c.translate(DUCK_X[i], TAG_Y); c.scale(q, q); c.translate(-DUCK_X[i], -TAG_Y); indexTag(g, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), 600 + i, i <= 1 && f >= CUE.ret ? ease.out(prog(f, CUE.ret, 10)) : 0); c.restore(); } });

  // the seen pond: a signpost, then lily pads as entries arrive
  signpost(g, SIGN[0], SIGN[1] + 8 * (1 - ease.spring(prog(f, CUE.seen, 18))), "seen", ease.back(prog(f, CUE.seen, 10)), 700);
  const emptyA = prog(f, CUE.seen + 8, 8) * (1 - prog(f, CUE.store0 + 28, 6));
  if (emptyA > 0) text(g, "{ }", PAD_X, PAD_Y - 4, { size: 54, weight: 700, fill: "#e8fbff", stroke: "#1f6f8f", sw: 6, alpha: emptyA * 0.9 });
  const padQ = ease.spring(prog(f, CUE.store0 + 30, 24));
  if (padQ > 0) {
    const glow = f >= CUE.look1 + 18 ? 0.5 + 0.5 * Math.sin((f - CUE.look1) * 0.25) : 0, bounce = hop(f, CUE.look1 + 20, 26).lift;
    padInPerspective(g, PAD_X, PAD_Y - bounce, 92 * padQ, 2.4, 800, false, 0.42, "#56bb5c", glow * 0.8);
    if (padQ > 0.4) text(g, "2 : 0", PAD_X - 8, PAD_Y - 8 - bounce, { size: 46 * Math.min(1, padQ), weight: 700, fill: "#ffffff", stroke: INK, sw: 8 });
  }

  // the ducks, then the hat on the asking duck's head
  const poses = [0, 1, 2, 3].map((i) => pose(i, f));
  poses.forEach((p, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(g, p, f); });
  const hat = hatAt(f); if (hat) drawHat(g, hat.at, DUCK_K * 1.2, hat.tilt, "i", 900);

  // splashes: each landing, each hop's touchdown, the pad arriving
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 14, (f - l) / 18, 1100 + i, 0.9));
  HOPS.forEach(([i, f0, h], j) => { if (h >= 60) splash(g, DUCK_X[i], DUCK_Y + 14, (f - f0 - 16) / 16, 1200 + j, 0.6); });
  splash(g, PAD_X, PAD_Y, (f - CUE.store0 - 30) / 16, 1300, 0.6);

  // ---------------------------------------------------------------- the story beats
  // need = target - x, asked in a speech bubble above the asking duck
  const ask = (i: number, f0: number, f1: number, x: number) => {
    const q = ease.back(prog(f, f0 + 6, 10)) * (1 - ease.out(prog(f, f1, 8)));
    const top = TOP(i);
    bubble(g, Math.max(250, Math.min(W - 250, DUCK_X[i] + 40)), 590, [["need = 9 − ", INK], [String(x), INK], [" = ", INK], [String(TARGET - x), PINK]], [top[0] + 40, top[1] - 6], q, 1400 + i);
  };
  ask(0, CUE.need0, CUE.look0, NUMS[0]);
  ask(1, CUE.need1, CUE.look1, NUMS[1]);

  // is 7 in seen? the magnifier searches an empty pond
  if (f >= CUE.look0 + 6 && f < CUE.store0 + 6) {
    const t = ease.inOut(prog(f, CUE.look0 + 6, 24)), wig = Math.sin((f - CUE.look0) * 0.35) * 18 * prog(f, CUE.look0 + 30, 6);
    const out = 1 - ease.out(prog(f, CUE.store0 - 4, 10));
    if (out > 0) magnifier(g, lerp(PAD_X - 110, PAD_X + 10, t) + wig, PAD_Y - 30 + 20 * (1 - out), 0.95 * out, -0.3, 1500);
    bubble(g, 690, 1030, [["7", PINK], [" isn't here yet", INK]], [PAD_X + 60, PAD_Y - 30], ease.back(prog(f, CUE.look0 + 30, 10)) * out, 1510, 34);
  }
  // seen[x] = i: the 2 lifts off duck 0's chest and becomes a lily pad
  if (f >= CUE.store0 && f < CUE.store0 + 32) {
    const t = ease.inOut(prog(f, CUE.store0 + 2, 28)), a: P = [DUCK_X[0] + 42 * DUCK_K, DUCK_Y - 2], b: P = [PAD_X - 8, PAD_Y - 10];
    const x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t) - 170 * 4 * t * (1 - t), s = 1 + 0.5 * Math.sin(Math.PI * t);
    text(g, "2", x, y, { size: 46 * s, weight: 700, fill: "#ffffff", stroke: INK, sw: 8 });
    for (let k = 1; k <= 3; k++) { const tk = Math.max(0, t - k * 0.06); sparkle(g, lerp(a[0], b[0], tk), lerp(a[1], b[1], tk) - 170 * 4 * tk * (1 - tk), 12 - k * 3, 1520 + k); }
  }
  // is 2 in seen? yes!
  if (f >= CUE.look1 + 6 && f < CUE.ret + 10) {
    const t = ease.inOut(prog(f, CUE.look1 + 6, 14)), out = 1 - ease.out(prog(f, CUE.ret - 4, 10));
    if (out > 0) magnifier(g, lerp(PAD_X - 110, PAD_X + 70, t), PAD_Y - 64 - 20 * (1 - out), 0.95 * out, -0.3, 1600);
    const sq = ease.back(prog(f, CUE.look1 + 20, 10)) * out;
    bubble(g, 720, 1020, [["2", PINK], [" is in seen!", INK]], [PAD_X + 90, PAD_Y - 40], sq, 1610, 36);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + f * 0.05, r = 120 + 10 * Math.sin(f * 0.3 + k); sparkle(g, PAD_X + Math.cos(a) * r, PAD_Y - 10 + Math.sin(a) * r * 0.42, (14 + 4 * Math.sin(f * 0.4 + k)) * sq, 1620 + k); }
  }
  // return [seen[need], i]: hearts rise between the two answer ducks
  if (f >= CUE.ret) for (let k = 0; k < 7; k++) {
    const f0 = CUE.ret + 6 + k * 9, t = (f - f0) / 70; if (t <= 0 || t >= 1) continue;
    const x = (DUCK_X[0] + DUCK_X[1]) / 2 + Math.sin(t * 7 + k * 2) * 40 + (k % 2 ? 30 : -30), y = DUCK_Y - 120 - t * 300;
    heart(g, x, y, 18 + 8 * (k % 3), 1700 + k, Math.min(1, (1 - t) * 3));
  }
  // print(...): the answer, shouted
  const bq = ease.spring(prog(f, CUE.print, 24));
  if (bq > 0) {
    burst(g, 540, 545, 250, 110, bq, 1800);
    g.group("plain", () => {
      text(g, "return", 540, 498, { size: 30 * bq, weight: 700, fill: "#7a3a00", alpha: Math.min(1, bq) });
      text(g, "[0, 1]", 540, 560, { size: 84 * bq, weight: 700, fill: "#ffffff", stroke: INK, sw: 12 * bq });
    });
    if (f >= CUE.party) for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + (f - CUE.party) * 0.03; sparkle(g, 540 + Math.cos(a) * 330, 545 + Math.sin(a) * 160, 16 + 6 * Math.sin(f * 0.3 + k), 1850 + k); }
  }

  // the title, the language, the target
  g.group("plain", () => {
    const tq = ease.spring(prog(f, 0, 20)), c = g.cur;
    c.save(); c.translate(540, 250); c.scale(tq, tq); c.translate(-540, -250);
    text(g, "Two Sum", 546, 258, { size: 112, weight: 700, fill: "#0b2a3d", alpha: 0.25 });
    text(g, "Two Sum", 540, 250, { size: 112, weight: 700, fill: "#ffd23a", stroke: INK, sw: 16 });
    text(g, "Python", 540, 338, { size: 40, weight: 700, fill: "#ffffff", stroke: INK, sw: 9 });
    c.restore();
    const pq = ease.back(prog(f, CUE.target, 10));
    if (pq > 0) {
      c.save(); c.translate(540, 420); c.scale(pq, pq); c.translate(-540, -420);
      const pill = roundRect(540 - 130, 420 - 34, 260, 68, 34, 6);
      fillShape(g, pill, "#ffffff"); contour(g, pill, 5.5, 1900);
      text(g, "target = ", 520, 422, { size: 38, weight: 700, fill: INK });
      text(g, String(TARGET), 610, 422, { size: 42, weight: 700, fill: PINK });
      c.restore();
    }
  });
  g.paper("paper", 0.05);

  // ---------------------------------------------------------------- the code (clean, not drawn)
  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const slide = ease.out(prog(f, at, 6)), shown = from < 0 ? line : lerp(from, line, slide);
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  for (const [f0, k, v] of WATCH) if (f >= f0) { watch.set(k, v); fresh = k; freshAt = f0; }
  drawPanel(g, CODE, PANEL, {
    line: shown, alpha: prog(f, CUE.nums - 4, 6), pulse: f >= CUE.look1 + 20 && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: "[0, 1]", outQ: prog(f, CUE.print + 4, 12),
  });
  void window1; void POND;
};

export const twoSum: Film = {
  meta: {
    title: "Two Sum · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: CUE.look1 + 30,
    holds: [[CUE.party + 75, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.nums, to: CUE.i0, text: "nums = [2, 7, 11, 15], target = 9" },
      { from: CUE.i0, to: CUE.look0, text: "Duck 0 (2) needs a 7." },
      { from: CUE.look0, to: CUE.i1, text: "No 7 seen yet: remember 2 at index 0." },
      { from: CUE.i1, to: CUE.look1, text: "Duck 1 (7) needs a 2." },
      { from: CUE.look1, to: CUE.print, text: "2 is in seen! Return [0, 1]." },
      { from: CUE.print, to: DURATION, text: "Output: [0, 1]" },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "twoSum", start: 0, end: DURATION, draw }],
  audio: twoSumAudio(FPS, DURATION, CUE),
};
