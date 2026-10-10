// REMOVE NTH NODE FROM END OF LIST · duckcode, crayon, 9:16. A dummy plaque, five duck nodes and None.
// right runs n nodes ahead, then left and right walk together until right falls off the end; left then
// stops just before the node to remove, and left.next skips it (that duck drifts away). Everything from SIM.
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

const FPS = 30, BPM = 120, LC = 19, TITLE = "Remove Nth Node From End of List", SUB = "LeetCode 19  ·  Python";
const VALS = [1, 2, 3, 4, 5], N = VALS.length, NTH = 2, EXPECTED = "[1, 2, 3, 5]";
const CODE = [
  "head = [1, 2, 3, 4, 5]  # a linked list", "n = 2", "class Solution:", "    def removeNthFromEnd(", "        self, head: Optional[ListNode], n: int", "    ) -> Optional[ListNode]:",
  "        dummy = ListNode(0, head)", "        left = dummy", "        right = head", "        while n > 0:", "            right = right.next", "            n -= 1",
  "        while right:", "            left = left.next", "            right = right.next", "        left.next = left.next.next", "        return dummy.next", "print(Solution().removeNthFromEnd(head, n))",
];
const NONE = -1, DUMMY = -2, nm = (i: number | undefined) => (i === undefined ? "-" : i === NONE ? "None" : i === DUMMY ? "dummy" : `node ${VALS[i]}`);

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; left?: number; right?: number; n: number; next: number[]; note: string; sub?: string; hot?: boolean; gone?: number };
export const SIM: Snap[] = (() => {
  const out: Snap[] = [], next = VALS.map((_, i) => (i + 1 < N ? i + 1 : NONE)); let f = 135, left: number | undefined, right: number | undefined, n = NTH, dnext = 0, gone: number | undefined;
  const nxt = (i: number) => (i === DUMMY ? dnext : next[i]);
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, left, right, n, next: [...next], gone, note, ...x }); f += dur; };
  at(6, "dummy = ListNode(0, head)", 45, { sub: "a fake node in front, in case head itself is removed" });
  left = DUMMY; at(7, "left = dummy", 30);
  right = 0; at(8, "right = head  →  node 1", 30);
  for (;;) {
    at(9, `while n > 0:  n = ${n}`, 30, { sub: n > 0 ? "right runs ahead first" : `right is now ${NTH + 1} hops ahead of left` });
    if (!(n > 0)) break;
    right = nxt(right!); at(10, `right = right.next  →  ${nm(right)}`, 45);
    n -= 1; at(11, `n -= 1  →  ${n}`, 30);
  }
  for (;;) {
    at(12, `while right:  ${nm(right)}`, 30, { sub: right === NONE ? "right fell off the end: left is just before the target" : "walk both together, keeping the gap" });
    if (right === NONE) break;
    left = nxt(left!); at(13, `left = left.next  →  ${nm(left)}`, 45);
    right = nxt(right!); at(14, `right = right.next  →  ${nm(right)}`, 45);
  }
  const target = nxt(left!), after = nxt(target);
  next[left!] = after; gone = target; at(15, `left.next = left.next.next  →  ${nm(after)}`, 75, { hot: true, sub: `skip node ${VALS[target]}: it's the ${NTH}nd from the end` });
  const res: number[] = []; for (let i = dnext; i !== NONE; i = next[i]) res.push(VALS[i]);
  if (`[${res.join(", ")}]` !== EXPECTED) throw new Error(`removeNth: simulation gives ${res}`);
  at(16, "return dummy.next", 30, { sub: "1 → 2 → 3 → 5" });
  return out;
})();
const LAST = SIM[SIM.length - 1], GONE = LAST.gone!;
const SIM_END = LAST.f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 23, 30, 38, 45], head: 45, n: 60, call: 90, def: 120, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.head, 0], [CUE.n, 1], [CUE.call, 17], [CUE.def, 3], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 17]];
checkBeats("removeNth", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`removeNth: gap before ${RUN[k][0]}`);
const sv = (i?: number) => (i === undefined ? "-" : i === NONE ? "None" : i === DUMMY ? "dummy" : String(VALS[i]));
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "left", sv(x.left)], [x.f, "right", sv(x.right)], [x.f, "n", String(x.n)]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);
const CUT = SIM.find((x) => x.hot)!.f;

// ---------------------------------------------------------------- layout
const DUCK_Y = 750, DUCK_K = 0.66, NX = (i: number) => 255 + i * 168, DUMMY_X = 85, RIGHT = 1030, ARROW_Y = DUCK_Y + 58, MARK_Y = DUCK_Y + 108, NOTE_Y = 515;
const PANEL = { x: 46, y: 1162, w: 988, size: 21, lh: 30, pad: 18, file: "remove_nth.py" };
const COLS: Record<string, string> = { left: C.rose, right: C.teal };
// the removed duck drifts down and away after the cut; the ducks after it close the gap at the end
const drift = (f: number) => ease.inOut(prog(f, CUT + 20, 40));
const xOf = (i: number, f: number) => (i === DUMMY ? DUMMY_X : i === NONE ? RIGHT : i > GONE ? lerp(NX(i), NX(i - 1), ease.inOut(prog(f, CUE.ret + 4, 30))) : i === GONE ? NX(i) + 30 * drift(f) : NX(i));
const yOf = (i: number, f: number) => (i === GONE ? DUCK_Y + 230 * drift(f) : DUCK_Y);

// ---------------------------------------------------------------- motion
const HOPS: [number, number, number][] = [[GONE, CUT + 8, 50], ...VALS.flatMap((_, d) => d === GONE ? [] : [[d, CUE.party + d * 4, 30], [d, CUE.party + 60 + d * 4, 20]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), [CUT + 10, GONE], [CUE.party + 2, 0], [CUE.party + 8, 4]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.3); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (d === GONE && f >= CUT) eye = "worried"; else if (s && f < CUE.ret && (s.left === d || s.right === d) && s.line >= 12) eye = "open";
  if (f >= CUE.ret && d !== GONE) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  const k = d === GONE ? DUCK_K * (1 - 0.35 * drift(f)) : DUCK_K;
  return { x: xOf(d, f), y: yOf(d, f), k, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.3 + 1), eye, look: 0.4, label: String(VALS[d]), seed: 1900 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : LAST, before = (s && SIM[SIM.indexOf(s) - 1]) ?? s, t = s ? ease.inOut(prog(f, s.f, 14)) : 1;
  if (f >= CUE.ret) VALS.forEach((_, d) => { if (d !== GONE) waterRing(g, xOf(d, f), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + 30 + d * 4, 8)), 1960 + d); });
  const pq = ease.back(prog(f, CUE.def, 12)), wob = (i: number) => 3 * Math.sin(f * 0.1 + i);
  drawNone(ctx, env, DUMMY_X, ARROW_Y - 40 + wob(9), ease.back(prog(f, SIM[0].f + 4, 12)), "dummy"); drawNone(ctx, env, RIGHT, ARROW_Y + wob(8), pq);
  const anchor = (i: number): P => (i === DUMMY ? [DUMMY_X + 30, ARROW_Y - 40 + wob(9)] : i === NONE ? [RIGHT, ARROW_Y + wob(8)] : [xOf(i, f), yOf(i, f) + 58 + wob(i)]);
  // next arrows: dummy → node 1, each node to its next; node 3's arrow swings past the removed duck
  if (s && f >= SIM[0].f) nextArrow(g, anchor(DUMMY), anchor(0), prog(f, SIM[0].f + 8, 12), C.ink, 0.1, 30);
  for (let i = 0; i < N; i++) {
    const q = prog(f, CUE.land[i] + 10, 12); if (q <= 0) continue;
    const m = (s?.next ?? [])[i] ?? (i + 1 < N ? i + 1 : NONE), hot = s?.hot && i === GONE - 1 && f < CUE.ret;
    const b = anchor(m), was = hot ? anchor(GONE) : b, end: P = hot ? [lerp(was[0], b[0], t), lerp(was[1], b[1], t) + 30 * Math.sin(Math.PI * t)] : b;
    nextArrow(g, anchor(i), end, q * (i === GONE ? 1 - 0.6 * drift(f) : 1), hot ? "#9a7a2a" : C.ink, 0.1, m === NONE ? 50 : 34);
  }
  VALS.forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, NX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.7));
  if (f >= CUT + 30 && f < CUE.print) g.group("plain", () => text(g, "removed", xOf(GONE, f), yOf(GONE, f) + 70, { size: 24, weight: 700, fill: C.inkSoft, alpha: prog(f, CUT + 40, 10) }));
  if (s && f < CUE.ret) {
    const xs = (x: Snap | undefined): [string, number | undefined][] => [["left", x?.left === undefined ? undefined : xOf(x.left, f)], ["right", x?.right === undefined ? undefined : x.right === NONE ? RIGHT - 10 : xOf(x.right, f)]];
    markersUp(ctx, env, f, xs(s), xs(before), t, MARK_Y, COLS, 0.9);
  }
  const note = f >= CUE.ret && f < CUE.print ? LAST : f < CUE.ret ? s : undefined;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(70, NOTE_Y - 34, 940, h, 20); c.fill(); c.restore(); g.touch(70, NOTE_Y - 34, 1010, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 34 ? 30 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: note.sub.length > 50 ? 23 : 26, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "the list now reads", value: EXPECTED, time: ["O(n)", "one pass with two pointers"], space: ["O(1)", "just left, right and dummy"], y: 520 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["head = ", C.ink], ["1 → 2 → 3 → 4 → 5", C.rose], [",  n = ", C.ink], [String(NTH), C.rose]], from: CUE.head, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.head, ret: CUE.ret, print: CUE.print, output: EXPECTED });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -1 : 1 } as SfxCue)),
  { frame: CUE.head + 2, kind: "pop", variant: "tiny", label: "head" }, { frame: CUE.n + 2, kind: "pop", variant: "tiny", label: "n" },
  ...SIM.flatMap((x, k): SfxCue[] => x.line === 10 || x.line === 14 ? [{ frame: x.f + 4, kind: "swish", variant: "soft", label: `right steps (${k})` }]
    : x.line === 13 ? [{ frame: x.f + 4, kind: "tick", variant: "soft", label: `left steps (${k})`, gainDb: 5 }] : []),
  { frame: CUT + 6, kind: "whoosh", variant: "soft", dir: 1, label: "skip the node" }, { frame: CUT + 24, kind: "bubble", variant: "splash", label: "it drifts off", gainDb: -2 },
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 30, kind: "chime", variant: "sparkle", label: "closed up", gainDb: 2 },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const removeNth: Film = {
  meta: { title: `Remove Nth Node From End · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: CUT + 40, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.head, to: SIM[0].f, text: "head = 1 → 2 → 3 → 4 → 5, n = 2" }, { from: SIM[0].f, to: CUE.ret, text: "Send right n steps ahead, walk both to the end, then skip the node after left." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}. Time O(n), space O(1).` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "removeNth", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -1, -2, 1], seed: 19 }),
};
