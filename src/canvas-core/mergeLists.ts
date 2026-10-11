// MERGE TWO SORTED LISTS · duckcode, crayon, 9:16. list1 and list2 are two rows of duck nodes; the merged
// list grows in a third row from a `dummy` plaque. Arrows are the real `next` pointers at every step (so a
// re-aimed tail.next swings across rows); list1 / list2 / tail are coloured rings with name pills.
// Everything on screen comes from SIM, a simulation of the user's code.
import type { Ctx, Env, Gfx, P } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { splash, waterRing } from "./duck/fx";
import { C, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { drawNone, nextArrow } from "./duck/list";
import { checkBeats, stageBegin, stageEnd, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 21, TITLE = "Merge Two Sorted Lists", SUB = "LeetCode 21  ·  Python";
const L1 = [1, 2, 4], L2 = [1, 3, 4], EXPECTED = "[1, 1, 2, 3, 4, 4]";
const CODE = [
  "list1 = [1, 2, 4]  # linked lists", "list2 = [1, 3, 4]", "class Solution:", "    def mergeTwoLists(", "        self, list1: Optional[ListNode], list2: Optional[ListNode]", "    ) -> Optional[ListNode]:",
  "        dummy = ListNode()", "        tail = dummy", "        while list1 and list2:", "            if list1.val < list2.val:", "                tail.next = list1", "                list1 = list1.next",
  "                tail = tail.next", "            else:", "                tail.next = list2", "                list2 = list2.next", "                tail = tail.next",
  "        if list1:", "            tail.next = list1", "        if list2:", "            tail.next = list2", "        return dummy.next", "print(Solution().mergeTwoLists(list1, list2))",
];
// nodes 0-2 are list1, 3-5 list2, 6 is dummy; NONE = -1
const NONE = -1, DUMMY = 6, VAL = [...L1, ...L2, 0], ROW = [0, 0, 0, 1, 1, 1, 2];
const nm = (i: number) => (i === NONE ? "None" : i === DUMMY ? "dummy" : `${VAL[i]} (${i < 3 ? "list1" : "list2"})`);

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; l1: number; l2: number; tail?: number; next: number[]; joined: number[]; note: string; sub?: string; hot?: number };
export const SIM: Snap[] = (() => {
  const out: Snap[] = [], next = [1, 2, NONE, 4, 5, NONE, NONE], joined: number[] = [];
  let f = 135, l1 = 0, l2 = 3, tail: number | undefined;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, l1, l2, tail, next: [...next], joined: [...joined], note, ...x }); f += dur; };
  at(6, "dummy = ListNode()", 45, { sub: "a fake head, so the merged list has somewhere to start" });
  tail = DUMMY; at(7, "tail = dummy", 30, { sub: "tail is the last node of the merged list" });
  for (;;) {
    const go = l1 !== NONE && l2 !== NONE;
    at(8, `while list1 and list2:  ${go ? "both left" : `${l1 === NONE ? "list1" : "list2"} is empty`}`, 30);
    if (!go) break;
    const one = VAL[l1] < VAL[l2];
    at(9, `list1.val = ${VAL[l1]}  <  list2.val = ${VAL[l2]} ?   ${one ? "Yes" : "No"}`, 60, { sub: one ? "list1's duck is smaller: take it" : VAL[l1] === VAL[l2] ? "a tie goes to list2 (the else branch)" : "list2's duck is smaller: take it" });
    const pick = one ? l1 : l2, base = one ? 10 : 14;
    next[tail] = pick; at(base, `tail.next = ${one ? "list1" : "list2"}  →  ${nm(pick)}`, 45, { hot: tail, sub: "hook it on after tail" });
    if (one) l1 = next[l1]; else l2 = next[l2];
    at(base + 1, `${one ? "list1 = list1.next" : "list2 = list2.next"}  →  ${nm(one ? l1 : l2)}`, 45, { sub: "that list moves on to its next duck" });
    tail = next[tail]; joined.push(pick); at(base + 2, `tail = tail.next  →  ${nm(tail)}`, 45, { sub: "the merged list is one duck longer" });
  }
  at(17, `if list1:  ${l1 === NONE ? "None" : nm(l1)}`, 30, { sub: l1 === NONE ? "" : "list1 still has ducks left" });
  if (l1 !== NONE) { next[tail!] = l1; for (let i = l1; i !== NONE; i = next[i]) joined.push(i); at(18, `tail.next = list1  →  ${nm(l1)}`, 45, { hot: tail, sub: "attach the rest of list1 in one go" }); }
  at(19, `if list2:  ${l2 === NONE ? "None" : nm(l2)}`, 30, { sub: l2 === NONE ? "nothing left in list2" : "" });
  if (l2 !== NONE) { next[tail!] = l2; for (let i = l2; i !== NONE; i = next[i]) joined.push(i); at(20, `tail.next = list2  →  ${nm(l2)}`, 45, { hot: tail }); }
  const res: number[] = []; for (let i = next[DUMMY]; i !== NONE; i = next[i]) res.push(VAL[i]);
  if (`[${res.join(", ")}]` !== EXPECTED) throw new Error(`mergeLists: simulation gives ${res}`);
  at(21, "return dummy.next", 30, { sub: "skip the fake head: 1 → 1 → 2 → 3 → 4 → 4" });
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 21, 27, 33, 39, 45], l1: 45, l2: 60, call: 90, def: 120, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.l1, 0], [CUE.l2, 1], [CUE.call, 22], [CUE.def, 3], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 22]];
checkBeats("mergeLists", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`mergeLists: gap before ${RUN[k][0]}`);
const sv = (i?: number) => (i === undefined ? "-" : i === NONE ? "None" : i === DUMMY ? "dummy" : String(VAL[i]));
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "list1", sv(x.l1)], [x.f, "list2", sv(x.l2)], [x.f, "tail", sv(x.tail)]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const ROW_Y = [660, 815, 970], DUCK_K = 0.55, RX = (k: number) => 330 + k * 240, SLOT = (k: number) => 250 + k * 148, DUMMY_X = 110, NOTE_Y = 500;
const PANEL = { x: 46, y: 1081, w: 988, size: 20, lh: 27, pad: 18, file: "merge_lists.py" };
const PCOL: Record<string, string> = { list1: C.rose, list2: C.teal, tail: C.gold };
// when each node swims into the merged row, and its slot there
const JOIN = new Map<number, [number, number]>();
SIM.forEach((x) => x.joined.forEach((n, k) => { if (!JOIN.has(n)) JOIN.set(n, [x.f, k]); }));
const home = (n: number): P => (n === DUMMY ? [DUMMY_X, ROW_Y[2]] : [RX(n % 3), ROW_Y[ROW[n]]]);
const pos = (n: number, f: number): P => {
  const j = JOIN.get(n), sway = n === DUMMY ? 0 : 6 * Math.sin(f * 0.07 + n * 1.9); if (!j || n === DUMMY) { const h = home(n); return [h[0] + sway, h[1]]; }
  const t = ease.inOut(prog(f, j[0] + 4, 30)), a = home(n), b: P = [SLOT(j[1]), ROW_Y[2]];
  return [lerp(a[0], b[0], t) + sway, lerp(a[1], b[1], t) - 50 * Math.sin(Math.PI * t)];
};

// ---------------------------------------------------------------- motion
const HOTS = SIM.filter((x) => x.hot !== undefined);
const HOPS: [number, number, number][] = [...[...JOIN.entries()].map(([n, [f0]]) => [n, f0 + 34, 30] as [number, number, number]),
  ...[0, 1, 2, 3, 4, 5].flatMap((d) => [[d, CUE.ret + 4 + d * 8, 26], [d, CUE.party + d * 4, 26], [d, CUE.party + 60 + d * 4, 18]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), ...[...JOIN.entries()].map(([n, [f0]]) => [f0 + 36, n] as [number, number]), [CUE.party + 2, 0], [CUE.party + 8, 3]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), [x, y] = pos(d, f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.3); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && s.line === 9 && (s.l1 === d || s.l2 === d)) eye = "wide";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x, y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.3 + 1), eye, look: 0.4, label: String(VAL[d]), seed: (d < 3 ? 2100 : 2150) + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
const pill = (env: Env, name: string) => sprite(env, `mlpill:${name}`, 120, 50, 60, 25, (g) => {
  const col = PCOL[name], w = 26 + name.length * 15;
  wax(g, () => crayonShape(g, roundRect(-w / 2, -17, w, 34, 12, 4), { col, shade: darker(col, 0.3), seed: 2190, lw: 2, gap: 3.6, w: 4 }));
  text(g, name, 0, 1, { size: 24, weight: 700, fill: "#f6f0e2", stroke: darker(col, 0.45), sw: 3 });
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : SIM[SIM.length - 1];
  const before = (s && SIM[SIM.indexOf(s) - 1]) ?? s, t = s ? ease.inOut(prog(f, s.f, 14)) : 1;
  // rings under the pointed-at nodes
  const at = (n: number | undefined): P | undefined => (n === undefined || n === NONE ? undefined : pos(n, f));
  if (s && f < CUE.ret) (["list1", "list2", "tail"] as const).forEach((name) => { const n = name === "list1" ? s.l1 : name === "list2" ? s.l2 : s.tail, p = at(n); if (p && n !== DUMMY) waterRing(g, p[0], p[1] + 8, DUCK_K, PCOL[name], ease.out(prog(f, s.f, 8)), 2170 + (n ?? 0)); });
  if (f >= CUE.ret) [0, 1, 2, 3, 4, 5].forEach((d) => { const p = pos(d, f); waterRing(g, p[0], p[1] + 8, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + d * 4, 8)), 2180 + d); });
  drawNone(ctx, env, DUMMY_X, ROW_Y[2] + 4 + 3 * Math.sin(f * 0.1), ease.back(prog(f, SIM[0].f + 4, 12)), "dummy");
  // next arrows: every node's real pointer, from wherever the two ducks are now
  const nx = s?.next ?? [1, 2, NONE, 4, 5, NONE, NONE];
  for (let n = 0; n < 7; n++) {
    const m = nx[n]; if (m === NONE) continue;
    const q = n === DUMMY ? prog(f, s!.f, 12) : prog(f, CUE.land[Math.max(n, m)] + 10, 12); if (q <= 0) continue;
    const a = pos(n, f), b = pos(m, f), hot = s?.hot === n && f < CUE.ret;
    const was = hot && before && before.next[n] !== NONE ? pos(before.next[n], f) : b, end: P = hot ? [lerp(was[0], b[0], t), lerp(was[1], b[1], t)] : b;
    nextArrow(g, [a[0] + (n === DUMMY ? 40 : 0), a[1] + 26], [end[0], end[1] + 26], q, hot ? "#9a7a2a" : C.ink, a[1] === b[1] ? 0.1 : 0, 40);
  }
  for (const d of [0, 1, 2, 3, 4, 5]) if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f);
  CUE.land.forEach((l, d) => splash(g, RX(d % 3), ROW_Y[ROW[d]] + 8, (f - l) / 18, 1100 + d, 0.5));
  // name pills under the pointed-at nodes (None: parked at the end of the row)
  if (s && f < CUE.ret) (["list1", "list2", "tail"] as const).forEach((name) => {
    const pt = (x: Snap | undefined): P | undefined => { if (!x) return undefined; const n = name === "list1" ? x.l1 : name === "list2" ? x.l2 : x.tail; if (n === undefined) return undefined; if (n === NONE) return [RX(2) + 30, ROW_Y[name === "list1" ? 0 : 1] + 10]; const p = pos(n, f); return name === "tail" ? [p[0], p[1] + 58] : [p[0] - 108, p[1] + 10]; };
    const now = pt(s), was = pt(before) ?? now; if (!now) return;
    const p: P = [lerp(was![0], now[0], t), lerp(was![1], now[1], t) + 5 * Math.sin(f * 0.16 + name.length)];
    blit(ctx, env, pill(env, name), p[0], p[1], 1, 1);
    const n = name === "list1" ? s.l1 : name === "list2" ? s.l2 : s.tail;
    if (n === NONE) g.group("plain", () => text(g, "= None", p[0] + 95, p[1], { size: 22, weight: 700, fill: C.inkSoft }));
  });
  const note = f >= CUE.ret && f < CUE.print ? SIM[SIM.length - 1] : f < CUE.ret ? s : undefined;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 100 : 60; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(70, NOTE_Y - 32, 940, h, 20); c.fill(); c.restore(); g.touch(70, NOTE_Y - 32, 1010, NOTE_Y - 32 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 34 ? 30 : 34, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 40, { size: note.sub.length > 50 ? 22 : 25, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "the merged list", value: EXPECTED, time: ["O(n + m)", "each duck is linked once"], space: ["O(1)", "nodes are re-linked, not copied"], y: 505 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["list1 = ", C.ink], ["1 → 2 → 4", C.rose], ["   list2 = ", C.ink], ["1 → 3 → 4", C.teal]], from: CUE.l1, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.l1, ret: CUE.ret, print: CUE.print, output: EXPECTED });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -2 : 0 } as SfxCue)),
  { frame: CUE.l1 + 2, kind: "pop", variant: "tiny", label: "list1" }, { frame: CUE.l2 + 2, kind: "pop", variant: "tiny", label: "list2" },
  ...SIM.flatMap((x, k): SfxCue[] => x.hot !== undefined ? [{ frame: x.f + 6, kind: "swish", variant: "soft", label: `link (${k})` }]
    : x.line === 9 ? [{ frame: x.f + 8, kind: "tick", variant: "soft", label: `compare (${k})`, gainDb: 5 }]
    : x.line === 12 || x.line === 16 ? [{ frame: x.f + 34, kind: "bubble", variant: "splash", label: `joins (${k})`, gainDb: -2 }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "sparkle", label: "return", gainDb: 2 },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const mergeLists: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: HOTS[2].f + 30, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.l1, to: SIM[0].f, text: "list1 = 1 → 2 → 4, list2 = 1 → 3 → 4" }, { from: SIM[0].f, to: CUE.ret, text: "Hook the smaller front duck onto tail, then attach whatever is left." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}. Time O(n + m), space O(1).` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "mergeLists", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -2, 1, -1, -4], seed: 21 }),
};
