// CONTAINS DUPLICATE · duckcode, crayon, 9:16, 48 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Five ducks float in a row, each wearing a number. Duck by duck,
// each asks the seen pond "am I already here?"; nobody is, so it leaves its number on a lily pad.
// The second 1 finds its twin's pad, the two 1-ducks light up gold, and the answer is True.
// The token: the lily pad marked 1, laid by duck 1 and found by duck 3.
import { Gfx, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { pondPlate, waterGlints } from "./duck/pond";
import { drawDuck, drawPointer, headTop, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { drawBubble, drawCard, drawCheck, drawCross, drawEntry, drawMagnifier, drawSign, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C, CRAYON_M, blit } from "./duck/crayon";
import { FONTS, ease, prog, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { pillSprite, titleSprite } from "./duck/chrome";
import { lerp } from "./gallery";
import { containsDuplicateAudio } from "./containsDuplicateSound";

const FPS = 30, BPM = 120, DURATION = 1440, W = 1080, H = 1920;

// ---------------------------------------------------------------- the problem
const NUMS = [3, 1, 4, 1, 5];
const CODE = [
  `nums = [${NUMS.join(", ")}]`,
  "class Solution:",
  "    def containsDuplicate(self, nums: List[int]) -> bool:",
  "        seen = set()",
  "        for num in nums:",
  "            if num in seen:",
  "                return True",
  "            seen.add(num)",
  "        return False",
  "print(Solution().containsDuplicate(nums))",
];

// ---------------------------------------------------------------- the cue table (frames, on the beat)
// a pass per duck until the hit: pointer lands (start), the magnifier asks (check), a miss adds the number (add)
type Pass = { duck: number; start: number; check: number; add?: number; hit?: number };
const PASS: Pass[] = [
  { duck: 0, start: 270, check: 330, add: 435 },
  { duck: 1, start: 540, check: 585, add: 675 },
  { duck: 2, start: 750, check: 795, add: 885 },
  { duck: 3, start: 960, check: 1005, hit: 1 },       // hit: the pad index it finds
];
export const CUE = { land: [15, 23, 30, 38, 45], nums: 60, call: 90, def: 120, seen: 180, ret: 1110, print: 1200, party: 1230, passes: PASS };
const RUN: [number, number][] = [[CUE.nums, 0], [CUE.call, 9], [CUE.def, 2], [CUE.seen, 3],
  ...PASS.flatMap((p): [number, number][] => [[p.start, 4], [p.check, 5], ...(p.add !== undefined ? [[p.add, 7] as [number, number]] : [])]),
  [CUE.ret, 6], [CUE.print, 9]];
for (const [f] of RUN) if (f % 15) throw new Error(`containsDuplicate: a run cue at ${f} is off the beat`);
const VERDICT = (p: Pass) => p.check + 30;          // the magnifier has looked
const LANDS = (p: Pass) => p.add! + 30;             // the number reaches its pad
const MISSES = PASS.filter((p) => p.add !== undefined), HIT = PASS[PASS.length - 1];
const TWIN = MISSES[HIT.hit!].duck;                 // the duck that laid the pad the hit finds
const WATCH: [number, string, string][] = [
  [CUE.seen, "seen", "set()"],
  ...PASS.map((p): [number, string, string] => [p.start, "num", String(NUMS[p.duck])]),
  ...MISSES.map((p, k): [number, string, string] => [LANDS(p), "seen", `{${MISSES.slice(0, k + 1).map((q) => NUMS[q.duck]).join(", ")}}`]),
];

// ---------------------------------------------------------------- layout
const DUCK_Y = 820, DUCK_K = 0.8, DUCK_X = [140, 340, 540, 740, 940], TAG_Y = 905;
const PAD_X = [380, 600, 820], PAD_Y = 1086, SIGN: P = [150, 1080];
const PANEL: PanelLayout = { x: 46, y: 1196, w: 988, size: 25, lh: 40, pad: 18, file: "contains_duplicate.py" };

// ---------------------------------------------------------------- motion
const HOPS: [number, number, number][] = [
  ...PASS.map((p, k) => [p.duck, p.start + (k === 0 ? 6 : 18), 60] as [number, number, number]),
  [HIT.duck, VERDICT(HIT) + 2, 44], [TWIN, VERDICT(HIT) + 10, 44],
  [TWIN, CUE.ret, 80], [HIT.duck, CUE.ret + 6, 80],
  ...NUMS.map((_, i) => [i, CUE.party + i * 6, 54] as [number, number, number]),
  ...NUMS.map((_, i) => [i, CUE.party + 60 + i * 6, 34] as [number, number, number]),
];
export const QUACKS: [number, number][] = [
  ...CUE.land.map((f, i) => [f + 2, i] as [number, number]),
  [VERDICT(HIT) + 4, HIT.duck], [VERDICT(HIT) + 12, TWIN], [CUE.ret + 2, TWIN], [CUE.ret + 8, HIT.duck],
  ...NUMS.map((_, i) => [CUE.party + i * 6 + 2, i] as [number, number]),
];
const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open";
  if (MISSES.some((p) => p.duck === i && f >= VERDICT(p) && f < p.add! + 6)) e = "worried";
  if ((i === HIT.duck || i === TWIN) && f >= VERDICT(HIT) && f < CUE.ret) e = "wide";
  if (((i === HIT.duck || i === TWIN) && f >= CUE.ret) || f >= CUE.party - 6) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const look = PASS.some((p) => p.duck === i && f >= p.check && f < (p.add ?? CUE.ret) + 30) ? -0.8 : i === TWIN && f >= VERDICT(HIT) && f < CUE.ret ? 0.9 : 0.3;
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye: eyeOf(i, f), look, label: String(NUMS[i]), seed: 4000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};
const pointerAt = (f: number): { at: P; tilt: number } | null => {
  if (f < PASS[0].start) return null;
  const top = (i: number) => headTop(pose(i, f));
  if (f < PASS[0].start + 12) { const t = ease.out((f - PASS[0].start) / 12), p = top(0); return { at: [lerp(p[0] - 200, p[0], t), lerp(-120, p[1], t)], tilt: lerp(-1, -0.12, t) }; }
  let cur = 0;
  for (let k = 1; k < PASS.length; k++) if (f >= PASS[k].start) {
    const a = top(PASS[k - 1].duck), b = top(PASS[k].duck), t = ease.inOut((f - PASS[k].start) / 20);
    if (t < 1) return { at: [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - 120 * 4 * t * (1 - t)], tilt: -0.12 + 0.5 * Math.sin(Math.PI * t) };
    cur = k;
  }
  return { at: top(PASS[cur].duck), tilt: -0.12 };
};

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = new Gfx(ctx, env, f, CRAYON_M);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(pondPlate(env).canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  waterGlints(g, f, W, H);

  // rings: rose = asking, teal = asked and added, gold = the duplicate pair
  PASS.forEach((p, k) => {
    const arrive = p.start + (k === 0 ? 12 : 20), done = p.add !== undefined ? LANDS(p) : CUE.ret;
    const ring = (col: string, f0: number, f1: number) => waterRing(g, DUCK_X[p.duck], DUCK_Y + 14, DUCK_K, col, ease.out(prog(f, f0, 8)) * (f < f1 ? 1 : 0), 500 + p.duck * 10 + col.length);
    ring(C.rose, arrive, done); if (p.add !== undefined) ring(C.teal, done, p.duck === TWIN ? CUE.ret : 1e9);
  });
  if (f >= CUE.ret) [TWIN, HIT.duck].forEach((i, j) => waterRing(g, DUCK_X[i], DUCK_Y + 14, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + j * 6, 8)), 590 + i));

  NUMS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), ease.back(prog(f, CUE.nums + i * 3, 8)), (i === TWIN || i === HIT.duck) && f >= CUE.ret ? ease.out(prog(f, CUE.ret, 10)) : 0));

  // the seen pond: sign, "{ }" while empty, a pad per number
  drawSign(ctx, env, SIGN[0], SIGN[1] + 8 * (1 - ease.spring(prog(f, CUE.seen, 18))), "seen", ease.back(prog(f, CUE.seen, 10)));
  const emptyA = prog(f, CUE.seen + 8, 8) * (1 - prog(f, LANDS(MISSES[0]) - 2, 6));
  if (emptyA > 0) g.group("plain", () => text(g, "{ }", PAD_X[0], PAD_Y - 4, { size: 54, weight: 700, fill: "#e6ece6", alpha: emptyA * 0.85 }));
  MISSES.forEach((p, k) => {
    const q = ease.spring(prog(f, LANDS(p), 24)); if (q <= 0) return;
    const hit = k === HIT.hit, glow = hit && f >= VERDICT(HIT) ? 0.5 + 0.5 * Math.sin((f - VERDICT(HIT)) * 0.2) : 0, bounce = hit ? hop(f, VERDICT(HIT), 26).lift : 0;
    drawEntry(ctx, env, PAD_X[k], PAD_Y - bounce, String(NUMS[p.duck]), q, glow, 800 + k * 20);
    splash(g, PAD_X[k], PAD_Y, (f - LANDS(p)) / 16, 1300 + k, 0.6);
  });

  // ducks, pointer, splashes
  NUMS.forEach((_, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  const pt = pointerAt(f); if (pt) drawPointer(ctx, env, pt.at, DUCK_K * 1.1, pt.tilt, "num");
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 14, (f - l) / 18, 1100 + i, 0.8));
  HOPS.forEach(([i, f0, h], j) => { if (h >= 60) splash(g, DUCK_X[i], DUCK_Y + 14, (f - f0 - 16) / 16, 1200 + j, 0.55); });

  // each pass: is num in seen? the magnifier looks, then a miss adds the number to the pond
  PASS.forEach((p, k) => {
    const n = NUMS[p.duck], end = p.add ?? CUE.ret;
    if (f >= p.check + 4 && f < end + 8) {
      const placed = MISSES.filter((m) => LANDS(m) <= p.check).length;
      const target = p.hit !== undefined ? PAD_X[p.hit] + 60 : placed === 0 ? PAD_X[0] + 10 : PAD_X[placed - 1] + 40 + 30 * Math.sin((f - p.check) * 0.15);
      const out = 1 - ease.out(prog(f, end - 4, 10)), mx = lerp(PAD_X[0] - 130, target, ease.inOut(prog(f, p.check + 4, 22))), my = PAD_Y - 96 + 20 * (1 - out);
      drawMagnifier(ctx, env, mx, my, 0.95 * out);
      const v = ease.back(prog(f, VERDICT(p), 10)) * out;
      if (p.hit !== undefined) {
        drawCheck(ctx, env, mx + 4, my - 4, v * 0.7);
        drawBubble(ctx, env, Math.min(mx + 250, 740), my - 60, [[String(n), C.rose], [" is already in seen!", C.ink]], [mx + 60, my + 6], v, 1610, 32);
        for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + f * 0.04; drawSparkle(ctx, env, PAD_X[p.hit] + Math.cos(a) * 130, PAD_Y - 10 + Math.sin(a) * 56, (12 + 4 * Math.sin(f * 0.3 + s)) * v, f * 0.03 + s); }
      } else {
        drawCross(ctx, env, mx + 4, my - 4, v * 0.6);
        drawBubble(ctx, env, Math.min(mx + 260, 800), my + 12, [[String(n), C.rose], [" isn't in seen", C.ink]], [mx + 60, my + 6], v, 1510 + k, 32);
      }
    }
    if (p.add !== undefined && f >= p.add && f < LANDS(p) + 2) {
      const u = ease.inOut(prog(f, p.add + 2, 28)), a = chest(pose(p.duck, f)), b: P = [PAD_X[k] - 6, PAD_Y - 10];
      const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - 170 * 4 * u * (1 - u), s = 1 + 0.4 * Math.sin(Math.PI * u);
      g.group("plain", () => text(g, String(n), x, y, { size: 44 * s, weight: 700, fill: "#f6f0e2", stroke: C.ink, sw: 7 }));
      drawSparkle(ctx, env, x - 26, y + 20, 10 * Math.sin(Math.PI * u), f * 0.1);
    }
  });
  // the twins: a dotted line of sparkles between the two 1-ducks once the hit is found
  if (f >= VERDICT(HIT) + 10) { const q = prog(f, VERDICT(HIT) + 10, 20); for (let s = 0; s < 5; s++) { const u = (s + 0.5) / 5; if (u <= q) drawSparkle(ctx, env, lerp(DUCK_X[TWIN], DUCK_X[HIT.duck], u), DUCK_Y - 175 - 40 * Math.sin(Math.PI * u), 10 + 3 * Math.sin(f * 0.3 + s), s); } }

  // the answer
  const cq = ease.spring(prog(f, CUE.print, 24));
  if (cq > 0) drawCard(ctx, env, 540, 540, "containsDuplicate returns", "True", cq);
  if (f >= CUE.party) for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 280, 540 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + s), a); }

  const tq = ease.spring(prog(f, 0, 20));
  blit(ctx, env, titleSprite(env, "Contains Duplicate", "LeetCode 217  ·  Python"), 540, 270, tq, tq);
  const pq = ease.back(prog(f, CUE.nums, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8)));
  blit(ctx, env, pillSprite(env, [["nums = ", C.ink], [`[${NUMS.join(", ")}]`, C.rose]]), 540, 432, pq, pq);
  g.paper("paper", 0.05);

  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const shown = from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 8)));
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  for (const [f0, k, v] of [...WATCH].sort((x, y) => x[0] - y[0])) if (f >= f0) { watch.set(k, v); fresh = k; freshAt = f0; }
  drawPanel(g, CODE, PANEL, {
    line: shown, alpha: prog(f, CUE.nums - 4, 6), pulse: f >= VERDICT(HIT) && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: "True", outQ: prog(f, CUE.print + 4, 10),
  });
};

export const containsDuplicate: Film = {
  meta: {
    title: "Contains Duplicate · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: VERDICT(HIT) + 20,
    holds: [[CUE.party + 100, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.nums, to: PASS[0].start, text: `nums = [${NUMS.join(", ")}]` },
      { from: PASS[0].start, to: HIT.start, text: "Each number asks: am I already in seen? No: add it." },
      { from: HIT.start, to: CUE.ret, text: "The second 1 finds its twin in seen." },
      { from: CUE.ret, to: DURATION, text: "Output: True" },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "containsDuplicate", start: 0, end: DURATION, draw }],
  audio: containsDuplicateAudio(FPS, DURATION, { ...CUE, quacks: QUACKS }),
};
