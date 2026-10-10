// TOP K FREQUENT ELEMENTS · duckcode, crayon, 9:16, 72 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Six ducks float in a row; each drops its number onto a count pad,
// so the pads read 1:3, 2:2, 3:1. Each number then moves into the freq row at the cell for its
// count, a bucket per frequency. A pointer walks the buckets from the top down and collects
// numbers until it has k of them: [1, 2].
// The token: the number 1, which lands on the tallest count, in the highest bucket, first in res.
import { Gfx, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { pondPlate, waterGlints } from "./duck/pond";
import { drawDuck, drawPointer, headTop, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { drawBubble, drawCard, drawEntry, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C, CRAYON_M, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { pillSprite, titleSprite } from "./duck/chrome";
import { lerp } from "./gallery";
import { topKFrequentAudio } from "./topKFrequentSound";

const FPS = 30, BPM = 120, DURATION = 2160, W = 1080, H = 1920;

// ---------------------------------------------------------------- the problem
const NUMS = [1, 1, 1, 2, 2, 3], K = 2;
const CODE = [
  `nums = [${NUMS.join(", ")}]`,
  `k = ${K}`,
  "class Solution:",
  "    def topKFrequent(self, nums: List[int], k: int) -> List[int]:",
  "        count = {}",
  "        freq = [[] for i in range(len(nums) + 1)]",
  "        for num in nums:",
  "            count[num] = 1 + count.get(num, 0)",
  "        for num, cnt in count.items():",
  "            freq[cnt].append(num)",
  "        res = []",
  "        for i in range(len(freq) - 1, 0, -1):",
  "            for num in freq[i]:",
  "                res.append(num)",
  "                if len(res) == k:",
  "                    return res",
  "print(Solution().topKFrequent(nums, k))",
];
const KEYS = [...new Set(NUMS)];                                    // count pads, in insertion order
const CNT = KEYS.map((n) => NUMS.filter((x) => x === n).length);    // final counts
const NF = NUMS.length + 1;                                         // freq cells 0..len(nums)

// ---------------------------------------------------------------- the cue table (frames, on the beat)
// phase 1: a pass per duck (pointer lands, the number flies to its count pad)
const P1 = NUMS.map((_, k) => { const start = k === 0 ? 300 : 450 + 105 * (k - 1); return { duck: k, start, fly: start + 45, lands: start + 73 }; });
// phase 2: a pass per count entry (the pad lights, its number flies to freq[cnt])
const P2 = KEYS.map((_, k) => { const start = 975 + 120 * k; return { key: k, start, fly: start + 45, lands: start + 75 }; });
// phase 3: i walks the cells from the top; a non-empty cell appends its numbers
type Step = { i: number; at: number; inner: number; appends: { num: number; at: number; check: number }[] };
const P3: Step[] = (() => {
  const out: Step[] = []; let f = 1380, got = 0;
  for (let i = NF - 1; i > 0 && got < K; i--) {
    const nums = KEYS.filter((_, k) => CNT[k] === i), appends: Step["appends"] = [];
    const s: Step = { i, at: f, inner: f + 30, appends }; f += 60;
    for (const n of nums) { if (got >= K) break; appends.push({ num: n, at: f, check: f + 45 }); got++; f += 90; }
    out.push(s);
  }
  return out;
})();
const LAST = P3[P3.length - 1].appends.slice(-1)[0];
export const CUE = { land: [15, 21, 27, 39, 45, 51], nums: 60, k: 75, call: 105, def: 135, count: 180, freq: 240, items: 975, res: 1335, ret: LAST.check + 45, print: LAST.check + 135, party: LAST.check + 165, p1: P1, p2: P2, p3: P3 };
const RUN: [number, number][] = [[CUE.nums, 0], [CUE.k, 1], [CUE.call, 16], [CUE.def, 3], [CUE.count, 4], [CUE.freq, 5],
  ...P1.flatMap((p): [number, number][] => [[p.start, 6], [p.fly, 7]]),
  ...P2.flatMap((p): [number, number][] => [[p.start, 8], [p.fly, 9]]),
  [CUE.res, 10], ...P3.flatMap((s): [number, number][] => [[s.at, 11], [s.inner, 12], ...s.appends.flatMap((a): [number, number][] => [[a.at, 13], [a.check, 14]])]),
  [CUE.ret, 15], [CUE.print, 16]];
for (const [f] of RUN) if (f % 15) throw new Error(`topKFrequent: a run cue at ${f} is off the beat`);
const countAt = (f: number) => KEYS.map((n) => P1.filter((p) => NUMS[p.duck] === n && f >= p.lands).length);
const resAt = (f: number) => P3.flatMap((s) => s.appends).filter((a) => f >= a.at + 28).map((a) => a.num);
const fmtCount = (c: number[]) => `{${KEYS.map((n, k) => (c[k] ? `${n}: ${c[k]}` : "")).filter(Boolean).join(", ")}}`;
const WATCH: [number, string, string][] = [
  [CUE.count, "count", "{}"],
  ...P1.flatMap((p): [number, string, string][] => [[p.start, "num", String(NUMS[p.duck])], [p.lands, "count", fmtCount(countAt(p.lands))]]),
  ...P2.map((p): [number, string, string] => [p.start, "num", String(KEYS[p.key])]),
  [CUE.res, "res", "[]"], ...P3.map((s): [number, string, string] => [s.at, "i", String(s.i)]),
  ...P3.flatMap((s) => s.appends).map((a): [number, string, string] => [a.at + 28, "res", `[${resAt(a.at + 28).join(", ")}]`]),
];

// ---------------------------------------------------------------- layout
const DUCK_Y = 760, DUCK_K = 0.68, DUCK_X = [100, 262, 424, 586, 748, 910], TAG_Y = 838;
const PAD_Y = 950, PAD_X = [380, 600, 820];
const CELL_Y = 1080, CELL_X = (i: number) => 230 + i * 125;
const RES_AT: P = [540, 585];
const PANEL: PanelLayout = { x: 46, y: 1186, w: 988, size: 22, lh: 31, pad: 18, file: "top_k_frequent.py" };
const ANSWER = resAt(DURATION);

// ---------------------------------------------------------------- motion
const HOPS: [number, number, number][] = [
  ...P1.map((p, k) => [p.duck, p.start + (k === 0 ? 6 : 20), 54] as [number, number, number]),
  ...NUMS.map((n, i) => [i, CUE.ret + i * 4, ANSWER.includes(n) ? 76 : 30] as [number, number, number]),
  ...NUMS.map((_, i) => [i, CUE.party + i * 5, 46] as [number, number, number]),
  ...NUMS.map((_, i) => [i, CUE.party + 60 + i * 5, 30] as [number, number, number]),
];
export const QUACKS: [number, number][] = [
  ...CUE.land.map((f, i) => [f + 2, i] as [number, number]),
  ...NUMS.map((n, i) => (ANSWER.includes(n) ? [CUE.ret + i * 4 + 2, i] : null)).filter((x): x is [number, number] => !!x),
  ...NUMS.map((_, i) => [CUE.party + i * 5 + 2, i] as [number, number]),
];
const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open";
  if (P1.some((p) => p.duck === i && f >= p.fly && f < p.lands)) e = "wide";
  if ((f >= CUE.ret && ANSWER.includes(NUMS[i])) || f >= CUE.party - 6) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const look = P1.some((p) => p.duck === i && f >= p.fly && f < p.lands + 10) ? -0.6 : 0.3;
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye: eyeOf(i, f), look, label: String(NUMS[i]), seed: 5000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};
// the num pennant rides the ducks in phase 1, then the i pennant walks the freq cells in phase 3
const numPointer = (f: number): { at: P; tilt: number } | null => {
  if (f < P1[0].start || f >= CUE.items) return null;
  const top = (i: number) => headTop(pose(i, f));
  if (f < P1[0].start + 12) { const t = ease.out((f - P1[0].start) / 12), p = top(0); return { at: [lerp(p[0] - 200, p[0], t), lerp(-120, p[1], t)], tilt: lerp(-1, -0.12, t) }; }
  let cur = 0;
  for (let k = 1; k < P1.length; k++) if (f >= P1[k].start) {
    const a = top(k - 1), b = top(k), t = ease.inOut((f - P1[k].start) / 18);
    if (t < 1) return { at: [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - 100 * 4 * t * (1 - t)], tilt: -0.12 + 0.5 * Math.sin(Math.PI * t) };
    cur = k;
  }
  return { at: top(cur), tilt: -0.12 };
};
const iPointer = (f: number): { at: P; tilt: number } | null => {
  if (f < P3[0].at || f >= CUE.print) return null;
  const top = (i: number): P => [CELL_X(i) - 10, CELL_Y - 38];
  if (f < P3[0].at + 12) { const t = ease.out((f - P3[0].at) / 12), p = top(P3[0].i); return { at: [lerp(p[0] + 200, p[0], t), lerp(p[1] - 200, p[1], t)], tilt: lerp(1, -0.12, t) }; }
  let cur = 0;
  for (let k = 1; k < P3.length; k++) if (f >= P3[k].at) {
    const a = top(P3[k - 1].i), b = top(P3[k].i), t = ease.inOut((f - P3[k].at) / 14);
    if (t < 1) return { at: [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - 60 * 4 * t * (1 - t)], tilt: -0.12 - 0.4 * Math.sin(Math.PI * t) };
    cur = k;
  }
  return { at: top(P3[cur].i), tilt: -0.12 };
};

// ---------------------------------------------------------------- sprites
const cellSprite = (env: Env, hot: boolean) => sprite(env, `tkcell:${hot}`, 140, 100, 70, 50, (g) => {
  const col = hot ? "#e8d29a" : "#efe4cc";
  wax(g, () => crayonShape(g, roundRect(-54, -32, 108, 64, 12, 4), { col, shade: "#cdbf9f", seed: hot ? 5701 : 5700, lw: 2.2, gap: 4.4, w: 4.4 }));
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = new Gfx(ctx, env, f, CRAYON_M);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(pondPlate(env).canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  waterGlints(g, f, W, H);

  // rings: rose = counting this duck, teal = counted, gold = its number made the answer
  P1.forEach((p, k) => {
    const arrive = p.start + (k === 0 ? 12 : 18), done = (P1[k + 1]?.start ?? CUE.items) + 6;
    waterRing(g, DUCK_X[p.duck], DUCK_Y + 12, DUCK_K, C.rose, ease.out(prog(f, arrive, 8)) * (f < done ? 1 : 0), 500 + k);
    waterRing(g, DUCK_X[p.duck], DUCK_Y + 12, DUCK_K, C.teal, ease.out(prog(f, done, 8)) * (f < CUE.ret || !ANSWER.includes(NUMS[p.duck]) ? 1 : 0), 520 + k);
  });
  if (f >= CUE.ret) NUMS.forEach((n, i) => { if (ANSWER.includes(n)) waterRing(g, DUCK_X[i], DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + i * 4, 8)), 560 + i); });
  NUMS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), ease.back(prog(f, CUE.nums + i * 3, 8)) * 0.85));

  // labels for the two structures
  g.group("plain", () => {
    text(g, "count", 70, PAD_Y, { size: 30, weight: 700, fill: C.ink, alpha: prog(f, CUE.count, 8) });
    text(g, "freq", 70, CELL_Y, { size: 30, weight: 700, fill: C.ink, alpha: prog(f, CUE.freq, 8) });
    const empty = prog(f, CUE.count + 8, 8) * (1 - prog(f, P1[0].lands - 2, 6));
    if (empty > 0) text(g, "{ }", PAD_X[0], PAD_Y - 4, { size: 50, weight: 700, fill: "#e6ece6", alpha: empty * 0.85 });
  });
  // count pads: one per distinct number, the count rising as ducks report in
  const counts = countAt(f);
  KEYS.forEach((n, k) => {
    if (!counts[k]) return;
    const first = P1.find((p) => NUMS[p.duck] === n)!.lands, last = [...P1].reverse().find((p) => NUMS[p.duck] === n && f >= p.lands)!.lands;
    const q = ease.spring(prog(f, first, 24)), bounce = last !== first && f >= last ? hop(f, last, 22).lift : 0;
    const lit = P2.some((p) => p.key === k && f >= p.start && f < p.lands) ? 0.8 : 0;
    drawEntry(ctx, env, PAD_X[k], PAD_Y - bounce, `${n} : ${counts[k]}`, q, lit, 800 + k * 20);
    splash(g, PAD_X[k], PAD_Y, (f - last) / 16, 1300 + k + last, 0.5);
  });
  // freq cells 0..n: index above, bucket contents inside; the cell i is on glows
  const fq = ease.back(prog(f, CUE.freq, 10));
  if (fq > 0) {
    const iNow = [...P3].reverse().find((s) => f >= s.at && f < CUE.ret)?.i ?? -1;
    for (let i = 0; i < NF; i++) {
      blit(ctx, env, cellSprite(env, i === iNow), CELL_X(i), CELL_Y, fq, fq);
      const inside = P2.filter((p) => CNT[p.key] === i && f >= p.lands).map((p) => KEYS[p.key]).filter((n) => !resAt(f).includes(n) || f < CUE.res);
      g.group("plain", () => {
        text(g, String(i), CELL_X(i), CELL_Y - 48, { size: 22, weight: 700, fill: "#2f3d44", alpha: fq * 0.85 });
        text(g, inside.length ? inside.join(" ") : "[ ]", CELL_X(i), CELL_Y + 2, { size: inside.length ? 34 : 24, weight: 700, fill: inside.length ? C.ink : "#b9ad92", alpha: fq });
      });
    }
  }

  // ducks and pointers
  NUMS.forEach((_, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  const np = numPointer(f); if (np) drawPointer(ctx, env, np.at, DUCK_K * 1.1, np.tilt, "num");
  const ip = iPointer(f); if (ip) drawPointer(ctx, env, ip.at, 0.75, ip.tilt, "i");
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 12, (f - l) / 18, 1100 + i, 0.7));

  // flights: duck -> count pad, count pad -> freq cell, freq cell -> res
  const fly = (s: string, a: P, b: P, t0: number, dur: number, arc: number, size = 40) => {
    if (f < t0 || f >= t0 + dur) return;
    const u = ease.inOut(prog(f, t0, dur)), x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - arc * 4 * u * (1 - u), k = 1 + 0.35 * Math.sin(Math.PI * u);
    g.group("plain", () => text(g, s, x, y, { size: size * k, weight: 700, fill: "#f6f0e2", stroke: C.ink, sw: 7 }));
  };
  P1.forEach((p) => fly(String(NUMS[p.duck]), chest(pose(p.duck, f)), [PAD_X[KEYS.indexOf(NUMS[p.duck])] - 20, PAD_Y - 6], p.fly + 2, 26, 120));
  P2.forEach((p) => fly(String(KEYS[p.key]), [PAD_X[p.key] - 20, PAD_Y - 10], [CELL_X(CNT[p.key]), CELL_Y], p.fly + 2, 28, 90));
  P2.forEach((p) => { if (f >= p.start && f < p.fly) g.group("plain", () => text(g, `cnt = ${CNT[p.key]}`, PAD_X[p.key], PAD_Y - 62, { size: 26, weight: 700, fill: C.rose, alpha: ease.out(prog(f, p.start + 4, 8)) })); });
  P3.flatMap((s) => s.appends.map((a) => ({ a, i: s.i }))).forEach(({ a, i }) => fly(String(a.num), [CELL_X(i), CELL_Y], [RES_AT[0] + 40, RES_AT[1]], a.at + 2, 26, 150, 44));

  // res, as a bubble in the sky; len(res) == k checks; the answer card
  const rq = ease.back(prog(f, CUE.res + 4, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8)));
  const res = resAt(f);
  drawBubble(ctx, env, RES_AT[0], RES_AT[1], [["res = ", C.ink], [`[${res.join(", ")}]`, C.rose]], [RES_AT[0], RES_AT[1] + 70], rq, 5800 + res.length, 38);
  P3.flatMap((s) => s.appends).forEach((a) => {
    const q = ease.back(prog(f, a.check + 4, 8)) * (1 - ease.out(prog(f, a.check + 40, 8)));
    if (q > 0) drawBubble(ctx, env, 820, 500, [[`len(res) = ${resAt(a.check).length}`, C.ink], [resAt(a.check).length === K ? " == k" : " < k", resAt(a.check).length === K ? C.teal : C.rose]], [700, 560], q, 5900 + a.at, 30);
  });
  const cq = ease.spring(prog(f, CUE.print, 24));
  if (cq > 0) drawCard(ctx, env, 540, 540, "topKFrequent returns", `[${ANSWER.join(", ")}]`, cq);
  if (f >= CUE.party) for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 280, 540 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + s), a); }

  const tq = ease.spring(prog(f, 0, 20));
  blit(ctx, env, titleSprite(env, "Top K Frequent", "LeetCode 347  ·  Python"), 540, 270, tq, tq);
  const pq = ease.back(prog(f, CUE.nums, 10)) * (1 - ease.out(prog(f, CUE.res - 6, 8)));
  blit(ctx, env, pillSprite(env, [["nums = ", C.ink], [`[${NUMS.join(", ")}]`, C.rose], ["   k = ", C.ink], [String(K), C.rose]]), 540, 432, pq, pq);
  g.paper("paper", 0.05);

  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const shown = from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 8)));
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  for (const [f0, k, v] of [...WATCH].sort((x, y) => x[0] - y[0])) if (f >= f0) { watch.set(k, v); fresh = k; freshAt = f0; }
  if (f >= CUE.res) watch.delete("num");
  drawPanel(g, CODE, PANEL, {
    line: shown, alpha: prog(f, CUE.nums - 4, 6), pulse: f >= CUE.ret && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: `[${ANSWER.join(", ")}]`, outQ: prog(f, CUE.print + 4, 10),
  });
  void darker;
};

export const topKFrequent: Film = {
  meta: {
    title: "Top K Frequent Elements · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: P2[2].lands + 20,
    holds: [[CUE.party + 100, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.nums, to: P1[0].start, text: `nums = [${NUMS.join(", ")}], k = ${K}` },
      { from: P1[0].start, to: CUE.items, text: "Count how often each number appears." },
      { from: CUE.items, to: CUE.res, text: "Put each number in the bucket for its count." },
      { from: CUE.res, to: CUE.ret, text: "Walk the buckets from the top until res has k numbers." },
      { from: CUE.ret, to: DURATION, text: `Output: [${ANSWER.join(", ")}]` },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "topKFrequent", start: 0, end: DURATION, draw }],
  audio: topKFrequentAudio(FPS, DURATION, { ...CUE, quacks: QUACKS }),
};
