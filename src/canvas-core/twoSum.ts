// TWO SUM · duckcode, crayon, 9:16, 30 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Four ducks float in a row, each wearing its number: the array.
// Duck after duck asks "who do I need?", finds nobody in the seen-pond, and leaves its number on a
// lily pad. The third duck needs exactly the first duck's number, finds it on the pad, and the two
// of them are the answer: [0, 2].
// The token: the number "2", which leaves duck 0 as a lily pad and comes back as the answer.
import { Gfx, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { pondPlate, waterGlints } from "./duck/pond";
import { drawDuck, drawPointer, headTop, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { drawBubble, drawCard, drawCheck, drawCross, drawEntry, drawMagnifier, drawSign, drawSparkle, drawTag, splash, waterRing, type Parts } from "./duck/fx";
import { C, CRAYON_M as CRAYON, blit, sprite, wax, crayonShape, cline } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { lerp } from "./gallery";
import { twoSumAudio } from "./twoSumSound";

const FPS = 30, BPM = 120, DURATION = 900;
const W = 1080, H = 1920;

// ---------------------------------------------------------------- the problem
const NUMS = [2, 11, 7, 15], TARGET = 9;
const CODE = [
  "nums = [2, 11, 7, 15]",
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

// ---------------------------------------------------------------- the cue table (frames, all on the beat)
type Iter = { i: number; start: number; need: number; look: number; store?: number; found?: number };
const IT: Iter[] = [
  { i: 0, start: 120, need: 180, look: 240, store: 300 },
  { i: 1, start: 360, need: 405, look: 450, store: 495 },
  { i: 2, start: 540, need: 600, look: 660, found: 0 },  // found: the pad that holds the answer
];
export const CUE = { land: [15, 23, 30, 38], nums: 45, target: 60, call: 75, seen: 90, ret: 720, print: 780, party: 810, iters: IT };
const RUN: [number, number][] = [[CUE.nums, 0], [CUE.target, 1], [CUE.call, 11], [CUE.seen, 4], ...IT.flatMap((t): [number, number][] => [[t.start, 5], [t.need, 6], [t.look, 7], ...(t.store !== undefined ? [[t.store, 9] as [number, number]] : [])]), [CUE.ret, 8], [CUE.print, 11]];
const PAD_X = [380, 640], PAD_Y = 1082, SIGN: P = [150, 1080];
const ENTRY = (k: number) => `${NUMS[k]} : ${k}`;
const WATCH: [number, string, string][] = IT.flatMap((t, k): [number, string, string][] => [
  [t.start, "i", String(t.i)], [t.start, "x", String(NUMS[t.i])], [t.need + 8, "need", String(TARGET - NUMS[t.i])],
  ...(t.store !== undefined ? [[t.store + 30, "seen", `{${IT.slice(0, k + 1).map((u) => `${NUMS[u.i]}: ${u.i}`).join(", ")}}`] as [number, string, string]] : []),
]);
for (const [f] of RUN) if (f % 15) throw new Error(`twoSum: a run cue at ${f} is off the beat`);

// ---------------------------------------------------------------- layout
const DUCK_Y = 830, DUCK_K = 0.95, DUCK_X = [195, 425, 655, 885], TAG_Y = 915;
const PANEL: PanelLayout = { x: 46, y: 1196, w: 988, size: 29, lh: 40, pad: 18 };

// ---------------------------------------------------------------- motion
const hop = (f: number, f0: number, h = 70, dur = 16) => {
  const t = (f - f0) / dur;
  if (f < f0 - 4) return { lift: 0, sx: 1, sy: 1 };
  if (f < f0) { const a = (f - (f0 - 4)) / 4; return { lift: 0, sx: 1 + 0.06 * a, sy: 1 - 0.08 * a }; }
  if (t <= 1) return { lift: h * 4 * t * (1 - t), sx: t < 0.35 ? 0.95 : 1, sy: t < 0.35 ? 1.07 : 1 };
  const a = (f - f0 - dur) / 10; if (a > 1.6) return { lift: 0, sx: 1, sy: 1 };
  const d = Math.exp(-4 * a) * Math.cos(9 * a); return { lift: 0, sx: 1 + 0.08 * d, sy: 1 - 0.1 * d };
};
const drop = (f: number, land: number) => {
  const fall = 14, t = (f - (land - fall)) / fall;
  if (t < 0) return null;
  if (t < 1) return { lift: 1000 * (1 - t * t), sx: 0.95, sy: 1.08 };
  return hop(f, land - 16, 0, 16);
};
const FOUND = IT[IT.length - 1], ANS = [FOUND.found!, FOUND.i];
const HOPS: [number, number, number][] = [
  ...IT.map((t, k) => [t.i, k === 0 ? t.start + 6 : t.start + 18, 64] as [number, number, number]),
  [FOUND.i, FOUND.look + 20, 40],
  [ANS[0], CUE.ret, 80], [ANS[1], CUE.ret + 6, 80],
  ...[0, 1, 2, 3].map((i) => [i, CUE.party + i * 6, 56] as [number, number, number]),
  ...[0, 1, 2, 3].map((i) => [i, CUE.party + 45 + i * 6, 34] as [number, number, number]),
];
const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open";
  IT.forEach((t) => { if (t.i === i && t.store !== undefined && f >= t.look + 30 && f < t.store + 6) e = "worried"; });
  if (i === FOUND.i && f >= FOUND.look + 20 && f < CUE.ret) e = "wide";
  if ((ANS.includes(i) && f >= CUE.ret) || f >= CUE.party - 6) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const lookOf = (i: number, f: number) => (IT.some((t) => t.i === i && f >= t.look && f < (t.store ?? CUE.ret) + 20) ? -0.8 : 0.3);
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const quack = QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9);
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye: eyeOf(i, f), look: lookOf(i, f), label: String(NUMS[i]), seed: 1000 + i * 100, mouth: quack ? 1 : 0 };
};
// who quacks when: [frame, duck] (the sound plays the same list)
export const QUACKS: [number, number][] = [
  ...CUE.land.map((f, i) => [f + 2, i] as [number, number]),
  [FOUND.look + 22, FOUND.i], [CUE.ret + 2, ANS[0]], [CUE.ret + 8, ANS[1]],
  ...[0, 1, 2, 3].map((i) => [CUE.party + i * 6 + 2, i] as [number, number]),
];

// the pointer: flies in onto duck 0, then hops along the row with the loop
const pointerAt = (f: number): { at: P; tilt: number } | null => {
  if (f < IT[0].start) return null;
  const top = (i: number) => headTop(pose(i, f));
  if (f < IT[0].start + 12) { const t = ease.out((f - IT[0].start) / 12), p = top(0); return { at: [lerp(p[0] - 200, p[0], t), lerp(-120, p[1], t)], tilt: lerp(-1, -0.12, t) }; }
  let cur = 0;
  for (let k = 1; k < IT.length; k++) if (f >= IT[k].start) {
    const a = top(IT[k - 1].i), b = top(IT[k].i), t = ease.inOut((f - IT[k].start) / 18);
    if (t < 1) return { at: [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - 120 * 4 * t * (1 - t)], tilt: -0.12 + 0.5 * Math.sin(Math.PI * t) };
    cur = k;
  }
  return { at: top(IT[cur].i), tilt: -0.12 };
};

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = new Gfx(ctx, env, f, CRAYON);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(pondPlate(env).canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  waterGlints(g, f, W, H);

  // rings: rose = being asked, teal = already asked, gold = the answer
  const ring = (i: number, col: string, f0: number, f1 = 1e9) => waterRing(g, DUCK_X[i], DUCK_Y + 16, DUCK_K, col, ease.out(prog(f, f0, 8)) * (f < f1 ? 1 : 0), 500 + i * 10 + col.length);
  IT.forEach((t, k) => {
    const arrive = k === 0 ? t.start + 12 : t.start + 18, done = t.store !== undefined ? t.store + 20 : CUE.ret;
    ring(t.i, C.rose, arrive, done); if (t.store !== undefined) ring(t.i, C.teal, done, ANS.includes(t.i) ? CUE.ret : 1e9);
  });
  if (f >= CUE.ret) ANS.forEach((i) => ring(i, C.gold, CUE.ret));

  // index tags
  NUMS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), ease.back(prog(f, CUE.nums + i * 3, 8)), ANS.includes(i) ? ease.out(prog(f, CUE.ret, 10)) : 0));

  // the seen pond: a signpost, "{ }" while it is empty, then a lily pad per entry
  drawSign(ctx, env, SIGN[0], SIGN[1] + 8 * (1 - ease.spring(prog(f, CUE.seen, 18))), "seen", ease.back(prog(f, CUE.seen, 10)));
  const emptyA = prog(f, CUE.seen + 8, 8) * (1 - prog(f, IT[0].store! + 28, 6));
  if (emptyA > 0) g.group("plain", () => text(g, "{ }", PAD_X[0], PAD_Y - 4, { size: 54, weight: 700, fill: "#e6ece6", alpha: emptyA * 0.85 }));
  IT.forEach((t, k) => {
    if (t.store === undefined) return;
    const q = ease.spring(prog(f, t.store + 30, 24)); if (q <= 0) return;
    const hit = FOUND.found === k, glow = hit && f >= FOUND.look + 18 ? 0.5 + 0.5 * Math.sin((f - FOUND.look) * 0.22) : 0, bounce = hit ? hop(f, FOUND.look + 20, 26).lift : 0;
    drawEntry(ctx, env, PAD_X[k], PAD_Y - bounce, ENTRY(t.i), q, glow, 800 + k * 20);
  });

  // the ducks, and the pointer on the asking duck's head
  [0, 1, 2, 3].forEach((i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  const pt = pointerAt(f); if (pt) drawPointer(ctx, env, pt.at, DUCK_K, pt.tilt, "i");

  // splashes
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 16, (f - l) / 18, 1100 + i, 0.9));
  HOPS.forEach(([i, f0, h], j) => { if (h >= 56) splash(g, DUCK_X[i], DUCK_Y + 16, (f - f0 - 16) / 16, 1200 + j, 0.6); });
  IT.forEach((t, k) => { if (t.store !== undefined) splash(g, PAD_X[k], PAD_Y, (f - t.store - 30) / 16, 1300 + k, 0.6); });

  // ---------------------------------------------------------------- the beats of each loop
  IT.forEach((t, k) => {
    const x = NUMS[t.i], need = TARGET - x, nd = need < 0 ? `−${-need}` : String(need), next = IT[k + 1]?.start ?? CUE.ret;
    // need = target - x, in a bubble over the asking duck
    const top = headTop(pose(t.i, f)), bq = ease.back(prog(f, t.need + 6, 10)) * (1 - ease.out(prog(f, t.look, 8)));
    const parts: Parts = [["need = 9 − ", C.ink], [String(x), C.ink], [" = ", C.ink], [nd, C.rose]];
    drawBubble(ctx, env, Math.max(260, Math.min(W - 260, DUCK_X[t.i] + 40)), 600, parts, [Math.round(top[0] + 40), 680], bq, 1400 + k);
    // is need in seen? the magnifier goes looking
    const end = t.store ?? CUE.ret;
    if (f >= t.look + 6 && f < end + 8) {
      const target = t.found !== undefined ? PAD_X[t.found] + 60 : k === 0 ? PAD_X[0] + 10 : PAD_X[k - 1] + 40 + 140 * Math.sin((f - t.look) * 0.12), out = 1 - ease.out(prog(f, end - 4, 10));
      const mx = lerp(PAD_X[0] - 120, target, ease.inOut(prog(f, t.look + 6, 16))), my = PAD_Y - 96 + 20 * (1 - out);
      drawMagnifier(ctx, env, mx, my, 0.95 * out);
      const verdict = ease.back(prog(f, t.look + 26, 10)) * out;
      if (t.found !== undefined) {
        drawCheck(ctx, env, mx + 4, my - 4, verdict * 0.7);
        drawBubble(ctx, env, mx + 250, my + 12, [[nd, C.rose], [" is in seen!", C.ink]], [mx + 60, my + 6], verdict, 1610, 34);
        for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + f * 0.04; drawSparkle(ctx, env, PAD_X[t.found] + Math.cos(a) * 130, PAD_Y - 10 + Math.sin(a) * 56, (12 + 4 * Math.sin(f * 0.3 + s)) * verdict, f * 0.03 + s); }
      } else {
        drawCross(ctx, env, mx + 4, my - 4, verdict * 0.6);
        drawBubble(ctx, env, mx + 260, my + 12, [[nd, C.rose], [" isn't in seen", C.ink]], [mx + 60, my + 6], verdict, 1510 + k, 32);
      }
    }
    // seen[x] = i: the number lifts off the duck's chest and becomes a lily pad
    if (t.store !== undefined && f >= t.store && f < t.store + 32) {
      const u = ease.inOut(prog(f, t.store + 2, 28)), a = chest(pose(t.i, f)), b: P = [PAD_X[k] - 8, PAD_Y - 10];
      const px = lerp(a[0], b[0], u), py = lerp(a[1], b[1], u) - 170 * 4 * u * (1 - u), s = 1 + 0.4 * Math.sin(Math.PI * u);
      g.group("plain", () => text(g, String(x), px, py, { size: 42 * s, weight: 700, fill: "#f6f0e2", stroke: C.ink, sw: 7 }));
      drawSparkle(ctx, env, px - 26, py + 20, 10 * Math.sin(Math.PI * u), f * 0.1);
    }
    void next;
  });

  // print(...): the answer, on a card
  const cq = ease.spring(prog(f, CUE.print, 24));
  if (cq > 0) {
    drawCard(ctx, env, 540, 540, "two_sum returns", `[${ANS.join(", ")}]`, cq);
    if (f >= CUE.party) for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 280, 540 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + s), a); }
  }

  // the title, the problem, the target
  const tq = ease.spring(prog(f, 0, 20));
  blit(ctx, env, titleSprite(env), 540, 270, tq, tq);
  const pq = ease.back(prog(f, CUE.target, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8)));
  blit(ctx, env, targetSprite(env), 540, 432, pq, pq);
  g.paper("paper", 0.05);

  // ---------------------------------------------------------------- the code (clean, not drawn)
  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const shown = from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 6)));
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  for (const [f0, k, v] of WATCH) if (f >= f0) { watch.set(k, v); fresh = k; freshAt = f0; }
  drawPanel(g, CODE, PANEL, {
    line: shown, alpha: prog(f, CUE.nums - 4, 6), pulse: f >= FOUND.look + 20 && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: `[${ANS.join(", ")}]`, outQ: prog(f, CUE.print + 4, 12),
  });
};

const titleSprite = (env: Env) => sprite(env, "title", 760, 240, 380, 120, (g) => {
  text(g, "Two Sum", 0, -14, { size: 104, weight: 700, fill: C.ink });
  wax(g, () => cline(g, [[-190, 46], [-40, 52], [190, 44]], C.gold, 9, 1950, 0.85, 1.4));
  text(g, "LeetCode 1  ·  Python", 0, 88, { size: 34, weight: 500, fill: C.inkSoft });
});
const targetSprite = (env: Env) => sprite(env, "target", 320, 120, 160, 60, (g) => {
  wax(g, () => crayonShape(g, roundRect(-122, -34, 244, 68, 30, 6), { col: "#efe4cc", shade: "#cdbf9f", seed: 1900, lw: 2.4, gap: 5, w: 4.6 }));
  text(g, "target = ", -20, 2, { size: 36, weight: 700, fill: C.ink });
  text(g, String(TARGET), 74, 2, { size: 40, weight: 700, fill: C.rose });
});

export const twoSum: Film = {
  meta: {
    title: "Two Sum · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: FOUND.look + 40,
    holds: [[CUE.party + 75, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.nums, to: IT[0].start, text: "nums = [2, 11, 7, 15], target = 9" },
      { from: IT[0].start, to: IT[1].start, text: "2 needs a 7. Not seen yet: remember 2 at index 0." },
      { from: IT[1].start, to: IT[2].start, text: "11 needs a −2. Not seen: remember 11 at index 1." },
      { from: IT[2].start, to: CUE.print, text: "7 needs a 2. 2 is in seen! Return [0, 2]." },
      { from: CUE.print, to: DURATION, text: "Output: [0, 2]" },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "twoSum", start: 0, end: DURATION, draw }],
  audio: twoSumAudio(FPS, DURATION, { ...CUE, quacks: QUACKS }),
};
