// FIND MINIMUM IN ROTATED SORTED ARRAY · duckcode, crayon, 9:16. Seven ducks over a crayon bar chart that
// shows the rotation cliff (7 → 0). Binary search: l, m, r markers on the bar tops; bars outside [l, r]
// fade out as the range halves. Everything on screen comes from SIM, a simulation of the user's code.
import type { Ctx, Env, Gfx } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { drawMarker, splash, waterRing } from "./duck/fx";
import { C, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { checkBeats, stageBegin, stageEnd, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp, mix } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 153, TITLE = "Find Minimum in Rotated Sorted Array", SUB = "LeetCode 153  ·  Python";
const NUMS = [4, 5, 6, 7, 0, 1, 2], N = NUMS.length, EXPECTED = 0;
const CODE = [
  "nums = [4, 5, 6, 7, 0, 1, 2]", "class Solution:", "    def findMin(self, nums: List[int]) -> int:", "        l, r = 0, len(nums) - 1", "        while l < r:",
  "            m = l + (r - l) // 2", "            if nums[m] < nums[r]:", "                r = m", "            else:", "                l = m + 1", "        return nums[l]", "print(Solution().findMin(nums))",
];

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; l?: number; m?: number; r?: number; note: string; sub?: string; half?: [number, number] };
export const SIM: Snap[] = (() => {
  const out: Snap[] = []; let f = 150, l: number | undefined, r: number | undefined, m: number | undefined;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, l, m, r, note, ...x }); f += dur; };
  l = 0; r = N - 1; at(3, `l, r = 0, ${N - 1}`, 45, { sub: "search the whole array" });
  while (l < r) {
    at(4, `l = ${l} < r = ${r}`, 30, { sub: "more than one candidate left" });
    m = l + Math.floor((r - l) / 2); at(5, `m = ${l} + (${r} - ${l}) // 2 = ${m}`, 60, { sub: "the middle of the range" });
    const yes = NUMS[m] < NUMS[r];
    at(6, `nums[${m}] = ${NUMS[m]}  <  nums[${r}] = ${NUMS[r]} ?   ${yes ? "Yes" : "No"}`, 75, { half: yes ? [m, r] : [l, m], sub: yes ? `m..r is sorted: the minimum is at m or left of it` : `${NUMS[m]} > ${NUMS[r]}: the drop (the minimum) is right of m` });
    if (yes) { r = m; at(7, `r = m = ${r}`, 60, { sub: "throw away everything right of m" }); }
    else { l = m + 1; at(9, `l = m + 1 = ${l}`, 60, { sub: "throw away m and everything left of it" }); }
  }
  m = undefined;
  at(4, `l = ${l} < r = ${r} ?   No`, 30, { sub: "one candidate left" });
  if (NUMS[l] !== EXPECTED) throw new Error("findMinRotated: simulation disagrees");
  at(10, `return nums[${l}] = ${NUMS[l]}`, 30, { sub: "the bottom of the cliff" });
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 21, 27, 33, 39, 45, 51], nums: 60, call: 90, def: 120, chart: 30, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.nums, 0], [CUE.call, 11], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 11]];
checkBeats("findMinRotated", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`findMinRotated: gap before ${RUN[k][0]}`);
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "l", String(x.l)], [x.f, "m", x.m === undefined ? "-" : String(x.m)], [x.f, "r", String(x.r)]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 730, DUCK_K = 0.6, SX = (d: number) => 105 + d * 145, NOTE_Y = 515, BASE_Y = 1250, UNIT = 36;
const barH = (d: number) => 40 + NUMS[d] * UNIT, top = (d: number) => BASE_Y - barH(d);
const PANEL = { x: 46, y: 1294, w: 988, size: 23, lh: 34, pad: 18, file: "find_min.py" };
const MCOL: Record<string, string> = { l: C.rose, m: C.gold, r: C.teal };

// ---------------------------------------------------------------- motion
const HOPS: [number, number, number][] = [...SIM.filter((x) => x.line === 5).map((x) => [x.m!, x.f + 6, 50] as [number, number, number]), [4, CUE.ret + 4, 80],
  ...NUMS.flatMap((_, d) => [[d, CUE.party + d * 4, 30], [d, CUE.party + 60 + d * 4, 20]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.filter((_, d) => d % 2 === 0).map((f, k) => [f + 2, k * 2] as [number, number]), ...SIM.filter((x) => x.line === 5).map((x) => [x.f + 8, x.m!] as [number, number]), [CUE.ret + 6, 4], [CUE.party + 2, 0]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.2); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && s.m === d && s.line === 6) eye = "wide";
  else if (s && f < CUE.ret && s.l !== undefined && (d < s.l || d > s.r!)) eye = "blink";
  if (f >= CUE.ret) eye = d === 4 ? "wide" : "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: SX(d), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.2 + 1), eye, look: 0.4, label: String(NUMS[d]), seed: 15300 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
type Kind = "set" | "out" | "half" | "best";
const barSprite = (env: Env, d: number, kind: Kind) => { const h = barH(d); return sprite(env, `fmbar:${d}:${kind}`, 100, h + 40, 50, h + 10, (g) => {
  const col = kind === "best" ? mix(C.gold, "#efe6d3", 0.15) : kind === "half" ? mix(C.teal, "#efe6d3", 0.35) : kind === "out" ? "#ddd5c2" : "#cfc3a6";
  wax(g, () => crayonShape(g, roundRect(-30, -h, 60, h, 10, 3), { col, shade: darker(col, kind === "out" ? 0.08 : 0.25), seed: 15700 + d, lw: kind === "out" ? 1.4 : 2.2, gap: 4.4, w: 4.6 }));
  text(g, String(NUMS[d]), 0, -h + 22, { size: 26, weight: 700, fill: kind === "out" ? "#a89c80" : kind === "set" ? C.ink : "#f6f0e2" });
  text(g, String(d), 0, 22, { size: 18, weight: 700, fill: C.inkSoft });
}); };

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : undefined;
  if (f >= CUE.ret) waterRing(g, SX(4), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret, 8)), 1560);
  else if (s?.m !== undefined) waterRing(g, SX(s.m), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, s.f, 8)), 1500 + s.m);
  NUMS.forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, SX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.6));
  for (let d = 0; d < N; d++) {
    const q = ease.spring(prog(f, CUE.chart + d * 4, 16)); if (q <= 0) continue;
    const kind: Kind = f >= CUE.ret ? (d === 4 ? "best" : "out") : s && (d < s.l! || d > s.r!) ? "out" : s?.half && d >= s.half[0] && d <= s.half[1] ? "half" : "set";
    blit(ctx, env, barSprite(env, d, kind), SX(d), BASE_Y + 3 * Math.sin(f * 0.1 + d * 0.8), 1, q, 0, kind === "out" ? 0.4 : 1);
  }
  if (s && f < CUE.ret) {
    const prev = SIM[SIM.indexOf(s) - 1] ?? s, t = ease.inOut(prog(f, s.f, 12)), names: [string, number | undefined, number | undefined][] = [["l", prev.l, s.l], ["m", prev.m, s.m], ["r", prev.r, s.r]];
    const live = names.filter(([, , b]) => b !== undefined);
    for (const [name, a, b] of live) {
      const same = live.filter(([, , c]) => c === b), side = same.length === 1 ? 0 : (same.findIndex(([n]) => n === name) - (same.length - 1) / 2) * 64;
      const from = a ?? b!, x = lerp(SX(from), SX(b!), t) + side, y = lerp(top(from), top(b!), t) - 6 + 4 * Math.sin(f * 0.16 + name.charCodeAt(0));
      drawMarker(ctx, env, x, y, name, 0.85 * (a === undefined ? ease.back(prog(f, s.f, 10)) : 1), MCOL[name]);
    }
  }
  const note = f >= CUE.ret && f < CUE.print ? SIM[SIM.length - 1] : s;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(70, NOTE_Y - 34, 940, h, 20); c.fill(); c.restore(); g.touch(70, NOTE_Y - 34, 1010, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 34 ? 30 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: note.sub.length > 50 ? 23 : 26, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "findMin returns", value: String(EXPECTED), time: ["O(log n)", "the range halves every step"], space: ["O(1)", "just l, m and r"], y: 520 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["nums = ", C.ink], [`[${NUMS.join(", ")}]`, C.rose]], from: CUE.nums, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.nums, ret: CUE.ret, print: CUE.print, output: String(EXPECTED) });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -2 : 0 } as SfxCue)),
  { frame: CUE.nums + 2, kind: "pop", variant: "tiny", label: "nums" },
  ...SIM.flatMap((x, k): SfxCue[] => x.line === 5 ? [{ frame: x.f + 6, kind: "pop", variant: "tiny", label: `m (${k})`, gainDb: 3 }]
    : x.line === 6 ? [{ frame: x.f + 10, kind: "tick", variant: "soft", label: `compare (${k})`, gainDb: 5 }]
    : x.line === 7 || x.line === 9 ? [{ frame: x.f + 4, kind: "whoosh", variant: "soft", dir: x.line === 7 ? -1 : 1, label: `halve (${k})` }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "sparkle", label: "found", gainDb: 2 },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const findMinRotated: Film = {
  meta: { title: `Find Minimum in Rotated Sorted Array · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: SIM[3].f + 30, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.nums, to: SIM[0].f, text: `nums = [${NUMS.join(", ")}]` }, { from: SIM[0].f, to: CUE.ret, text: "Compare the middle with the right end to find which side holds the drop." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}. Time O(log n), space O(1).` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "findMinRotated", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -1, -2, 1, -4, 3], seed: 153 }),
};
