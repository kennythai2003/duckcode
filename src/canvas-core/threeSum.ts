// 3SUM · duckcode, crayon, 9:16. Six ducks land unsorted, swim into sorted order, then i fixes one duck
// while l and r close in from both sides; a sum below 0 moves l right, above 0 moves r left, 0 is a triplet.
// Everything on screen comes from SIM, a line-by-line simulation of the user's code.
import type { Ctx, Env, Gfx, P } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { drawCard, drawCheck, drawCross, drawMarker, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { checkBeats, stageBegin, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 15, TITLE = "3Sum", SUB = "LeetCode 15  ·  Python";
const NUMS = [-1, 0, 1, 2, -1, -4], N = NUMS.length, EXPECTED = "[[-1, 2, -1], [0, 1, -1]]";
const CODE = [
  "nums = [-1, 0, 1, 2, -1, -4]", "class Solution:", "    def threeSum(self, nums: List[int]) -> List[List[int]]:", "        nums.sort()", "        res = []",
  "        for i, n in enumerate(nums):", "            if i > 0 and nums[i] == nums[i - 1]:", "                continue", "            l = i + 1", "            r = len(nums) - 1",
  "            while l < r:", "                if nums[l] + nums[r] + n < 0:", "                    l += 1", "                elif nums[l] + nums[r] + n > 0:", "                    r -= 1",
  "                else:", "                    res.append([nums[l], nums[r], n])", "                    l += 1", "                    while l < r and nums[l] == nums[l - 1]:", "                        l += 1",
  "        return res", "print(Solution().threeSum(nums))",
];
// sorted order: SLOT[d] is where duck d (by input index) ends up; stable, like Python's sort
const ORDER = NUMS.map((v, d) => [v, d]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([, d]) => d);
const SLOT = NUMS.map((_, d) => ORDER.indexOf(d)), SORTED = ORDER.map((d) => NUMS[d]);
const fmt = (v: number) => (v < 0 ? `(${v})` : String(v));
const show = (t: number[]) => `[${t.join(", ")}]`;

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; i?: number; l?: number; r?: number; res: number[][]; note: string; sub?: string; verdict?: "yes" | "no"; found?: number[] };
const SORT_F = 150;
export const SIM: Snap[] = (() => {
  const out: Snap[] = [], res: number[][] = []; let f = SORT_F, i: number | undefined, l: number | undefined, r: number | undefined, fast = false;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, i, l, r, res: res.map((t) => [...t]), note, ...x }); f += fast ? Math.max(15, Math.round(dur / 2 / 15) * 15) : dur; };
  const nums = [...NUMS];
  nums.sort((a, b) => a - b); at(3, `nums.sort()  →  ${show(nums)}`, 75, { sub: "sorted, so a bigger sum is always to the right" });
  at(4, "res = []", 30);
  for (i = 0; i < nums.length; i++) {
    const n = nums[i]; l = undefined; r = undefined; fast = i >= 4;
    at(5, `i = ${i}, n = ${n}`, 30, { sub: i === 0 ? "fix one number, find two more" : undefined });
    if (i > 0 && nums[i] === nums[i - 1]) { at(6, `nums[${i}] == nums[${i - 1}]  (${n} again)`, 45, { sub: "the same n finds the same triplets", verdict: "no" }); at(7, "continue: skip it", 30); continue; }
    at(6, i === 0 ? "i = 0: nothing before it" : `nums[${i}] = ${n}  ≠  nums[${i - 1}] = ${nums[i - 1]}`, 30);
    l = i + 1; at(8, `l = ${l}`, 30);
    r = nums.length - 1; at(9, `r = ${r}`, 30);
    while (l < r) {
      at(10, `l = ${l} < r = ${r}`, 15);
      const s = nums[l] + nums[r] + n, eq = `${nums[l]} + ${nums[r]} + ${fmt(n)} = ${s}`;
      if (s < 0) { at(11, eq, 45, { sub: `${s} < 0: too small, move l right` }); l += 1; at(12, `l = ${l}`, 30); continue; }
      at(11, eq, 30, { sub: `${s} is not < 0` });
      if (s > 0) { at(13, eq, 45, { sub: `${s} > 0: too big, move r left` }); r -= 1; at(14, `r = ${r}`, 30); continue; }
      at(13, eq, 30, { sub: "0 is not > 0 either" });
      at(15, "else: the sum is exactly 0!", 30, { verdict: "yes" });
      const t = [nums[l], nums[r], n], found = [i, l, r]; res.push(t);
      at(16, `res.append(${show(t)})`, 75, { found, sub: "a triplet that sums to 0" });
      l += 1; at(17, `l = ${l}`, 30);
      const dup = l < r && nums[l] === nums[l - 1];
      at(18, l < r ? `nums[${l}] = ${nums[l]}  ${dup ? "==" : "≠"}  nums[${l - 1}] = ${nums[l - 1]}` : `l = ${l} is not < r = ${r}`, 30, { sub: dup ? "skip the repeat" : "no repeat to skip" });
      while (l < r && nums[l] === nums[l - 1]) { l += 1; at(19, `l = ${l}`, 30); }
    }
    at(10, l < N ? `l = ${l} is not < r = ${r}: done with i = ${i}` : `l = ${l} is past the end: nothing to pair`, 30);
  }
  i = undefined; l = undefined; r = undefined; fast = false;
  if (show(res.map(show) as unknown as number[]).replace(/"/g, "") !== EXPECTED) throw new Error(`threeSum: simulation gives ${JSON.stringify(res)}`);
  at(20, `return ${EXPECTED}`, 30);
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 300) / 120) * 120;
export const CUE = { land: [15, 23, 30, 38, 45, 53], nums: 60, call: 90, def: 120, sort: SORT_F, tags: 30, ret: RET, print: RET + 60, party: RET + 90 };
if (CUE.ret < SIM_END) throw new Error("threeSum: the simulation runs into the ending");
const RUN: Run = [[CUE.nums, 0], [CUE.call, 21], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 21]];
checkBeats("threeSum", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`threeSum: gap before ${RUN[k][0]}`);
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "i", x.i === undefined ? "-" : String(x.i)], [x.f, "n", x.i === undefined ? "-" : String(SORTED[x.i])], [x.f, "l", x.l === undefined ? "-" : String(x.l)], [x.f, "r", x.r === undefined ? "-" : String(x.r)]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 735, DUCK_K = 0.64, SX = (s: number) => 115 + s * 170, TAG_Y = 905, MARK_Y = 876, RES_Y = 1005, NOTE_Y = 515;
const PANEL = { x: 46, y: 1086, w: 988, size: 20, lh: 28, pad: 18, file: "three_sum.py" };
const SWIM = 45;
// where duck d is at frame f: its input slot, then a hop across to its sorted slot
const duckX = (d: number, f: number) => lerp(SX(d), SX(SLOT[d]), ease.inOut(prog(f, CUE.sort + 10, SWIM)));
const swimLift = (d: number, f: number) => { const t = prog(f, CUE.sort + 10, SWIM); return SLOT[d] === d ? 0 : (22 + 14 * (d % 3)) * Math.sin(Math.PI * t); };
const duckAtSlot = (s: number) => ORDER[s];

// ---------------------------------------------------------------- motion
const FOUND = SIM.filter((x) => x.found);
const CMP = SIM.filter((x) => x.line === 11);
const HOPS: [number, number, number][] = [
  ...FOUND.flatMap((x) => x.found!.map((s, k) => [duckAtSlot(s), x.f + 6 + k * 5, 60] as [number, number, number])),
  ...NUMS.flatMap((_, d) => [[d, CUE.party + d * 4, 50], [d, CUE.party + 60 + d * 4, 30]] as [number, number, number][]),
];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), [CUE.sort + 12, 5], [CUE.sort + 20, 0],
  ...FOUND.flatMap((x) => x.found!.map((s, k) => [x.f + 8 + k * 5, duckAtSlot(s)] as [number, number])), [CUE.party + 2, 0], [CUE.party + 8, 3], [CUE.party + 14, 5]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.3); let lift = 3 + 3 * bob + swimLift(d, f), sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const slot = SLOT[d]; let eye: Eye = "open";
  if (f >= CUE.sort && f < CUE.sort + SWIM + 15) eye = "wide";
  else if (s && f < CUE.ret && (s.found ?? []).includes(slot)) eye = "happy";
  else if (s && f < CUE.ret && (slot === s.i || slot === s.l || slot === s.r) && (s.line === 11 || s.line === 13)) eye = s.sub?.includes("not") ? "open" : "worried";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: duckX(d, f), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.3 + 1), eye, look: 0.4, label: String(NUMS[d]), seed: 15000 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
const tripSprite = (env: Env, t: string, gold: boolean) => sprite(env, `3sum:${t}:${gold}`, 280, 90, 140, 45, (g) => {
  const col = gold ? "#c9b45a" : "#e8dfca";
  wax(g, () => crayonShape(g, roundRect(-128, -32, 256, 64, 14, 4), { col, shade: darker(col, 0.25), seed: 15700 + (gold ? 1 : 0), lw: 2.4, gap: 4.2, w: 4.4 }));
  text(g, t, 0, 2, { size: 32, weight: 700, fill: C.ink });
});
const RES_X = [400, 720];
const MARK_COL: Record<string, string> = { i: C.gold, l: C.rose, r: C.teal };

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : undefined;
  // rings under the three ducks in play: i gold, l rose, r teal
  if (s) for (const [k, v] of [["i", s.i], ["l", s.l], ["r", s.r]] as [string, number | undefined][]) if (v !== undefined && v < N) waterRing(g, SX(v), DUCK_Y + 12, DUCK_K, MARK_COL[k], ease.out(prog(f, s.f, 8)), 1500 + v);
  if (f >= CUE.ret) NUMS.forEach((_, d) => waterRing(g, SX(SLOT[d]), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + d * 4, 8)), 1560 + d));
  // index tags under the slots (they wait until the ducks are sorted to light up)
  for (let k = 0; k < N; k++) { const q = ease.spring(prog(f, CUE.tags + k * 4, 14)); if (q > 0) drawTag(ctx, env, SX(k), TAG_Y + 3.5 * Math.sin(f * 0.1 + k * 0.7), String(k), q, s && (k === s.i || k === s.l || k === s.r) ? 1 : 0); }
  NUMS.forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, SX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.7));
  // i, l, r markers between the ducks and their index tags
  if (s && s.i !== undefined) {
    const prev = SIM[SIM.indexOf(s) - 1] ?? s, t = ease.inOut(prog(f, s.f, 12)), up = 1;
    const marks: [string, number | undefined, number | undefined][] = [["i", prev.i, s.i], ["l", prev.l, s.l], ["r", prev.r, s.r]];
    for (const [name, a, b] of marks) {
      if (b === undefined || b >= N) continue;
      const side = s.l === s.r && name !== "i" ? (name === "l" ? -27 : 27) : 0, x0 = a === undefined || a >= N ? SX(b) : SX(a);
      const q = a === undefined || a >= N ? ease.back(prog(f, s.f, 10)) : 1;
      drawMarker(ctx, env, lerp(x0, SX(b), t) + side, MARK_Y + 4 * Math.sin(f * 0.16 + name.length + (name === "r" ? 2 : 0)), name, 0.9 * q * up, MARK_COL[name]);
    }
  }
  // verdicts: ✓ on a triplet, ✗ on a skipped repeat
  if (s?.verdict) { const q = ease.back(prog(f, s.f + 8, 10)); (s.verdict === "yes" ? drawCheck : drawCross)(ctx, env, 540, 620, q); }
  // res: triplets fly from the ducks to the res row
  const resQ = prog(f, SIM[1].f, 10);
  if (resQ > 0 && f < CUE.print) g.group("plain", () => text(g, "res =", 150, RES_Y, { size: 34, weight: 700, fill: C.ink, alpha: resQ * (1 - prog(f, CUE.print - 10, 10)) }));
  FOUND.forEach((x, k) => {
    if (f < x.f || f >= CUE.print) return;
    const t = ease.inOut(prog(f, x.f + 20, 30)), to: P = [RES_X[k], RES_Y];
    const px = lerp(SX(x.found![1]) * 0.5 + SX(x.found![2]) * 0.5, to[0], t), py = lerp(DUCK_Y - 40, to[1], t) - 120 * Math.sin(Math.PI * t), q = ease.back(prog(f, x.f + 8, 12)) * (1 - prog(f, CUE.print - 10, 10));
    const tri = SIM.find((y) => y.f > x.f)!.res[k];
    blit(ctx, env, tripSprite(env, show(tri), f < x.f + 75), px, py + (t >= 1 ? 3 * Math.sin(f * 0.12 + k) : 0), q, q);
  });
  // the one-line note (what the line just did)
  const note = f >= CUE.ret && f < CUE.print ? { note: `return ${EXPECTED}`, sub: "every triplet that sums to 0, no repeats" } : s;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(110, NOTE_Y - 34, 860, h, 20); c.fill(); c.restore(); g.touch(110, NOTE_Y - 34, 970, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 30 ? 30 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: 26, weight: 500, fill: C.inkSoft }); });
  const aq = ease.spring(prog(f, CUE.print, 24)); if (aq > 0) drawCard(ctx, env, 540, 545, "threeSum returns", EXPECTED, aq);
  if (f >= CUE.party) for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 290, 545 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + k), a); }
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["nums = ", C.ink], [show(NUMS), C.rose]], from: CUE.nums, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.nums, ret: CUE.ret, print: CUE.print, output: EXPECTED });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -1 : 1 } as SfxCue)),
  { frame: CUE.nums + 2, kind: "pop", variant: "tiny", label: "nums" }, { frame: CUE.sort + 10, kind: "whoosh", variant: "soft", dir: 1, label: "the ducks sort themselves" },
  ...SIM.flatMap((x, k): SfxCue[] => x.found ? [{ frame: x.f + 8, kind: "chime", variant: "sparkle", label: `triplet (${k})`, gainDb: 2 }]
    : x.verdict === "no" ? [{ frame: x.f + 8, kind: "pop", variant: "cork", label: `skip repeat (${k})` }]
    : x.line === 12 || x.line === 14 || x.line === 17 ? [{ frame: x.f + 2, kind: "tick", variant: "soft", label: `pointer moves (${k})`, gainDb: 5 }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "bell", label: "return res" },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
];
export const threeSum: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: CMP[4].f + 20, holds: [[CUE.party + 60, DURATION, "the answer, held for reading"]],
    captions: [{ from: CUE.nums, to: SIM[0].f, text: `nums = ${show(NUMS)}` }, { from: SIM[0].f, to: CUE.ret, text: "Sort, fix one number, then close two pointers in from both ends." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "threeSum", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -1, -2, 1, -4], seed: 15 }),
};
