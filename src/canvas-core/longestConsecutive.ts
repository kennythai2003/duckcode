// LONGEST CONSECUTIVE SEQUENCE · duckcode, crayon, 9:16, 52 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Six ducks drop their numbers into numSet, laid out as a number line
// so neighbours sit side by side. The num marker visits the set in Python's own iteration order;
// a ghost cell asks "is num - 1 here?", and only when it isn't does a run start and grow to the
// right until a ghost says "num + length isn't here". The longest run, 1-2-3-4, wins: 4.
// Every value on screen comes from simulating the user's code below, in the iteration order that
// CPython actually produced for this input (checked with python3 before rendering).
import { Gfx, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { pondPlate, waterGlints } from "./duck/pond";
import { drawDuck, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { drawCard, drawCheck, drawCross, drawMarker, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C, CRAYON_M, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { pillSprite, titleSprite } from "./duck/chrome";
import { lerp, mix } from "./gallery";
import { longestConsecutiveAudio } from "./longestConsecutiveSound";

const FPS = 30, BPM = 120, DURATION = 1560, W = 1080, H = 1920;

// ---------------------------------------------------------------- the problem
const NUMS = [100, 4, 200, 1, 3, 2], EXPECTED = 4;
const ORDER = [1, 2, 3, 100, 4, 200];   // CPython's iteration order of set(NUMS), from `python3 -I`
const CODE = [
  `nums = [${NUMS.join(", ")}]`,
  "class Solution:",
  "    def longestConsecutive(self, nums: List[int]) -> int:",
  "        numSet = set(nums)",
  "        longest = 0",
  "        for num in numSet:",
  "            if (num - 1) not in numSet:",
  "                length = 1",
  "                while (num + length) in numSet:",
  "                    length += 1",
  "                longest = max(length, longest)",
  "        return longest",
  "print(Solution().longestConsecutive(nums))",
];
const SET = new Set(NUMS);
if (ORDER.length !== SET.size || !ORDER.every((v) => SET.has(v))) throw new Error("longestConsecutive: ORDER is not the set");

// ---------------------------------------------------------------- simulate the user's code, line by line
type Snap = { f: number; line: number; num: number; length: number; longest: number; check?: { v: number; inSet: boolean }; run?: number[]; note: string; sub?: string };
const SIM: Snap[] = (() => {
  const out: Snap[] = []; let f = 300, longest = 0;
  const at = (s: Omit<Snap, "f">, dur: number) => { out.push({ f, ...s }); f += dur; };
  for (const num of ORDER) {
    at({ line: 5, num, length: 0, longest, note: `num = ${num}` }, 30);
    if (SET.has(num - 1)) { at({ line: 6, num, length: 0, longest, check: { v: num - 1, inSet: true }, note: `${num - 1} is in numSet`, sub: `so ${num} is not the start of a run: skip` }, 60); continue; }
    at({ line: 6, num, length: 0, longest, check: { v: num - 1, inSet: false }, note: `${num - 1} is not in numSet`, sub: `so ${num} starts a run` }, 45);
    let length = 1; at({ line: 7, num, length, longest, run: [num], note: "length = 1" }, 30);
    while (SET.has(num + length)) {
      at({ line: 8, num, length, longest, run: rng(num, length), check: { v: num + length, inSet: true }, note: `${num + length} is in numSet` }, 30);
      length += 1; at({ line: 9, num, length, longest, run: rng(num, length), note: `length = ${length}` }, 30);
    }
    at({ line: 8, num, length, longest, run: rng(num, length), check: { v: num + length, inSet: false }, note: `${num + length} is not in numSet`, sub: "the run stops here" }, 30);
    const before = longest; longest = Math.max(length, longest);
    at({ line: 10, num, length, longest, run: rng(num, length), note: `longest = max(${length}, ${before}) = ${longest}` }, 45);
  }
  out.push({ f, line: 11, num: ORDER[ORDER.length - 1], length: 0, longest, note: `return ${longest}` });
  if (longest !== EXPECTED) throw new Error(`longestConsecutive: simulation gives ${longest}, expected ${EXPECTED}`);
  return out;
})();
function rng(a: number, n: number) { return Array.from({ length: n }, (_, k) => a + k); }
const RET = SIM[SIM.length - 1].f;
export const CUE = { land: [15, 21, 27, 39, 45, 51], nums: 60, call: 90, def: 120, set: 150, longest: 255, ret: RET, print: RET + 60, party: RET + 90, sim: SIM };
if (CUE.party + 150 > DURATION) throw new Error("longestConsecutive: the film is too short for its timeline");
const RUN: [number, number][] = [[CUE.nums, 0], [CUE.call, 12], [CUE.def, 2], [CUE.set, 3], [CUE.longest, 4], ...SIM.map((s): [number, number] => [s.f, s.line]), [CUE.print, 12]];
for (const [f] of RUN) if (f % 15) throw new Error(`longestConsecutive: a run cue at ${f} is off the beat`);
// the best run, for the gold ending
const BEST = (() => { let b: number[] = []; for (const s of SIM) if (s.line === 10 && s.run && s.run.length >= b.length && s.longest === s.run.length) b = s.run; return b; })();

// ---------------------------------------------------------------- layout
const DUCK_Y = 740, DUCK_K = 0.68, DUCK_X = [100, 262, 424, 586, 748, 910], TAG_Y = 822, NOTE_Y = 535;
// the number line: real cells for the set, ghost slots for the neighbours the code asks about
const POS: Record<number, P> = { 0: [140, 1000], 1: [250, 1000], 2: [360, 1000], 3: [470, 1000], 4: [580, 1000], 5: [690, 1000], 99: [250, 1120], 100: [360, 1120], 101: [470, 1120], 199: [690, 1120], 200: [800, 1120], 201: [910, 1120] };
for (const s of SIM) if (s.check && !POS[s.check.v]) throw new Error(`longestConsecutive: no slot for ${s.check.v}`);
const PANEL: PanelLayout = { x: 46, y: 1196, w: 988, size: 23, lh: 36, pad: 18, file: "longest_consecutive.py" };
const LAND_AT = (k: number) => CUE.set + 10 + k * 12;   // duck k's number lands in numSet

// ---------------------------------------------------------------- motion
const duckOf = (v: number) => NUMS.indexOf(v);
const HOPS: [number, number, number][] = [
  ...SIM.filter((s) => s.line === 5).map((s) => [duckOf(s.num), s.f + 4, 50] as [number, number, number]),
  ...BEST.map((v, k) => [duckOf(v), RET + k * 6, 76] as [number, number, number]),
  ...NUMS.map((_, i) => [i, CUE.party + i * 5, 46] as [number, number, number]),
  ...NUMS.map((_, i) => [i, CUE.party + 60 + i * 5, 30] as [number, number, number]),
];
export const QUACKS: [number, number][] = [
  ...CUE.land.map((f, i) => [f + 2, i] as [number, number]),
  ...BEST.map((v, k) => [RET + k * 6 + 2, duckOf(v)] as [number, number]),
  ...NUMS.map((_, i) => [CUE.party + i * 5 + 2, i] as [number, number]),
];
const snapAt = (f: number) => [...SIM].reverse().find((s) => f >= s.f);
const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open"; const s = snapAt(f);
  if (s && s.check && duckOf(s.num) === i && f < RET) e = s.check.inSet && s.line === 6 ? "worried" : "wide";
  if ((f >= RET && BEST.includes(NUMS[i])) || f >= CUE.party - 6) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye: eyeOf(i, f), look: 0.3, label: String(NUMS[i]), seed: 8000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
const cellSprite = (env: Env, v: number, kind: "set" | "run" | "best" | "ghost") => sprite(env, `lccell:${v}:${kind}`, 130, 110, 65, 55, (g) => {
  const col = kind === "best" ? mix(C.gold, "#efe6d3", 0.2) : kind === "run" ? mix(C.teal, "#efe6d3", 0.15) : kind === "ghost" ? "#ece5d4" : "#e8dfca";
  wax(g, () => crayonShape(g, roundRect(-48, -36, 96, 72, 14, 5), { col, shade: kind === "ghost" ? "#ddd3bd" : darker(col, 0.25), seed: 8700 + (kind === "ghost" ? 3 : kind === "run" ? 1 : kind === "best" ? 2 : 0), lw: kind === "ghost" ? 1.4 : 2.4, gap: kind === "ghost" ? 7 : 4.4, w: 4.4 }));
  text(g, String(v), 0, 2, { size: v >= 100 ? 34 : 42, weight: 700, fill: kind === "ghost" ? "#a89c80" : kind === "set" ? C.ink : "#f6f0e2" });
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = new Gfx(ctx, env, f, CRAYON_M);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(pondPlate(env).canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  waterGlints(g, f, W, H);
  const s = f < RET ? snapAt(f) : undefined;

  // rings: rose = the duck whose number is num; gold = the ducks of the longest run
  NUMS.forEach((v, i) => {
    if (f >= RET) { if (BEST.includes(v)) waterRing(g, DUCK_X[i], DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, RET + BEST.indexOf(v) * 6, 8)), 560 + i); return; }
    if (s && s.num === v) waterRing(g, DUCK_X[i], DUCK_Y + 12, DUCK_K, C.rose, ease.out(prog(f, SIM.find((x) => x.num === v)!.f + 6, 8)), 500 + i);
  });
  NUMS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), ease.back(prog(f, CUE.nums + i * 3, 8))));

  // numSet on a number line: set cells; the current run teal; the best run gold at the end; ghosts on demand
  const sq = prog(f, CUE.set, 8);
  if (sq > 0) g.group("plain", () => { text(g, "numSet", 46, 930, { size: 28, weight: 700, fill: C.ink, align: "left", alpha: sq }); text(g, "…", 590, 1120, { size: 40, weight: 700, fill: "#5d6e74", alpha: sq }); });
  NUMS.forEach((v, k) => {
    const q = ease.spring(prog(f, LAND_AT(k) + 20, 18)); if (q <= 0) return;
    const kind = f >= RET && BEST.includes(v) ? "best" : s?.run?.includes(v) ? "run" : "set";
    const pop = s?.run && s.run[s.run.length - 1] === v && s.line !== 8 ? hop(f, s.f, 14, 12).lift : 0;
    blit(ctx, env, cellSprite(env, v, kind), POS[v][0], POS[v][1] - pop, q, q);
  });
  if (s?.check) {
    const { v, inSet } = s.check, [x, y] = POS[v], q = ease.back(prog(f, s.f + 2, 10));
    if (!SET.has(v)) blit(ctx, env, cellSprite(env, v, "ghost"), x, y, q, q, 0, 0.9);
    (inSet ? drawCheck : drawCross)(ctx, env, x + 46, y - 52, q * 0.8);
  }
  if (s) drawMarker(ctx, env, POS[s.num][0], POS[s.num][1] - 40 + 4 * Math.sin(f * 0.16), "num", 0.9);

  // ducks; their numbers fly into numSet when the set is built
  NUMS.forEach((_, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 12, (f - l) / 18, 1100 + i, 0.7));
  NUMS.forEach((v, k) => {
    const t0 = LAND_AT(k); if (f < t0 || f >= t0 + 22) return;
    const u = ease.inOut(prog(f, t0, 22)), a = chest(pose(k, f)), b = POS[v], x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - 100 * 4 * u * (1 - u);
    g.group("plain", () => text(g, String(v), x, y, { size: 38, weight: 700, fill: "#f6f0e2", stroke: C.ink, sw: 7 }));
  });

  // what the line just did
  const note = f >= RET && f < CUE.print ? { note: `return ${EXPECTED}`, sub: "the run 1, 2, 3, 4 is the longest" } : s;
  if (note && f < CUE.print) g.group("plain", () => {
    text(g, note.note, 540, NOTE_Y, { size: 36, weight: 700, fill: C.ink });
    if (note.sub) text(g, note.sub, 540, NOTE_Y + 40, { size: 26, weight: 500, fill: C.inkSoft });
  });

  // the answer
  const aq = ease.spring(prog(f, CUE.print, 24));
  if (aq > 0) drawCard(ctx, env, 540, 545, "longestConsecutive returns", String(EXPECTED), aq);
  if (f >= CUE.party) for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 280, 545 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + k), a); }

  // title; the pill shows nums, then longest
  const tq = ease.spring(prog(f, 0, 20));
  blit(ctx, env, titleSprite(env, "Longest Consecutive Sequence", "LeetCode 128  ·  Python"), 540, 270, tq, tq);
  const pq = ease.back(prog(f, CUE.nums, 10)) * (1 - ease.out(prog(f, CUE.longest - 4, 8)));
  blit(ctx, env, pillSprite(env, [["nums = ", C.ink], [`[${NUMS.join(", ")}]`, C.rose]]), 540, 432, pq, pq);
  const lq = ease.back(prog(f, CUE.longest + 4, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8))), lv = (snapAt(f) ?? { longest: 0 }).longest;
  blit(ctx, env, pillSprite(env, [["longest = ", C.ink], [String(lv), darker(C.gold, 0.3)]]), 540, 432, lq, lq);
  g.paper("paper", 0.05);

  // the code
  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const shown = from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 8)));
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  const W_: [number, string, string][] = [[CUE.longest, "longest", "0"], ...SIM.flatMap((x): [number, string, string][] => [[x.f, "num", String(x.num)], ...(x.length ? [[x.f, "length", String(x.length)] as [number, string, string]] : []), [x.f, "longest", String(x.longest)]])];
  for (const [f0, k, v] of W_.sort((a, b) => a[0] - b[0])) if (f >= f0) { if (watch.get(k) !== v) { fresh = k; freshAt = f0; } watch.set(k, v); }
  drawPanel(g, CODE, PANEL, {
    line: shown, alpha: prog(f, CUE.nums - 4, 6), pulse: f >= RET && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: String(EXPECTED), outQ: prog(f, CUE.print + 4, 8),
  });
};

export const longestConsecutive: Film = {
  meta: {
    title: "Longest Consecutive Sequence · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: SIM[8].f + 10,
    holds: [[CUE.party + 100, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.nums, to: SIM[0].f, text: `nums = [${NUMS.join(", ")}]` },
      { from: SIM[0].f, to: RET, text: "Only a number with no left neighbour starts a run; then count to the right." },
      { from: RET, to: DURATION, text: `Output: ${EXPECTED}` },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "longestConsecutive", start: 0, end: DURATION, draw }],
  audio: longestConsecutiveAudio(FPS, DURATION, { ...CUE, quacks: QUACKS }),
};
