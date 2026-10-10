// REORDER LIST · duckcode, crayon, 9:16. Five duck nodes in a row. Three phases on the same row: slow/fast
// find the middle, the back half is cut off and reversed (second/prev/tmp), then the halves are woven
// together (first/second/tmp1/tmp2). Arrows are the real `next` pointers at every step; at the end the
// ducks swim into list order. Everything on screen comes from SIM, a simulation of the user's code.
import type { Ctx, Env, Gfx, P } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { splash, waterRing } from "./duck/fx";
import { C } from "./duck/crayon";
import { FONTS, ease, prog, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { drawNone, markersUp, nextArrow } from "./duck/list";
import { checkBeats, stageBegin, stageEnd, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 143, TITLE = "Reorder List", SUB = "LeetCode 143  ·  Python";
const VALS = [1, 2, 3, 4, 5], N = VALS.length, EXPECTED = "[1, 5, 2, 4, 3]";
const CODE = [
  "head = [1, 2, 3, 4, 5]  # a linked list", "class Solution:", "    def reorderList(self, head: Optional[ListNode]) -> None:",
  "        slow, fast = head, head.next", "        while fast and fast.next:", "            slow = slow.next", "            fast = fast.next.next",
  "        second = slow.next", "        prev = slow.next = None", "        while second:", "            tmp = second.next", "            second.next = prev",
  "            prev = second", "            second = tmp", "        first, second = head, prev", "        while second:",
  "            tmp1, tmp2 = first.next, second.next", "            first.next = second", "            second.next = tmp1", "            first, second = tmp1, tmp2",
  "Solution().reorderList(head)", "print(head)",
];
const NONE = -1, nm = (i: number | undefined) => (i === undefined ? "-" : i === NONE ? "None" : String(VALS[i]));

// ---------------------------------------------------------------- simulate the user's code
type Vars = Record<string, number | undefined>;
type Snap = { f: number; line: number; v: Vars; next: number[]; note: string; sub?: string; hot?: number; phase: number };
export const SIM: Snap[] = (() => {
  const out: Snap[] = [], next = VALS.map((_, i) => (i + 1 < N ? i + 1 : NONE)); let f = 135, phase = 1;
  const v: Vars = {};
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, v: { ...v }, next: [...next], note, phase, ...x }); f += dur; };
  v.slow = 0; v.fast = next[0]; at(3, `slow, fast = head, head.next  →  ${nm(v.slow)}, ${nm(v.fast)}`, 45, { sub: "phase 1: find the middle" });
  for (;;) {
    const go = v.fast !== NONE && next[v.fast!] !== NONE;
    at(4, `while fast and fast.next:  ${go ? "yes" : v.fast === NONE ? "fast is None" : "fast.next is None"}`, 30, { sub: go ? "fast can take two more steps" : `slow stopped at the middle: ${nm(v.slow)}` });
    if (!go) break;
    v.slow = next[v.slow!]; at(5, `slow = slow.next  →  ${nm(v.slow)}`, 45, { sub: "slow moves one duck" });
    v.fast = next[next[v.fast!]]; at(6, `fast = fast.next.next  →  ${nm(v.fast)}`, 60, { sub: "fast moves two ducks" });
  }
  phase = 2; const mid = v.slow!; delete v.fast;
  v.second = next[mid]; at(7, `second = slow.next  →  ${nm(v.second)}`, 45, { sub: "phase 2: the back half starts here" });
  v.prev = NONE; next[mid] = NONE; delete v.slow; at(8, "prev = slow.next = None", 60, { hot: mid, sub: `cut after ${VALS[mid]}: 1 → 2 → 3 and 4 → 5` });
  for (;;) {
    at(9, `while second:  ${nm(v.second)}`, 30, { sub: v.second === NONE ? "the back half is reversed" : "reverse the back half" });
    if (v.second === NONE) break;
    v.tmp = next[v.second!]; at(10, `tmp = second.next  →  ${nm(v.tmp)}`, 45, { sub: "save the rest" });
    const s = v.second!; next[s] = v.prev!; at(11, `second.next = prev  →  ${nm(v.prev)}`, 60, { hot: s, sub: `${VALS[s]} now points back` });
    v.prev = s; at(12, `prev = second  →  ${nm(v.prev)}`, 45);
    v.second = v.tmp; at(13, `second = tmp  →  ${nm(v.second)}`, 45);
  }
  phase = 3; delete v.tmp;
  v.first = 0; v.second = v.prev; delete v.prev; at(14, `first, second = head, prev  →  ${nm(v.first)}, ${nm(v.second)}`, 45, { sub: "phase 3: weave the two halves together" });
  for (;;) {
    at(15, `while second:  ${nm(v.second)}`, 30, { sub: v.second === NONE ? "nothing left to weave in" : "one more duck from the back half" });
    if (v.second === NONE) break;
    v.tmp1 = next[v.first!]; v.tmp2 = next[v.second!]; at(16, `tmp1, tmp2 = first.next, second.next  →  ${nm(v.tmp1)}, ${nm(v.tmp2)}`, 45, { sub: "remember where both halves continue" });
    const a = v.first!, b = v.second!;
    next[a] = b; at(17, `first.next = second  →  ${VALS[a]} → ${VALS[b]}`, 60, { hot: a, sub: "front duck points at the back duck" });
    next[b] = v.tmp1!; at(18, `second.next = tmp1  →  ${VALS[b]} → ${nm(v.tmp1)}`, 60, { hot: b, sub: "back duck points at the next front duck" });
    v.first = v.tmp1; v.second = v.tmp2; at(19, `first, second = tmp1, tmp2  →  ${nm(v.first)}, ${nm(v.second)}`, 45);
  }
  const res: number[] = []; for (let i = 0; i !== NONE; i = next[i]) res.push(VALS[i]);
  if (`[${res.join(", ")}]` !== EXPECTED) throw new Error(`reorderList: simulation gives ${res}`);
  return out;
})();
const LAST = SIM[SIM.length - 1], ORDER: number[] = []; for (let i = 0; i !== NONE; i = LAST.next[i]) ORDER.push(i);
const SIM_END = LAST.f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 23, 30, 38, 45], head: 60, call: 90, def: 120, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.head, 0], [CUE.call, 20], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.ret, 20], [CUE.print, 21]];
checkBeats("reorderList", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`reorderList: gap before ${RUN[k][0]}`);
const NAMES = ["slow", "fast", "second", "prev", "tmp", "first", "tmp1", "tmp2"];
const WATCH: Watch = SIM.flatMap((x) => NAMES.map((k): [number, string, string] => [x.f, k, x.v[k] === undefined ? "" : nm(x.v[k])]));
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 750, DUCK_K = 0.72, NX = (i: number) => 160 + i * 190, RIGHT = 1028, ARROW_Y = DUCK_Y + 60, MARK_Y = DUCK_Y + 112, NOTE_Y = 515;
const PANEL = { x: 46, y: 1108, w: 988, size: 20, lh: 27, pad: 18, file: "reorder_list.py" };
const COLS: Record<string, string> = { slow: C.teal, fast: C.rose, second: C.teal, prev: C.rose, tmp: C.gold, first: C.rose, tmp1: C.gold, tmp2: "#7b86a8" };
const posX = (n: number, f: number) => lerp(NX(n), NX(ORDER.indexOf(n)), ease.inOut(prog(f, CUE.ret + 6, 40)));
const swimLift = (n: number, f: number) => (ORDER.indexOf(n) === n ? 0 : 40 * Math.sin(Math.PI * prog(f, CUE.ret + 6, 40)));

// ---------------------------------------------------------------- motion
const HOTS = SIM.filter((x) => x.hot !== undefined);
const HOPS: [number, number, number][] = [...HOTS.map((x) => [x.hot!, x.f + 6, 44] as [number, number, number]),
  ...VALS.flatMap((_, d) => [[d, CUE.party + d * 4, 30], [d, CUE.party + 60 + d * 4, 20]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), ...HOTS.filter((_, k) => k % 2 === 0).map((x) => [x.f + 8, x.hot!] as [number, number]), [CUE.ret + 10, 4], [CUE.party + 2, 0]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.3); let lift = 3 + 3 * bob + swimLift(d, f), sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && s.hot === d) eye = "wide";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: posX(d, f), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.3 + 1), eye, look: 0.4, label: String(VALS[d]), seed: 14300 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : LAST, before = (s && SIM[SIM.indexOf(s) - 1]) ?? s, t = s ? ease.inOut(prog(f, s.f, 14)) : 1;
  if (f >= CUE.ret) VALS.forEach((_, d) => waterRing(g, posX(d, f), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + 40 + d * 4, 8)), 1430 + d));
  drawNone(ctx, env, RIGHT, ARROW_Y + 3 * Math.sin(f * 0.1), ease.back(prog(f, 40, 12)));
  // next arrows from the real pointers; a None in the middle of the row is a short stub labelled None
  const nx = s?.next ?? VALS.map((_, i) => (i + 1 < N ? i + 1 : NONE)), anchor = (n: number): P => [posX(n, f), ARROW_Y + 3 * Math.sin(f * 0.1 + n)];
  for (let n = 0; n < N; n++) {
    const q = prog(f, CUE.land[n] + 10, 12); if (q <= 0) continue;
    const m = nx[n], hot = s?.hot === n && f < CUE.ret, a = anchor(n);
    const tgt = (k: number): P => (k === NONE ? (posX(n, f) > NX(N - 1) - 20 ? [RIGHT - 30, a[1]] : [a[0] + 78, a[1] + 34]) : anchor(k));
    const b = tgt(m), was = hot && before ? tgt(before.next[n]) : b, end: P = hot ? [lerp(was[0], b[0], t), lerp(was[1], b[1], t)] : b;
    const stub = m === NONE && !(posX(n, f) > NX(N - 1) - 20);
    nextArrow(g, a, end, q, hot ? "#9a7a2a" : f >= CUE.ret ? "#6f5a2a" : C.ink, 0.1, stub ? 10 : m === NONE ? 10 : 34);
    if (stub && (!hot || t >= 1)) g.group("plain", () => text(g, "None", a[0] + 112, a[1] + 40, { size: 20, weight: 700, fill: C.inkSoft, alpha: q }));
  }
  VALS.forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, NX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.7));
  if (s && f < CUE.ret) {
    const xs = (x: Snap | undefined) => NAMES.map((k): [string, number | undefined] => [k, x?.v[k] === undefined ? undefined : x.v[k] === NONE ? RIGHT - 10 : NX(x.v[k]!)]);
    markersUp(ctx, env, f, xs(s), xs(before), t, MARK_Y, COLS, 0.82);
  }
  const note = f >= CUE.ret && f < CUE.print ? { note: "the list now reads 1 → 5 → 2 → 4 → 3", sub: "front, back, front, back, ..." } : f < CUE.ret ? s : undefined;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(60, NOTE_Y - 34, 960, h, 20); c.fill(); c.restore(); g.touch(60, NOTE_Y - 34, 1020, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 40 ? 27 : note.note.length > 32 ? 31 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: 25, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "print(head)", value: EXPECTED, time: ["O(n)", "three passes over the list"], space: ["O(1)", "only pointers are moved"], y: 520 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["head = ", C.ink], ["1 → 2 → 3 → 4 → 5", C.rose]], from: CUE.head, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.head, ret: CUE.ret, print: CUE.print, output: EXPECTED });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -1 : 1 } as SfxCue)),
  { frame: CUE.head + 2, kind: "pop", variant: "tiny", label: "head" },
  ...SIM.flatMap((x, k): SfxCue[] => x.hot !== undefined ? [{ frame: x.f + 6, kind: "swish", variant: "soft", label: `re-aim (${k})` }]
    : [4, 9, 15].includes(x.line) ? [{ frame: x.f + 2, kind: "tick", variant: "soft", label: `loop (${k})`, gainDb: 5 }]
    : x.line === 7 || x.line === 14 ? [{ frame: x.f + 4, kind: "pop", variant: "cork", label: `phase (${k})` }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into the swim" }, { frame: CUE.ret + 30, kind: "chime", variant: "sparkle", label: "in order", gainDb: 2 },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const reorderList: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: HOTS[HOTS.length - 2].f + 30, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.head, to: SIM[0].f, text: "head = 1 → 2 → 3 → 4 → 5" }, { from: SIM[0].f, to: CUE.ret, text: "Find the middle, reverse the back half, then weave the two halves." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}. Time O(n), space O(1).` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "reorderList", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -1, -2, 1], seed: 143 }),
};
