// GROUP ANAGRAMS · duckcode, crayon, 9:16, 30 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Six ducks float in a row, each wearing a word. One by one each
// duck tips its letters into a 26-cell count strip, and the lit cells are its key: the same cells
// light up for "eat", "tea" and "ate". Every word drops into the bucket for its key, and at the end
// the ducks swim into their three groups.
// The token: the count strip, which lights the same way for every anagram.
import { Gfx, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { pondPlate, waterGlints } from "./duck/pond";
import { drawDuck, drawPointer, headTop, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { drawCard, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C, CRAYON_M, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text, measure } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { pillSprite, titleSprite } from "./duck/chrome";
import { lerp } from "./gallery";
import { groupAnagramsAudio } from "./groupAnagramsSound";

const FPS = 30, BPM = 120, DURATION = 900, W = 1080, H = 1920;

// ---------------------------------------------------------------- the problem
const STRS = ["eat", "tea", "tan", "ate", "nat", "bat"];
const CODE = [
  `strs = [${STRS.map((s) => `"${s}"`).join(", ")}]`,
  "class Solution:",
  "    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:",
  "        res = defaultdict(list)",
  "        for s in strs:",
  "            count = [0] * 26",
  "            for c in s:",
  "                count[ord(c) - ord('a')] += 1",
  "            res[tuple(count)].append(s)",
  "        return list(res.values())",
  "print(Solution().groupAnagrams(strs))",
];
const keyOf = (s: string) => [...s].sort().join("");
const KEYS = [...new Set(STRS.map(keyOf))];              // buckets, in insertion order
const GROUP = STRS.map((s) => KEYS.indexOf(keyOf(s)));   // which bucket each duck belongs to
const OUTPUT = `[${KEYS.map((k) => `[${STRS.filter((s) => keyOf(s) === k).map((s) => `'${s}'`).join(", ")}]`).join(", ")}]`;

// ---------------------------------------------------------------- the cue table (frames, on the beat)
// a pass per word: the pointer lands (start), the count resets (+15), the letters fly (+30..), the word drops into its bucket (+60)
const PASS = STRS.map((_, k) => { const start = 120 + 90 * k; return { duck: k, start, reset: start + 15, letters: start + 30, append: start + 60, lands: start + 78 }; });
export const CUE = { land: [15, 21, 27, 39, 45, 51], strs: 45, call: 60, res: 90, ret: 690, print: 780, party: 810, passes: PASS };
const RUN: [number, number][] = [[CUE.strs, 0], [CUE.call, 10], [CUE.res, 3],
  ...PASS.flatMap((p): [number, number][] => [[p.start, 4], [p.reset, 5], [p.letters, 7], [p.append, 8]]), [CUE.ret, 9], [CUE.print, 10]];
for (const [f] of RUN) if (f % 15) throw new Error(`groupAnagrams: a run cue at ${f} is off the beat`);
const LETTER_AT = (p: (typeof PASS)[number], j: number) => p.letters + j * 9;   // letter j leaves the duck
const FLY = 12;
// the count strip at frame f: [cell] -> count, for the pass in progress
const countAt = (f: number) => {
  const m = new Map<number, number>(); const p = [...PASS].reverse().find((q) => f >= q.reset); if (!p) return m;
  [...STRS[p.duck]].forEach((c, j) => { if (f >= LETTER_AT(p, j) + FLY) { const i = c.charCodeAt(0) - 97; m.set(i, (m.get(i) ?? 0) + 1); } });
  return m;
};
const bucketAt = (f: number) => KEYS.map((k) => STRS.filter((s, i) => keyOf(s) === k && f >= PASS[i].lands));
const WATCH: [number, string, string][] = [
  ...PASS.flatMap((p): [number, string, string][] => [[p.start, "s", `'${STRS[p.duck]}'`], ...[...STRS[p.duck]].map((c, j): [number, string, string] => [LETTER_AT(p, j), "c", `'${c}'`])]),
  ...PASS.map((p): [number, string, string] => [p.lands, "len(res)", String(new Set(STRS.slice(0, p.duck + 1).map(keyOf)).size)]),
];

// ---------------------------------------------------------------- layout
const DUCK_Y = 820, DUCK_K = 0.68, DUCK_X = [100, 262, 424, 586, 748, 910], TAG_Y = 895;
const STRIP_Y = 975, CELL = 38, STRIP_X0 = 540 - (26 * CELL) / 2;
const BUCKET_Y = 1112, BUCKET_X = [180, 540, 900], BUCKET_W = 330;
const PANEL: PanelLayout = { x: 46, y: 1196, w: 988, size: 23, lh: 34, pad: 18, file: "group_anagrams.py" };
// where each duck swims to when the groups form
const HOME: number[] = (() => { const xs: number[] = []; const centers = [215, 640, 940]; KEYS.forEach((_, g) => { const ids = STRS.map((_, i) => i).filter((i) => GROUP[i] === g); ids.forEach((i, j) => (xs[i] = centers[g] + (j - (ids.length - 1) / 2) * 140)); }); return xs; })();
const GROUP_COL = [C.rose, C.teal, C.gold];

// ---------------------------------------------------------------- motion
const HOPS: [number, number, number][] = [
  ...PASS.map((p, k) => [p.duck, p.start + (k === 0 ? 6 : 18), 52] as [number, number, number]),
  ...STRS.map((_, i) => [i, CUE.ret + 4 + i * 5, 70] as [number, number, number]),
  ...STRS.map((_, i) => [i, CUE.party + i * 5, 44] as [number, number, number]),
  ...STRS.map((_, i) => [i, CUE.party + 45 + i * 5, 28] as [number, number, number]),
];
export const QUACKS: [number, number][] = [
  ...CUE.land.map((f, i) => [f + 2, i] as [number, number]),
  ...PASS.filter((p) => PASS.some((q) => q.duck < p.duck && GROUP[q.duck] === GROUP[p.duck])).map((p) => [p.append + 6, p.duck] as [number, number]),
  ...STRS.map((_, i) => [CUE.party + i * 5 + 2, i] as [number, number]),
];
const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open";
  if (PASS.some((p) => p.duck === i && f >= p.letters && f < p.append)) e = "wide";
  if (f >= CUE.ret) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const duckX = (i: number, f: number) => lerp(DUCK_X[i], HOME[i], ease.inOut(prog(f, CUE.ret + 4 + i * 5, 40)));
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h, j === i && f0 > CUE.ret && f0 < CUE.party ? 40 : 16); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const look = PASS.some((p) => p.duck === i && f >= p.letters && f < p.lands) ? -0.6 : 0.3;
  return { x: duckX(i, f), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye: eyeOf(i, f), look, label: STRS[i], seed: 3000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};
const pointerAt = (f: number): { at: P; tilt: number } | null => {
  if (f < PASS[0].start || f >= CUE.ret) return null;
  const top = (i: number) => headTop(pose(i, f));
  if (f < PASS[0].start + 12) { const t = ease.out((f - PASS[0].start) / 12), p = top(0); return { at: [lerp(p[0] - 200, p[0], t), lerp(-120, p[1], t)], tilt: lerp(-1, -0.12, t) }; }
  let cur = 0;
  for (let k = 1; k < PASS.length; k++) if (f >= PASS[k].start) {
    const a = top(k - 1), b = top(k), t = ease.inOut((f - PASS[k].start) / 18);
    if (t < 1) return { at: [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - 100 * 4 * t * (1 - t)], tilt: -0.12 + 0.5 * Math.sin(Math.PI * t) };
    cur = k;
  }
  return { at: top(cur), tilt: -0.12 };
};

// ---------------------------------------------------------------- sprites
const cellSprite = (env: Env, n: number) => sprite(env, `gcell:${n}`, 50, 50, 25, 25, (g) => {
  const col = n ? C.rose : "#e8dfca";
  wax(g, () => crayonShape(g, roundRect(-16, -18, 32, 36, 7, 3), { col, shade: darker(col, 0.25), seed: 3700 + n, lw: 1.6, gap: 3.4, w: 3.6 }));
  if (n) text(g, String(n), 0, 1, { size: 22, weight: 700, fill: "#f6f0e2" });
});
const bucketSprite = (env: Env, g0: number, key: string, words: string[], hot: boolean) => sprite(env, `gbucket:${g0}:${words.join(",")}:${hot}`, 380, 120, 190, 60, (g) => {
  const col = hot ? "#e8d29a" : "#efe4cc";
  wax(g, () => crayonShape(g, roundRect(-BUCKET_W / 2, -36, BUCKET_W, 72, 16, 5), { col, shade: "#cdbf9f", seed: 3800 + g0, lw: 2.4, gap: 5, w: 4.6 }));
  wax(g, () => crayonShape(g, roundRect(-BUCKET_W / 2 + 10, -26, 60, 52, 12, 4), { col: GROUP_COL[g0], shade: darker(GROUP_COL[g0], 0.3), seed: 3810 + g0, lw: 1.8, gap: 3.6, w: 4 }));
  text(g, [...key].join(""), -BUCKET_W / 2 + 40, 1, { size: 20, weight: 700, fill: "#f6f0e2" });
  const line = words.join(", "), size = measure(g, line, 28, 700) > BUCKET_W - 100 ? 22 : 28;
  text(g, line, -BUCKET_W / 2 + 84, 1, { size, weight: 700, fill: C.ink, align: "left" });
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = new Gfx(ctx, env, f, CRAYON_M);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(pondPlate(env).canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  waterGlints(g, f, W, H);

  // rings: rose = this pass's duck, teal = done; at the end every duck wears its group's colour
  PASS.forEach((p, k) => {
    const arrive = p.start + (k === 0 ? 12 : 18), done = (PASS[k + 1]?.start ?? CUE.ret) + 10;
    if (f < CUE.ret) { waterRing(g, duckX(p.duck, f), DUCK_Y + 12, DUCK_K, C.rose, ease.out(prog(f, arrive, 8)) * (f < done ? 1 : 0), 500 + k); waterRing(g, duckX(p.duck, f), DUCK_Y + 12, DUCK_K, C.teal, ease.out(prog(f, done, 8)), 520 + k); }
  });
  if (f >= CUE.ret) STRS.forEach((_, i) => waterRing(g, duckX(i, f), DUCK_Y + 12, DUCK_K, GROUP_COL[GROUP[i]], ease.out(prog(f, CUE.ret + 44 + i * 5, 8)), 560 + i));

  // index tags (they bow out as the groups form)
  STRS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), ease.back(prog(f, CUE.strs + i * 3, 8)) * (1 - ease.out(prog(f, CUE.ret, 10)))));

  // the count strip: 26 cells, a..z; the current word's letters light their cells
  const sq = ease.back(prog(f, CUE.res + 15, 10)) * (1 - ease.out(prog(f, CUE.ret + 10, 12)));
  if (sq > 0) {
    const counts = countAt(f), p = [...PASS].reverse().find((q) => f >= q.start), resetQ = p ? prog(f, p.reset, 6) : 1;
    for (let i = 0; i < 26; i++) {
      const n = counts.get(i) ?? 0, x = STRIP_X0 + CELL * (i + 0.5), arrive = p ? [...STRS[p.duck]].findIndex((c) => c.charCodeAt(0) - 97 === i) : -1;
      const pop = n && arrive >= 0 ? hop(f, LETTER_AT(p!, arrive) + FLY, 14, 10).lift : 0;
      blit(ctx, env, cellSprite(env, n), x, STRIP_Y - pop, sq * (n ? 1 : 0.92), sq * (n ? 1 : 0.92), 0, n ? 1 : 0.75 + 0.25 * resetQ);
    }
    g.group("plain", () => { for (let i = 0; i < 26; i++) text(g, String.fromCharCode(97 + i), STRIP_X0 + CELL * (i + 0.5), STRIP_Y + 34, { size: 17, weight: 500, fill: "#2f3d44", alpha: sq * 0.8 }); text(g, "count", STRIP_X0 - 2, STRIP_Y - 36, { size: 22, weight: 700, fill: C.ink, align: "left", alpha: sq }); });
  }

  // res: one bucket per key, the words appended in order
  const buckets = bucketAt(f), rq = prog(f, CUE.res, 8);
  if (rq > 0 && buckets.every((b) => !b.length)) g.group("plain", () => text(g, "res = { }", 540, BUCKET_Y, { size: 40, weight: 700, fill: "#e6ece6", alpha: rq * 0.85 * (1 - prog(f, PASS[0].lands - 4, 6)) }));
  KEYS.forEach((key, k) => {
    const words = buckets[k]; if (!words.length) return;
    const first = PASS[STRS.findIndex((s) => keyOf(s) === key)].lands, last = PASS[STRS.lastIndexOf(words[words.length - 1])].lands;
    const q = ease.spring(prog(f, first, 24)), bounce = f >= last && last !== first ? hop(f, last, 18).lift : 0;
    const hot = PASS.some((p) => f >= p.append && f < p.lands + 10 && GROUP[p.duck] === k && STRS.findIndex((s) => keyOf(s) === key) < p.duck);
    blit(ctx, env, bucketSprite(env, k, key, words, hot), BUCKET_X[k], BUCKET_Y - bounce, q, q);
    if (hot) for (let s = 0; s < 4; s++) { const a = (s / 4) * Math.PI * 2 + f * 0.06; drawSparkle(ctx, env, BUCKET_X[k] + Math.cos(a) * 180, BUCKET_Y + Math.sin(a) * 44, 11, a); }
  });
  g.group("plain", () => text(g, "res", 20, BUCKET_Y - 52, { size: 22, weight: 700, fill: C.ink, align: "left", alpha: prog(f, PASS[0].lands, 8) }));

  // the ducks, the pointer, splashes
  STRS.forEach((_, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  const pt = pointerAt(f); if (pt) drawPointer(ctx, env, pt.at, DUCK_K * 1.15, pt.tilt, "s");
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 12, (f - l) / 18, 1100 + i, 0.7));

  // each pass: letters fly into the strip, then the word flies to its bucket
  PASS.forEach((p) => {
    const a = chest(pose(p.duck, f));
    [...STRS[p.duck]].forEach((c, j) => {
      const t0 = LETTER_AT(p, j); if (f < t0 || f >= t0 + FLY) return;
      const u = ease.inOut(prog(f, t0, FLY)), b: P = [STRIP_X0 + CELL * (c.charCodeAt(0) - 97 + 0.5), STRIP_Y], x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - 90 * 4 * u * (1 - u);
      g.group("plain", () => text(g, c, x, y, { size: 34, weight: 700, fill: "#f6f0e2", stroke: C.ink, sw: 6 }));
    });
    if (f >= p.append && f < p.lands) {
      const u = ease.inOut(prog(f, p.append + 2, p.lands - p.append - 2)), b: P = [BUCKET_X[GROUP[p.duck]], BUCKET_Y - 8], x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - 120 * 4 * u * (1 - u), s = 1 + 0.3 * Math.sin(Math.PI * u);
      g.group("plain", () => text(g, STRS[p.duck], x, y, { size: 36 * s, weight: 700, fill: "#f6f0e2", stroke: C.ink, sw: 7 }));
    }
    splash(g, BUCKET_X[GROUP[p.duck]], BUCKET_Y + 20, (f - p.lands) / 16, 1300 + p.duck, 0.5);
  });

  // the answer
  const cq = ease.spring(prog(f, CUE.print, 24));
  if (cq > 0) drawCard(ctx, env, 540, 540, "groupAnagrams returns", `${KEYS.length} groups`, cq);
  if (f >= CUE.party) for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 280, 540 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + s), a); }

  // title and input
  const tq = ease.spring(prog(f, 0, 20));
  blit(ctx, env, titleSprite(env, "Group Anagrams", "LeetCode 49  ·  Python"), 540, 270, tq, tq);
  const pq = ease.back(prog(f, CUE.strs, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8)));
  blit(ctx, env, pillSprite(env, [["strs = ", C.ink], [`[${STRS.join(", ")}]`, C.rose]]), 540, 432, pq, pq);
  g.paper("paper", 0.05);

  // the code
  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const shown = from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 6)));
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  for (const [f0, k, v] of [...WATCH].sort((x, y) => x[0] - y[0])) if (f >= f0) { watch.set(k, v); fresh = k; freshAt = f0; }
  drawPanel(g, CODE, PANEL, {
    line: shown, alpha: prog(f, CUE.strs - 4, 6), pulse: f >= CUE.ret && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: OUTPUT, outQ: prog(f, CUE.print + 4, 20),
  });
};

export const groupAnagrams: Film = {
  meta: {
    title: "Group Anagrams · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: PASS[3].append + 10,
    holds: [[CUE.party + 75, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.strs, to: PASS[0].start, text: `strs = [${STRS.join(", ")}]` },
      { from: PASS[0].start, to: PASS[3].start, text: "Count each word's letters: the 26 counts are its key." },
      { from: PASS[3].start, to: CUE.ret, text: "Anagrams light the same cells, so they land in the same bucket." },
      { from: CUE.ret, to: DURATION, text: `Output: ${OUTPUT}` },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "groupAnagrams", start: 0, end: DURATION, draw }],
  audio: groupAnagramsAudio(FPS, DURATION, { ...CUE, quacks: QUACKS }),
};
