// FIND MAX · the duckcode TEMPLATE film: copy this file, then change PROBLEM, CODE and the simulation.
// 40 s (1200 frames). Uses the shared stage/sound/theme helpers, so the film is data plus its own visuals:
// four ducks, a pennant that hops duck to duck, a compare bubble with a check or cross, and a `best` pad.
// Everything on screen comes from SIM, which simulates the user's code; the film refuses to build if the
// simulation disagrees with EXPECTED. (Not a LeetCode problem: it exists to be copied.)
import type { Ctx, Env, Gfx, P } from "./core";
import type { Film } from "./film";
import { drawDuck, drawPointer, headTop, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawBubble, drawCard, drawCheck, drawCross, drawEntry, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C } from "./duck/crayon";
import { FONTS, ease, prog, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { checkBeats, stageBegin, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, DURATION = 1200, LC = 0;           // LC = LeetCode number: picks the rotating theme
const TITLE = "Find Max", SUB = "Template  ·  Python";
const NUMS = [3, 1, 4, 2], EXPECTED = 4;
const CODE = ["nums = [3, 1, 4, 2]", "class Solution:", "    def findMax(self, nums: List[int]) -> int:", "        best = nums[0]", "        for num in nums:", "            if num > best:", "                best = num", "        return best", "print(Solution().findMax(nums))"];

// ---------------------------------------------------------------- simulate the user's code
type Step = { i: number; start: number; check: number; update?: number; num: number; bestBefore: number; bestAfter: number; greater: boolean };
const STEPS: Step[] = (() => {
  const out: Step[] = []; let best = NUMS[0];
  NUMS.forEach((num, i) => { const greater = num > best, before = best; if (greater) best = num; const start = 270 + 150 * i; out.push({ i, start, check: start + 45, update: greater ? start + 105 : undefined, num, bestBefore: before, bestAfter: best, greater }); });
  if (best !== EXPECTED) throw new Error(`findMax: simulation gives ${best}, expected ${EXPECTED}`);
  return out;
})();
const FLY = 26;
export const CUE = { land: [15, 23, 30, 38], nums: 60, call: 90, def: 120, best: 180, ret: 900, print: 960, party: 990 };
const RUN: Run = [[CUE.nums, 0], [CUE.call, 8], [CUE.def, 2], [CUE.best, 3], ...STEPS.flatMap((s): [number, number][] => [[s.start, 4], [s.check, 5], ...(s.update !== undefined ? [[s.update, 6] as [number, number]] : [])]), [CUE.ret, 7], [CUE.print, 8]];
checkBeats("findMax", RUN);
const bestAt = (f: number) => { let b = NUMS[0]; for (const s of STEPS) if (s.update !== undefined && f >= s.update + FLY) b = s.bestAfter; return b; };
const WATCH: Watch = [[CUE.best, "best", String(NUMS[0])], ...STEPS.flatMap((s): [number, string, string][] => [[s.start, "num", String(s.num)], ...(s.update !== undefined ? [[s.update + FLY, "best", String(s.bestAfter)] as [number, string, string]] : [])])];

// ---------------------------------------------------------------- layout
const DUCK_Y = 820, DUCK_K = 0.95, DUCK_X = [195, 425, 655, 885], TAG_Y = 905, BEST: P = [540, 1060];
const PANEL = { x: 46, y: 1196, w: 988, size: 25, lh: 40, pad: 18, file: "find_max.py" };

// ---------------------------------------------------------------- motion
const WIN = STEPS.find((s) => s.update !== undefined)!;
const HOPS: [number, number, number][] = [...STEPS.map((s, k) => [s.i, s.start + (k === 0 ? 6 : 20), 56] as [number, number, number]), [WIN.i, CUE.ret, 80],
  ...NUMS.map((_, i) => [i, CUE.party + i * 6, 54] as [number, number, number]), ...NUMS.map((_, i) => [i, CUE.party + 60 + i * 6, 34] as [number, number, number])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, i) => [f + 2, i] as [number, number]), [CUE.ret + 2, WIN.i], ...NUMS.map((_, i) => [CUE.party + i * 6 + 2, i] as [number, number])];
const stepAt = (f: number) => [...STEPS].reverse().find((s) => f >= s.start);
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const s = stepAt(f); let eye: Eye = "open";
  if (s && s.i === i && f >= s.check && f < s.check + 40) eye = s.greater ? "wide" : "worried";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + i * 41) % 97 < 4) eye = "blink";
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye, look: 0.3, label: String(NUMS[i]), seed: 9000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};
const pointerAt = (f: number): { at: P; tilt: number } | null => {
  if (f < STEPS[0].start || f >= CUE.print) return null;
  const top = (i: number) => headTop(pose(i, f));
  if (f < STEPS[0].start + 12) { const t = ease.out((f - STEPS[0].start) / 12), p = top(0); return { at: [lerp(p[0] - 200, p[0], t), lerp(-120, p[1], t)], tilt: lerp(-1, -0.12, t) }; }
  let cur = 0;
  for (let k = 1; k < STEPS.length; k++) if (f >= STEPS[k].start) {
    const a = top(k - 1), b = top(k), t = ease.inOut((f - STEPS[k].start) / 20);
    if (t < 1) return { at: [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - 110 * 4 * t * (1 - t)], tilt: -0.12 + 0.5 * Math.sin(Math.PI * t) };
    cur = k;
  }
  return { at: top(cur), tilt: -0.12 };
};

// ---------------------------------------------------------------- one frame
const flyText = (g: Gfx, s: string, x: number, y: number) => g.group("plain", () => text(g, s, x, y, { size: 44, weight: 700, fill: "#f6f0e2", stroke: C.ink, sw: 7 }));
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = stageBegin(ctx, env, f), s = stepAt(f);
  NUMS.forEach((_, i) => {
    if (f >= CUE.ret) { if (i === WIN.i) waterRing(g, DUCK_X[i], DUCK_Y + 14, DUCK_K, C.gold, ease.out(prog(f, CUE.ret, 8)), 560); return; }
    if (s && s.i === i) waterRing(g, DUCK_X[i], DUCK_Y + 14, DUCK_K, C.rose, ease.out(prog(f, s.start + 14, 8)), 500 + i);
  });
  NUMS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), ease.back(prog(f, CUE.nums + i * 3, 8))));
  const bq = ease.spring(prog(f, CUE.best, 24));
  drawEntry(ctx, env, BEST[0], BEST[1], `best : ${bestAt(f)}`, bq, f >= CUE.ret ? 0.5 + 0.5 * Math.sin((f - CUE.ret) * 0.2) : 0, 800);
  NUMS.forEach((_, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  const pt = pointerAt(f); if (pt) drawPointer(ctx, env, pt.at, DUCK_K * 1.1, pt.tilt, "num");
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 14, (f - l) / 18, 1100 + i, 0.8));
  // each step: compare bubble over the duck with a check or cross; a greater number flies into `best`
  STEPS.forEach((st, k) => {
    const top = headTop(pose(st.i, f)), q = ease.back(prog(f, st.check, 10)) * (1 - ease.out(prog(f, st.check + 56, 8)));
    drawBubble(ctx, env, Math.max(280, Math.min(800, DUCK_X[st.i] + 40)), 600, [[`${st.num} > ${st.bestBefore}`, C.ink], [st.greater ? "  yes" : "  no", st.greater ? C.teal : C.rose]], [Math.round(top[0] + 40), 680], q, 1400 + k, 38);
    (st.greater ? drawCheck : drawCross)(ctx, env, Math.max(280, Math.min(800, DUCK_X[st.i] + 40)) + 215, 585, q * 0.8);
    if (st.update !== undefined && f >= st.update && f < st.update + FLY) {
      const u = ease.inOut(prog(f, st.update, FLY)), a = chest(pose(st.i, f)), x = lerp(a[0], BEST[0], u), y = lerp(a[1], BEST[1], u) - 120 * 4 * u * (1 - u);
      flyText(g, String(st.num), x, y);
    }
  });
  const aq = ease.spring(prog(f, CUE.print, 24)); if (aq > 0) drawCard(ctx, env, 540, 545, "findMax returns", String(EXPECTED), aq);
  if (f >= CUE.party) for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 280, 545 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + k), a); }
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["nums = ", C.ink], [`[${NUMS.join(", ")}]`, C.rose]], from: CUE.nums, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.nums, ret: CUE.ret, print: CUE.print, output: String(EXPECTED) });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: i ? -1 : 1 } as SfxCue)),
  { frame: CUE.nums + 2, kind: "pop", variant: "tiny", label: "nums" }, { frame: CUE.best + 4, kind: "pop", variant: "cork", label: "best pad" },
  ...STEPS.flatMap((s, k): SfxCue[] => [
    k === 0 ? { frame: s.start + 10, kind: "whoosh", variant: "soft", dir: -1, label: "pointer flies in" } : { frame: s.start + 10, kind: "swish", variant: "soft", label: `pointer hops (${k})` },
    { frame: s.check + 6, kind: "pop", variant: "tiny", label: `compare (${k})`, gainDb: 3 },
    ...(s.update !== undefined ? [{ frame: s.update + 20, kind: "bubble", variant: "splash", label: "best updated", gainDb: -1 } as SfxCue] : []),
  ]),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "sparkle", label: "return best", gainDb: 2 },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
];
export const findMax: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: WIN.check + 30, holds: [[CUE.party + 100, DURATION, "the answer, held for reading"]],
    captions: [{ from: CUE.nums, to: STEPS[0].start, text: `nums = [${NUMS.join(", ")}]` }, { from: STEPS[0].start, to: CUE.ret, text: "Compare each number with best; a bigger one replaces it." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "findMax", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -2, -4], seed: 1 }),
};
