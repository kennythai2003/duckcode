// PRODUCT OF ARRAY EXCEPT SELF · duckcode, crayon, 9:16, 52 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Four ducks float over an empty res row. A rose prefix pill walks
// left to right: it drops its value into each cell (the product of every duck to the left), then
// swallows that duck's number. A teal postfix pill walks back right to left doing the same with
// everything to the right, and each cell ends as the product of every other duck: [24, 12, 8, 6].
// Every on-screen value comes from simulating the user's code below; the film refuses to build if
// the simulation disagrees with the expected output.
import { Gfx, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { pondPlate, waterGlints } from "./duck/pond";
import { drawDuck, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { drawCard, drawMarker, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C, CRAYON_M, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { pillSprite, titleSprite } from "./duck/chrome";
import { lerp, mix } from "./gallery";
import { productExceptSelfAudio } from "./productExceptSelfSound";

const FPS = 30, BPM = 120, DURATION = 1560, W = 1080, H = 1920;

// ---------------------------------------------------------------- the problem
const NUMS = [1, 2, 3, 4], EXPECTED = [24, 12, 8, 6];
const CODE = [
  `nums = [${NUMS.join(", ")}]`,
  "class Solution:",
  "    def productExceptSelf(self, nums: List[int]) -> List[int]:",
  "        res = [0] * len(nums)",
  "        prefix = 1",
  "        for i in range(len(nums)):",
  "            res[i] = prefix",
  "            prefix *= nums[i]",
  "        postfix = 1",
  "        for i in range(len(nums) - 1, -1, -1):",
  "            res[i] *= postfix",
  "            postfix *= nums[i]",
  "        return res",
  "print(Solution().productExceptSelf(nums))",
];
const N = NUMS.length;

// ---------------------------------------------------------------- simulate the user's code, step by step
// a step per loop iteration: i, the value written into res[i] and the carried product before/after
type Step = { pass: "prefix" | "postfix"; i: number; start: number; write: number; carry: number; carryBefore: number; carryAfter: number; resBefore: number; resAfter: number };
const STEPS: Step[] = (() => {
  const out: Step[] = [], res = Array(N).fill(0); let prefix = 1, postfix = 1, f = 270;
  for (let i = 0; i < N; i++) { const before = res[i]; res[i] = prefix; const cb = prefix; prefix *= NUMS[i]; out.push({ pass: "prefix", i, start: f, write: f + 30, carry: f + 75, carryBefore: cb, carryAfter: prefix, resBefore: before, resAfter: res[i] }); f += 120; }
  f = 810;
  for (let i = N - 1; i >= 0; i--) { const before = res[i]; res[i] *= postfix; const cb = postfix; postfix *= NUMS[i]; out.push({ pass: "postfix", i, start: f, write: f + 30, carry: f + 75, carryBefore: cb, carryAfter: postfix, resBefore: before, resAfter: res[i] }); f += 120; }
  if (res.join() !== EXPECTED.join()) throw new Error(`productExceptSelf: simulation gives [${res}], expected [${EXPECTED}]`);
  return out;
})();
const PRE = STEPS.filter((s) => s.pass === "prefix"), POST = STEPS.filter((s) => s.pass === "postfix");
export const CUE = { land: [15, 23, 30, 38], nums: 60, call: 90, def: 120, res: 150, prefix: 210, postfix: 750, ret: 1290, print: 1350, party: 1380, steps: STEPS };
const RUN: [number, number][] = [[CUE.nums, 0], [CUE.call, 13], [CUE.def, 2], [CUE.res, 3], [CUE.prefix, 4],
  ...PRE.flatMap((s): [number, number][] => [[s.start, 5], [s.write, 6], [s.carry, 7]]), [CUE.postfix, 8],
  ...POST.flatMap((s): [number, number][] => [[s.start, 9], [s.write, 10], [s.carry, 11]]), [CUE.ret, 12], [CUE.print, 13]];
for (const [f] of RUN) if (f % 15) throw new Error(`productExceptSelf: a run cue at ${f} is off the beat`);
const FLY = 26;
// res[i] at frame f: the last write whose flight has landed
const resAt = (f: number, i: number) => { let v = 0; for (const s of STEPS) if (s.i === i && f >= s.write + FLY + 2) v = s.resAfter; return v; };
const carryAt = (f: number): { name: "prefix" | "postfix"; v: number } | null => {
  if (f < CUE.prefix) return null;
  const pass = f >= CUE.postfix ? "postfix" : "prefix", ss = STEPS.filter((s) => s.pass === pass && f >= s.carry + FLY + 2);
  return { name: pass, v: ss.length ? ss[ss.length - 1].carryAfter : 1 };
};
const WATCH: [number, string, string][] = [
  [CUE.res, "res", `[${Array(N).fill(0).join(", ")}]`], [CUE.prefix, "prefix", "1"],
  ...STEPS.flatMap((s): [number, string, string][] => [[s.start, "i", String(s.i)], [s.write + FLY + 2, "res", `[${NUMS.map((_, k) => resAt(s.write + FLY + 2, k)).join(", ")}]`], [s.carry + FLY + 2, s.pass, String(s.carryAfter)]]),
  [CUE.postfix, "postfix", "1"],
];

// ---------------------------------------------------------------- layout
const DUCK_Y = 760, DUCK_K = 0.95, DUCK_X = [195, 425, 655, 885], TAG_Y = 845;
const CELL_Y = 1000, CARRY_Y = 1112, NOTE_Y = 560;
const PANEL: PanelLayout = { x: 46, y: 1196, w: 988, size: 23, lh: 36, pad: 18, file: "product_except_self.py" };

// ---------------------------------------------------------------- motion
const HOPS: [number, number, number][] = [
  ...STEPS.map((s) => [s.i, s.carry, 56] as [number, number, number]),
  ...NUMS.map((_, i) => [i, CUE.ret + i * 5, 70] as [number, number, number]),
  ...NUMS.map((_, i) => [i, CUE.party + i * 6, 54] as [number, number, number]),
  ...NUMS.map((_, i) => [i, CUE.party + 60 + i * 6, 34] as [number, number, number]),
];
export const QUACKS: [number, number][] = [
  ...CUE.land.map((f, i) => [f + 2, i] as [number, number]),
  ...NUMS.map((_, i) => [CUE.ret + i * 5 + 2, i] as [number, number]),
  ...NUMS.map((_, i) => [CUE.party + i * 6 + 2, i] as [number, number]),
];
const stepAt = (f: number) => [...STEPS].reverse().find((s) => f >= s.start && f < CUE.ret);
const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open";
  if (STEPS.some((s) => s.i === i && f >= s.carry && f < s.carry + 30)) e = "wide";
  if (f >= CUE.ret) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const s = stepAt(f), look = s && s.i !== i ? (s.i < i ? -0.8 : 0.9) : 0.3;
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye: eyeOf(i, f), look, label: String(NUMS[i]), seed: 7000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};
// the carried product's x: it rides under the current cell, entering from the left (prefix) or right (postfix)
const carryX = (f: number) => {
  const pass = f >= CUE.postfix ? POST : PRE, enter = f >= CUE.postfix ? DUCK_X[N - 1] + 150 : DUCK_X[0] - 150;
  let x = enter; for (const s of pass) if (f >= s.start) x = lerp(x, DUCK_X[s.i], ease.inOut(prog(f, s.start, 16)));
  return x;
};

// ---------------------------------------------------------------- sprites
const cellSprite = (env: Env, kind: "empty" | "set" | "done") => sprite(env, `pecell:${kind}`, 180, 120, 90, 60, (g) => {
  const col = kind === "done" ? mix(C.gold, "#efe6d3", 0.25) : kind === "set" ? mix(C.rose, "#efe6d3", 0.45) : "#e8dfca";
  wax(g, () => crayonShape(g, roundRect(-70, -40, 140, 80, 14, 5), { col, shade: kind === "empty" ? "#cdbf9f" : darker(col, 0.25), seed: kind === "done" ? 7702 : kind === "set" ? 7701 : 7700, lw: 2.4, gap: 4.6, w: 4.6 }));
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = new Gfx(ctx, env, f, CRAYON_M);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(pondPlate(env).canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  waterGlints(g, f, W, H);

  // rings: rose = the duck whose cell is being written; teal = its number is folded into the carry
  const s = stepAt(f);
  NUMS.forEach((_, i) => {
    if (f >= CUE.ret) { waterRing(g, DUCK_X[i], DUCK_Y + 14, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + i * 5, 8)), 560 + i); return; }
    if (s && s.i === i) waterRing(g, DUCK_X[i], DUCK_Y + 14, DUCK_K, s.pass === "prefix" ? C.rose : C.teal, ease.out(prog(f, s.start + 8, 8)), 500 + i);
  });
  NUMS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), ease.back(prog(f, CUE.nums + i * 3, 8))));

  // res cells under each duck: empty (0), set by prefix (rose), finished by postfix (gold)
  const rq = ease.back(prog(f, CUE.res, 10));
  if (rq > 0) {
    g.group("plain", () => text(g, "res", DUCK_X[0] - 70, CELL_Y - 62, { size: 28, align: "left", weight: 700, fill: C.ink, alpha: rq }));
    NUMS.forEach((_, i) => {
      const done = POST.some((p) => p.i === i && f >= p.write + FLY + 2), set = PRE.some((p) => p.i === i && f >= p.write + FLY + 2);
      const landed = STEPS.filter((p) => p.i === i && f >= p.write + FLY + 2).pop(), pop = landed ? hop(f, landed.write + FLY + 2, 16, 12).lift : 0;
      blit(ctx, env, cellSprite(env, done ? "done" : set ? "set" : "empty"), DUCK_X[i], CELL_Y - pop, rq, rq);
      g.group("plain", () => text(g, String(resAt(f, i)), DUCK_X[i], CELL_Y + 2 - pop, { size: 48, weight: 700, fill: set || done ? C.ink : "#a89c80", alpha: rq }));
    });
  }
  // the i marker over the current cell
  if (s) { const mx = lerp(DUCK_X[(STEPS[STEPS.indexOf(s) - 1] ?? s).i], DUCK_X[s.i], ease.inOut(prog(f, s.start, 14))); drawMarker(ctx, env, mx, CELL_Y - 44 + 4 * Math.sin(f * 0.16), "i", 0.92); }

  // the carried product (prefix rose / postfix teal) rides under the row
  const c = carryAt(f), cq = c ? ease.back(prog(f, c.name === "prefix" ? CUE.prefix : CUE.postfix, 10)) * (1 - ease.out(prog(f, c.name === "prefix" ? CUE.postfix - 8 : CUE.ret, 8))) : 0;
  if (c && cq > 0) blit(ctx, env, pillSprite(env, [[`${c.name} = `, C.ink], [String(c.v), c.name === "prefix" ? C.rose : darker(C.teal, 0.2)]]), carryX(f), CARRY_Y + 3 * Math.sin(f * 0.12), cq * 0.9, cq * 0.9);

  // ducks
  NUMS.forEach((_, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 14, (f - l) / 18, 1100 + i, 0.9));

  // flights: carry -> res[i] (the write), duck's number -> carry (the multiply)
  const fly = (t: string, a: P, b: P, t0: number, arc: number, col = "#f6f0e2") => {
    if (f < t0 || f >= t0 + FLY) return;
    const u = ease.inOut(prog(f, t0, FLY)), x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - arc * 4 * u * (1 - u), k = 1 + 0.3 * Math.sin(Math.PI * u);
    g.group("plain", () => text(g, t, x, y, { size: 42 * k, weight: 700, fill: col, stroke: C.ink, sw: 7 }));
  };
  STEPS.forEach((p) => {
    fly(p.pass === "prefix" ? String(p.carryBefore) : `×${p.carryBefore}`, [DUCK_X[p.i], CARRY_Y], [DUCK_X[p.i], CELL_Y], p.write + 2, 70);
    fly(`×${NUMS[p.i]}`, chest(pose(p.i, f)), [DUCK_X[p.i] + 40, CARRY_Y], p.carry + 2, 120);
  });

  // what the line just did, in words, with what the carried value means
  const lineNote = (() => {
    if (!s) return f >= CUE.ret && f < CUE.print ? { t: `return [${EXPECTED.join(", ")}]`, sub: "" } : null;
    const at = f >= s.carry ? 2 : f >= s.write ? 1 : 0, nm = s.pass, left = s.pass === "prefix";
    const t = at === 0 ? `i = ${s.i}` : at === 1 ? (left ? `res[${s.i}] = prefix = ${s.resAfter}` : `res[${s.i}] = ${s.resBefore} × postfix ${s.carryBefore} = ${s.resAfter}`) : `${nm} = ${s.carryBefore} × ${NUMS[s.i]} = ${s.carryAfter}`;
    return { t, sub: left ? "prefix = product of everything left of i" : "postfix = product of everything right of i" };
  })();
  if (lineNote) g.group("plain", () => {
    text(g, lineNote.t, 540, NOTE_Y, { size: 36, weight: 700, fill: C.ink, alpha: 1 - prog(f, CUE.print - 6, 6) });
    if (lineNote.sub) text(g, lineNote.sub, 540, NOTE_Y + 40, { size: 24, weight: 500, fill: C.inkSoft, alpha: 0.9 });
  });

  // the answer
  const aq = ease.spring(prog(f, CUE.print, 24));
  if (aq > 0) drawCard(ctx, env, 540, 545, "productExceptSelf returns", `[${EXPECTED.join(", ")}]`, aq);
  if (f >= CUE.party) for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 290, 545 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + k), a); }

  const tq = ease.spring(prog(f, 0, 20));
  blit(ctx, env, titleSprite(env, "Product of Array Except Self", "LeetCode 238  ·  Python"), 540, 270, tq, tq);
  const pq = ease.back(prog(f, CUE.nums, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8)));
  blit(ctx, env, pillSprite(env, [["nums = ", C.ink], [`[${NUMS.join(", ")}]`, C.rose]]), 540, 432, pq, pq);
  g.paper("paper", 0.05);

  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const shown = from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 8)));
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  for (const [f0, k, v] of [...WATCH].sort((x, y) => x[0] - y[0])) if (f >= f0) { if (watch.get(k) !== v) { fresh = k; freshAt = f0; } watch.set(k, v); }
  drawPanel(g, CODE, PANEL, {
    line: shown, alpha: prog(f, CUE.nums - 4, 6), pulse: f >= CUE.ret && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: `[${EXPECTED.join(", ")}]`, outQ: prog(f, CUE.print + 4, 12),
  });
};

export const productExceptSelf: Film = {
  meta: {
    title: "Product of Array Except Self · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: POST[1].write + 40,
    holds: [[CUE.party + 100, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.nums, to: PRE[0].start, text: `nums = [${NUMS.join(", ")}]` },
      { from: PRE[0].start, to: CUE.postfix, text: "Left to right: each cell gets the product of everything to its left." },
      { from: CUE.postfix, to: CUE.ret, text: "Right to left: multiply in the product of everything to its right." },
      { from: CUE.ret, to: DURATION, text: `Output: [${EXPECTED.join(", ")}]` },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "productExceptSelf", start: 0, end: DURATION, draw }],
  audio: productExceptSelfAudio(FPS, DURATION, { ...CUE, quacks: QUACKS }),
};
