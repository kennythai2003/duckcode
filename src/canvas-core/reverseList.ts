// REVERSE LINKED LIST · duckcode, crayon, 9:16. Five duck nodes joined by `next` arrows on the water,
// None plaques at both ends. prev / curr / temp markers walk the list and each `curr.next = prev`
// swings an arrow round to point back. Everything on screen comes from SIM, a simulation of the user's code.
import type { Ctx, Gfx, P } from "./core";
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

const FPS = 30, BPM = 120, LC = 206, TITLE = "Reverse Linked List", SUB = "LeetCode 206  ·  Python";
const VALS = [1, 2, 3, 4, 5], N = VALS.length, EXPECTED = "[5, 4, 3, 2, 1]";
const CODE = [
  "head = [1, 2, 3, 4, 5]  # a linked list", "class Solution:", "    def reverseList(", "        self, head: Optional[ListNode]", "    ) -> Optional[ListNode]:",
  "        prev = None", "        curr = head", "        while curr:", "            temp = curr.next", "            curr.next = prev", "            prev = curr", "            curr = temp",
  "        return prev", "print(Solution().reverseList(head))",
];
const NONE = -1, nm = (i: number) => (i === NONE ? "None" : `node ${VALS[i]}`);

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; prev?: number; curr?: number; temp?: number; next: number[]; flipped: boolean[]; note: string; sub?: string; hot?: number };
export const SIM: Snap[] = (() => {
  const out: Snap[] = [], next = VALS.map((_, i) => (i + 1 < N ? i + 1 : NONE)), flipped = VALS.map(() => false);
  let f = 135, prev: number | undefined, curr: number | undefined, temp: number | undefined;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, prev, curr, temp, next: [...next], flipped: [...flipped], note, ...x }); f += dur; };
  prev = NONE; at(5, "prev = None", 45, { sub: "nothing comes before the first node yet" });
  curr = 0; at(6, "curr = head  →  node 1", 30, { sub: "start at the front" });
  while (curr !== NONE) {
    at(7, `while curr:  ${nm(curr)}`, 30, { sub: "still a node to flip" });
    temp = next[curr]; at(8, `temp = curr.next  →  ${nm(temp)}`, 45, { sub: "save the rest of the list before we cut it" });
    next[curr] = prev; flipped[curr] = true; at(9, `curr.next = prev  →  ${nm(prev)}`, 60, { hot: curr, sub: `node ${VALS[curr]} now points back` });
    prev = curr; at(10, `prev = curr  →  ${nm(prev)}`, 45, { sub: "prev steps forward" });
    curr = temp; at(11, `curr = temp  →  ${nm(curr)}`, 45, { sub: "curr steps forward" });
  }
  at(7, "while curr:  None", 30, { sub: "every arrow is flipped" });
  const res: number[] = []; for (let i = prev!; i !== NONE; i = next[i]) res.push(VALS[i]);
  if (`[${res.join(", ")}]` !== EXPECTED) throw new Error(`reverseList: simulation gives ${res}`);
  at(12, `return prev  →  node ${VALS[prev!]}`, 30, { sub: "the new head: 5 → 4 → 3 → 2 → 1" });
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 23, 30, 38, 45], head: 60, call: 90, def: 120, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.head, 0], [CUE.call, 13], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 13]];
checkBeats("reverseList", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`reverseList: gap before ${RUN[k][0]}`);
const show = (i?: number) => (i === undefined ? "-" : i === NONE ? "None" : String(VALS[i]));
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "prev", show(x.prev)], [x.f, "curr", show(x.curr)], [x.f, "temp", show(x.temp)]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 750, DUCK_K = 0.72, NX = (i: number) => 160 + i * 190, LEFT = 52, RIGHT = 1028, ARROW_Y = DUCK_Y + 60, MARK_Y = DUCK_Y + 110, NOTE_Y = 515;
const PANEL = { x: 46, y: 1226, w: 988, size: 23, lh: 34, pad: 18, file: "reverse_list.py" };
const COLS: Record<string, string> = { prev: C.rose, curr: C.teal, temp: C.gold };
const anchor = (i: number): P => [NX(i), ARROW_Y];

// ---------------------------------------------------------------- motion
const FLIPS = SIM.filter((x) => x.hot !== undefined);
const HOPS: [number, number, number][] = [...FLIPS.map((x) => [x.hot!, x.f + 6, 50] as [number, number, number]), [N - 1, CUE.ret + 4, 70],
  ...VALS.flatMap((_, d) => [[d, CUE.party + d * 4, 30], [d, CUE.party + 60 + d * 4, 20]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), ...FLIPS.map((x) => [x.f + 8, x.hot!] as [number, number]), [CUE.ret + 6, N - 1], [CUE.party + 2, 0]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.3); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && s.hot === d) eye = "wide";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: NX(d), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.3 + 1), eye, look: s?.flipped[d] ? -0.5 : 0.5, label: String(VALS[d]), seed: 20600 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Gfx["env"]) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : SIM[SIM.length - 1];
  const prevSnap = SIM[SIM.indexOf(s ?? SIM[0]) - 1] ?? s, t = s ? ease.inOut(prog(f, s.f, 14)) : 1;
  if (f >= CUE.ret) waterRing(g, NX(N - 1), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret, 8)), 2060);
  // None plaques and the next arrows (an arrow being re-aimed glides from its old target to the new one, in gold)
  const nq = ease.back(prog(f, 40, 12));
  drawNone(ctx, env, LEFT, ARROW_Y, nq); drawNone(ctx, env, RIGHT, ARROW_Y, nq);
  const tgt = (i: number, n: number, flipped: boolean): P => (n === NONE ? [flipped ? LEFT + 30 : RIGHT - 30, ARROW_Y] : anchor(n));
  for (let i = 0; i < N; i++) {
    const q = prog(f, CUE.land[i] + 10, 12); if (q <= 0) continue;
    const now = s ? tgt(i, s.next[i], s.flipped[i]) : tgt(i, i + 1 < N ? i + 1 : NONE, false), was = prevSnap ? tgt(i, prevSnap.next[i], prevSnap.flipped[i]) : now;
    const moving = s?.hot === i && f < CUE.ret, end: P = moving ? [lerp(was[0], now[0], t), lerp(was[1], now[1], t) + 40 * Math.sin(Math.PI * t)] : now;
    const toNone = (s ? s.next[i] : i + 1 < N ? 0 : NONE) === NONE && !moving; nextArrow(g, anchor(i), end, q, moving ? "#9a7a2a" : f >= CUE.ret ? "#6f5a2a" : C.ink, s?.flipped[i] ? -0.12 : 0.12, toNone ? 10 : 34);
  }
  VALS.forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, NX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.6));
  // prev / curr / temp
  const px = (i?: number, side = 1) => (i === undefined ? undefined : i === NONE ? (side < 0 ? LEFT + 14 : RIGHT - 14) : NX(i));
  if (s && f < CUE.ret) markersUp(ctx, env, f, [["prev", px(s.prev, -1)], ["curr", px(s.curr)], ["temp", px(s.temp)]], [["prev", px(prevSnap?.prev, -1)], ["curr", px(prevSnap?.curr)], ["temp", px(prevSnap?.temp)]], t, MARK_Y, COLS, 0.92);
  if (f >= CUE.ret && f < CUE.print) g.group("plain", () => text(g, "← new head", NX(N - 1) - 10, MARK_Y + 70, { size: 30, weight: 700, fill: C.ink, alpha: prog(f, CUE.ret, 10) }));
  const note = f >= CUE.ret && f < CUE.print ? SIM[SIM.length - 1] : f < CUE.ret ? s : undefined;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(70, NOTE_Y - 34, 940, h, 20); c.fill(); c.restore(); g.touch(70, NOTE_Y - 34, 1010, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 34 ? 30 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: 26, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "the list now reads", value: EXPECTED, time: ["O(n)", "each node is visited once"], space: ["O(1)", "just prev, curr and temp"], y: 520 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["head = ", C.ink], ["1 → 2 → 3 → 4 → 5", C.rose]], from: CUE.head, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.head, ret: CUE.ret, print: CUE.print, output: EXPECTED });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -1 : 1 } as SfxCue)),
  { frame: CUE.head + 2, kind: "pop", variant: "tiny", label: "head" },
  ...SIM.flatMap((x, k): SfxCue[] => x.hot !== undefined ? [{ frame: x.f + 6, kind: "whoosh", variant: "soft", dir: -1, label: `flip (${k})` }]
    : x.line === 8 ? [{ frame: x.f + 4, kind: "pop", variant: "tiny", label: `temp (${k})`, gainDb: 3 }]
    : x.line === 7 ? [{ frame: x.f + 2, kind: "tick", variant: "soft", label: `loop (${k})`, gainDb: 5 }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "sparkle", label: "return", gainDb: 2 },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const reverseList: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: FLIPS[2].f + 30, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.head, to: SIM[0].f, text: "head = 1 → 2 → 3 → 4 → 5" }, { from: SIM[0].f, to: CUE.ret, text: "Save next, flip the arrow back, then step prev and curr forward." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}. Time O(n), space O(1).` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "reverseList", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -1, -2, 1], seed: 206 }),
};
