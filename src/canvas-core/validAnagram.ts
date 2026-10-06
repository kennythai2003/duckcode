// VALID ANAGRAM · duckcode, crayon, 9:16, 30 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Two little flocks float side by side, one letter on each duck:
// s = "cat" and t = "act". Each s-duck drops its letter into the count pond, which fills up to
// c:1 a:1 t:1; each t-duck takes one back out, and no count ever goes below zero. Every pad ends
// at 0, so the two words hold the same letters: True.
// The token: the count pads, which rise and fall back to 0.
import { Gfx, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { pondPlate, waterGlints } from "./duck/pond";
import { drawDuck, drawPointer, headTop, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { drawBubble, drawCard, drawCheck, drawEntry, drawSign, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C, CRAYON_M, blit, cline, wax } from "./duck/crayon";
import { FONTS, ease, prog, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { pillSprite, titleSprite } from "./duck/chrome";
import { lerp } from "./gallery";
import { validAnagramAudio } from "./validAnagramSound";

const FPS = 30, BPM = 120, DURATION = 900, W = 1080, H = 1920;

// ---------------------------------------------------------------- the problem
const S = "cat", T = "act";
const CODE = [
  `s = "${S}"`,
  `t = "${T}"`,
  "def is_anagram(s, t):",
  "    if len(s) != len(t):",
  "        return False",
  "    count = {}",
  "    for c in s:",
  "        count[c] = count.get(c, 0) + 1",
  "    for c in t:",
  "        count[c] = count.get(c, 0) - 1",
  "        if count[c] < 0:",
  "            return False",
  "    return True",
  "print(is_anagram(s, t))",
];
const LETTERS = [...S, ...T];                 // duck i carries LETTERS[i]; 0..2 are s, 3..5 are t
const KEYS = [...new Set(S)];                 // the count pond's pads, in insertion order

// ---------------------------------------------------------------- the cue table (frames, on the beat)
// each pass of a loop: the pointer lands on `start`, the letter flies at `fly` (+1 or -1), t's pass checks at `check`
type Pass = { duck: number; start: number; fly: number; check?: number; d: 1 | -1 };
const PASS: Pass[] = [
  ...[0, 1, 2].map((k): Pass => ({ duck: k, start: 180 + 90 * k, fly: 210 + 90 * k, d: 1 })),
  ...[0, 1, 2].map((k): Pass => ({ duck: 3 + k, start: 450 + 90 * k, fly: 480 + 90 * k, check: 510 + 90 * k, d: -1 })),
];
export const CUE = { land: [15, 21, 27, 39, 45, 51], s: 60, t: 75, call: 90, len: 105, count: 150, ret: 720, print: 780, party: 810, passes: PASS };
const RUN: [number, number][] = [[CUE.s, 0], [CUE.t, 1], [CUE.call, 13], [CUE.len, 3], [CUE.count, 5],
  ...PASS.flatMap((p): [number, number][] => [[p.start, p.d > 0 ? 6 : 8], [p.fly, p.d > 0 ? 7 : 9], ...(p.check !== undefined ? [[p.check, 10] as [number, number]] : [])]),
  [CUE.ret, 12], [CUE.print, 13]];
for (const [f] of RUN) if (f % 15) throw new Error(`validAnagram: a run cue at ${f} is off the beat`);
const LAND_AT = (p: Pass) => p.fly + 28;     // the letter reaches its pad
// the count after every landing: [frame, key, value]
const COUNTS: [number, string, number][] = (() => { const m = new Map<string, number>(); return PASS.map((p) => { const k = LETTERS[p.duck]; m.set(k, (m.get(k) ?? 0) + p.d); return [LAND_AT(p), k, m.get(k)!] as [number, string, number]; }); })();
const countAt = (f: number) => { const m = new Map<string, number>(); for (const [f0, k, v] of COUNTS) if (f >= f0) m.set(k, v); return m; };
const fmt = (m: Map<string, number>) => `{${[...m].map(([k, v]) => `'${k}': ${v}`).join(", ")}}`;
const WATCH: [number, string, string][] = [
  ...PASS.map((p): [number, string, string] => [p.start, "c", `'${LETTERS[p.duck]}'`]),
  [CUE.count, "count", "{}"], ...COUNTS.map(([f]): [number, string, string] => [f, "count", fmt(countAt(f))]),
];

// ---------------------------------------------------------------- layout
const DUCK_Y = 830, DUCK_K = 0.68, DUCK_X = [100, 262, 424, 656, 818, 980], TAG_Y = 905;
const PAD_X = [380, 610, 840], PAD_Y = 1086, SIGN: P = [150, 1080];
const PANEL: PanelLayout = { x: 46, y: 1196, w: 988, size: 27, lh: 36, pad: 18, file: "valid_anagram.py" };

// ---------------------------------------------------------------- motion
const HOPS: [number, number, number][] = [
  ...PASS.map((p, k) => [p.duck, p.start + (k === 0 ? 6 : 18), 54] as [number, number, number]),
  ...LETTERS.map((_, i) => [i, CUE.ret + i * 4, 60] as [number, number, number]),
  ...LETTERS.map((_, i) => [i, CUE.party + i * 5, 46] as [number, number, number]),
  ...LETTERS.map((_, i) => [i, CUE.party + 45 + i * 5, 30] as [number, number, number]),
];
export const QUACKS: [number, number][] = [
  ...CUE.land.map((f, i) => [f + 2, i] as [number, number]),
  [CUE.ret + 2, 0], [CUE.ret + 10, 3], [CUE.ret + 18, 5],
  ...LETTERS.map((_, i) => [CUE.party + i * 5 + 2, i] as [number, number]),
];
const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open";
  if (PASS.some((p) => p.duck === i && f >= p.check! && f < p.check! + 30)) e = "wide";
  if (f >= CUE.ret) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const look = PASS.some((p) => p.duck === i && f >= p.fly && f < p.fly + 40) ? -0.8 : 0.3;
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye: eyeOf(i, f), look, label: LETTERS[i], seed: 2000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};
// the pointer `c`: flies in onto s[0], hops duck to duck through both loops
const pointerAt = (f: number): { at: P; tilt: number } | null => {
  if (f < PASS[0].start) return null;
  const top = (i: number) => headTop(pose(i, f));
  if (f < PASS[0].start + 12) { const t = ease.out((f - PASS[0].start) / 12), p = top(0); return { at: [lerp(p[0] - 200, p[0], t), lerp(-120, p[1], t)], tilt: lerp(-1, -0.12, t) }; }
  let cur = 0;
  for (let k = 1; k < PASS.length; k++) if (f >= PASS[k].start) {
    const a = top(PASS[k - 1].duck), b = top(PASS[k].duck), t = ease.inOut((f - PASS[k].start) / 18);
    if (t < 1) return { at: [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - 110 * 4 * t * (1 - t)], tilt: -0.12 + 0.5 * Math.sin(Math.PI * t) };
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

  // rings: rose = this pass's duck, teal = done, gold = the answer
  PASS.forEach((p, k) => {
    const arrive = p.start + (k === 0 ? 12 : 18), done = (PASS[k + 1]?.start ?? CUE.ret) + 10;
    const ring = (col: string, f0: number, f1: number) => waterRing(g, DUCK_X[p.duck], DUCK_Y + 12, DUCK_K, col, ease.out(prog(f, f0, 8)) * (f < f1 ? 1 : 0), 500 + p.duck * 10 + col.length);
    ring(C.rose, arrive, done); ring(C.teal, done, CUE.ret);
  });
  if (f >= CUE.ret) LETTERS.forEach((_, i) => waterRing(g, DUCK_X[i], DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + i * 4, 8)), 590 + i));

  // index tags and the two words' labels
  LETTERS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i % 3), ease.back(prog(f, (i < 3 ? CUE.s : CUE.t) + (i % 3) * 3, 8)), f >= CUE.ret ? ease.out(prog(f, CUE.ret, 10)) : 0));
  [[CUE.s, 0, "s"], [CUE.t, 3, "t"]].forEach(([f0, i0, name]) => {
    const q = prog(f, f0 as number, 8); if (q <= 0) return;
    const x0 = DUCK_X[i0 as number] - 50, x1 = DUCK_X[(i0 as number) + 2] + 50;
    g.group("plain", () => { wax(g, () => cline(g, [[x0, 952], [(x0 + x1) / 2, 956], [x1, 951]], C.inkSoft, 2.4, 1980 + (i0 as number), 0.7 * q, 1)); text(g, `${name} = "${name === "s" ? S : T}"`, (x0 + x1) / 2, 980, { size: 28, weight: 700, fill: C.ink, alpha: q }); });
  });

  // the count pond: a signpost, "{ }" while empty, a pad per letter that rises and falls
  drawSign(ctx, env, SIGN[0], SIGN[1] + 8 * (1 - ease.spring(prog(f, CUE.count, 18))), "count", ease.back(prog(f, CUE.count, 10)));
  const emptyA = prog(f, CUE.count + 8, 8) * (1 - prog(f, LAND_AT(PASS[0]) - 2, 6));
  if (emptyA > 0) g.group("plain", () => text(g, "{ }", PAD_X[0], PAD_Y - 4, { size: 54, weight: 700, fill: "#e6ece6", alpha: emptyA * 0.85 }));
  const counts = countAt(f);
  KEYS.forEach((key, k) => {
    if (!counts.has(key)) return;
    const first = COUNTS.find(([, kk]) => kk === key)![0], last = [...COUNTS].reverse().find(([f0, kk]) => kk === key && f >= f0)![0];
    const q = ease.spring(prog(f, first, 24)), bounce = f >= last && last !== first ? hop(f, last, 22).lift : 0;
    const glow = f >= CUE.ret ? 0.5 + 0.5 * Math.sin((f - CUE.ret) * 0.2 + k) : 0;
    drawEntry(ctx, env, PAD_X[k], PAD_Y - bounce, `${key} : ${counts.get(key)}`, q, glow, 800 + k * 20);
    splash(g, PAD_X[k], PAD_Y, (f - last) / 16, 1300 + k + last, 0.5);
  });

  // the ducks, and the pointer
  LETTERS.forEach((_, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  const pt = pointerAt(f); if (pt) drawPointer(ctx, env, pt.at, DUCK_K * 1.15, pt.tilt, "c");
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 12, (f - l) / 18, 1100 + i, 0.7));

  // len(s) != len(t)? 3 == 3, carry on
  {
    const q = ease.back(prog(f, CUE.len + 6, 10)) * (1 - ease.out(prog(f, CUE.count - 4, 8)));
    drawBubble(ctx, env, 540, 600, [["len(s) = 3 = len(t)", C.ink]], [540, 690], q, 1400);
    drawCheck(ctx, env, 790, 590, q * 0.55);
  }
  // each pass: the letter flies to its pad with +1 or -1; t's pass checks the count is not below 0
  PASS.forEach((p, k) => {
    const key = LETTERS[p.duck], pad = KEYS.indexOf(key);
    if (f >= p.fly && f < p.fly + 30) {
      const u = ease.inOut(prog(f, p.fly + 2, 26)), a = chest(pose(p.duck, f)), b: P = [PAD_X[pad] - 8, PAD_Y - 10];
      const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - 160 * 4 * u * (1 - u), s = 1 + 0.35 * Math.sin(Math.PI * u);
      g.group("plain", () => text(g, `${key} ${p.d > 0 ? "+1" : "−1"}`, x, y, { size: 38 * s, weight: 700, fill: "#f6f0e2", stroke: p.d > 0 ? C.ink : "#6e3f4c", sw: 7 }));
    }
    if (p.check !== undefined) {
      const q = ease.back(prog(f, p.check + 4, 8)) * (1 - ease.out(prog(f, p.check + 34, 8)));
      drawBubble(ctx, env, Math.max(300, Math.min(780, PAD_X[pad] + 60)), 990, [[`${key}: ${countAt(f).get(key)}`, C.rose], [" ≥ 0", C.ink]], [PAD_X[pad], 1050], q, 1500 + k, 30);
    }
    void k;
  });

  // return True: every pad is back to 0
  if (f >= CUE.ret) for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + f * 0.03, cx = PAD_X[1]; drawSparkle(ctx, env, cx + Math.cos(a) * 330, PAD_Y - 10 + Math.sin(a) * 60, (11 + 4 * Math.sin(f * 0.3 + s)) * prog(f, CUE.ret, 10), a); }
  const cq = ease.spring(prog(f, CUE.print, 24));
  if (cq > 0) drawCard(ctx, env, 540, 540, "is_anagram returns", "True", cq);

  // title and parameters
  const tq = ease.spring(prog(f, 0, 20));
  blit(ctx, env, titleSprite(env, "Valid Anagram", "LeetCode 242  ·  Python"), 540, 270, tq, tq);
  const pq = ease.back(prog(f, CUE.s, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8)));
  blit(ctx, env, pillSprite(env, [["s = ", C.ink], [`"${S}"`, C.rose], ["   t = ", C.ink], [`"${T}"`, C.rose]]), 540, 432, pq, pq);
  g.paper("paper", 0.05);

  // the code
  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const shown = from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 6)));
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  for (const [f0, k, v] of [...WATCH].sort((a, b) => a[0] - b[0])) if (f >= f0) { watch.set(k, v); fresh = k; freshAt = f0; }
  drawPanel(g, CODE, PANEL, {
    line: shown, alpha: prog(f, CUE.s - 4, 6), pulse: f >= CUE.ret && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: "True", outQ: prog(f, CUE.print + 4, 10),
  });
};

export const validAnagram: Film = {
  meta: {
    title: "Valid Anagram · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: PASS[4].check! + 10,
    holds: [[CUE.party + 75, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.s, to: CUE.len, text: `s = "${S}", t = "${T}"` },
      { from: CUE.len, to: PASS[0].start, text: "Same length: keep going." },
      { from: PASS[0].start, to: PASS[3].start, text: "Count every letter of s." },
      { from: PASS[3].start, to: CUE.ret, text: "Take each letter of t back out. No count goes below 0." },
      { from: CUE.ret, to: DURATION, text: "Every count is 0: True." },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "validAnagram", start: 0, end: DURATION, draw }],
  audio: validAnagramAudio(FPS, DURATION, { ...CUE, quacks: QUACKS }),
};
