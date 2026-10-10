// LINKED LIST CYCLE · duckcode, crayon, 9:16. Four duck nodes; the tail's `next` curves back under the row
// to node 1 (pos = 1). slow (one hop) and fast (two hops, travelling through the node in between) walk the
// list until fast laps round and lands on slow. Everything on screen comes from SIM.
import type { Ctx, Env, Gfx, P } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { drawMarker, splash, waterRing } from "./duck/fx";
import { C } from "./duck/crayon";
import { FONTS, ease, prog, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { nextArrow } from "./duck/list";
import { checkBeats, stageBegin, stageEnd, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 141, TITLE = "Linked List Cycle", SUB = "LeetCode 141  ·  Python";
const VALS = [3, 2, 0, -4], POS = 1, N = VALS.length, EXPECTED = true;
const NEXT = VALS.map((_, i) => (i + 1 < N ? i + 1 : POS));
const CODE = [
  "head = [3, 2, 0, -4]  # the tail links back to index 1", "class Solution:", "    def hasCycle(self, head: Optional[ListNode]) -> bool:", "        slow, fast = head, head",
  "        while fast and fast.next:", "            slow = slow.next", "            fast = fast.next.next", "            if slow == fast:", "                return True", "        return False", "print(Solution().hasCycle(head))",
];

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; slow?: number; fast?: number; path?: number[]; who?: "slow" | "fast"; note: string; sub?: string; meet?: boolean };
export const SIM: Snap[] = (() => {
  const out: Snap[] = []; let f = 135, slow: number | undefined, fast: number | undefined, result = false;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, slow, fast, note, ...x }); f += dur; };
  slow = 0; fast = 0; at(3, "slow, fast = head, head", 45, { sub: "both start on the first duck" });
  for (;;) {
    const ok = fast !== undefined && NEXT[fast] !== undefined; // no None in this list: there is always a next
    at(4, `while fast and fast.next:  ${ok ? "yes" : "no"}`, 30, { sub: "fast still has somewhere to go" });
    if (!ok) break;
    const s0 = slow; slow = NEXT[slow]; at(5, `slow = slow.next  →  ${VALS[slow]}`, 60, { who: "slow", path: [s0, slow], sub: "slow moves one duck" });
    const f0: number = fast, mid: number = NEXT[fast]; fast = NEXT[mid]; at(6, `fast = fast.next.next  →  ${VALS[fast]}`, 75, { who: "fast", path: [f0, mid, fast], sub: `fast moves two ducks: ${VALS[f0]} → ${VALS[mid]} → ${VALS[fast]}` });
    const meet = slow === fast;
    at(7, `slow == fast ?   ${meet ? "Yes" : "No"}`, 60, { meet, sub: meet ? "they landed on the same duck" : `slow is on ${VALS[slow]}, fast is on ${VALS[fast]}` });
    if (meet) { result = true; at(8, "return True", 30, { meet, sub: "fast lapped the loop and caught slow: there is a cycle" }); break; }
  }
  if (result !== EXPECTED) throw new Error("listCycle: simulation disagrees");
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 25, 35, 45], head: 60, call: 90, def: 120, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.head, 0], [CUE.call, 10], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 10]];
checkBeats("listCycle", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`listCycle: gap before ${RUN[k][0]}`);
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "slow", x.slow === undefined ? "-" : String(VALS[x.slow])], [x.f, "fast", x.fast === undefined ? "-" : String(VALS[x.fast])]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 820, DUCK_K = 0.75, NX = (i: number) => 200 + i * 227, ARROW_Y = DUCK_Y + 62, MARK_Y = DUCK_Y - 150, NOTE_Y = 500;
const PANEL = { x: 46, y: 1328, w: 988, size: 23, lh: 34, pad: 18, file: "linked_list_cycle.py" };
const COLS: Record<string, string> = { slow: C.teal, fast: C.rose };
// where a pointer is at frame f: walk its path (node to node) over the step's first 30 frames
const along = (path: number[], t: number) => { const seg = Math.min(path.length - 2, Math.floor(t * (path.length - 1))), u = t * (path.length - 1) - seg; return lerp(NX(path[seg]), NX(path[seg + 1]), ease.inOut(Math.min(1, u))); };
const markX = (who: "slow" | "fast", f: number) => {
  const s = snapAt(f); if (!s) return undefined;
  const step = [...SIM].reverse().find((x) => x.f <= f && x.who === who);
  const node = who === "slow" ? s.slow : s.fast; if (node === undefined) return undefined;
  if (step && f < step.f + 36) return along(step.path!, prog(f, step.f + 4, 30));
  return NX(node);
};

// ---------------------------------------------------------------- motion
const STEPS = SIM.filter((x) => x.who);
const HOPS: [number, number, number][] = [...STEPS.map((x) => [x.path![x.path!.length - 1], x.f + 30, 34] as [number, number, number]), [3, CUE.ret + 4, 60],
  ...VALS.flatMap((_, d) => [[d, CUE.party + d * 5, 30], [d, CUE.party + 60 + d * 5, 20]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), ...STEPS.filter((x) => x.who === "fast").map((x) => [x.f + 32, x.path![2]] as [number, number]), [CUE.ret + 6, 3], [CUE.party + 2, 0]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.3); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && s.line === 7 && (s.slow === d || s.fast === d)) eye = s.meet ? "wide" : "open";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: NX(d), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.3 + 1), eye, look: 0.4, label: String(VALS[d]), seed: 14100 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : undefined;
  if (f >= CUE.ret) waterRing(g, NX(3), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret, 8)), 1460);
  else if (s) { if (s.slow !== undefined) waterRing(g, NX(s.slow), DUCK_Y + 12, DUCK_K, C.teal, 1, 1440 + s.slow); if (s.fast !== undefined && s.fast !== s.slow) waterRing(g, NX(s.fast), DUCK_Y + 12, DUCK_K, C.rose, 1, 1450 + s.fast); }
  // next arrows; the tail's arrow dives under the row and comes back up at node 1
  for (let i = 0; i < N; i++) {
    const q = prog(f, CUE.land[Math.max(i, NEXT[i])] + 10, 14); if (q <= 0) continue;
    const back = NEXT[i] < i, wob = 3 * Math.sin(f * 0.1 + i);
    nextArrow(g, [NX(i), ARROW_Y + wob], [NX(NEXT[i]), ARROW_Y + wob], q, back ? "#9a7a2a" : C.ink, back ? 0.42 : 0.1, back ? 30 : 46);
  }
  g.group("plain", () => text(g, "tail.next → index 1  (pos = 1)", (NX(POS) + NX(3)) / 2, ARROW_Y + 150 + 3 * Math.sin(f * 0.1), { size: 26, weight: 700, fill: "#7a6224", alpha: prog(f, 60, 12) }));
  VALS.forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, NX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.75));
  // slow and fast markers over the ducks (side by side when they share one)
  if (s && f < CUE.ret) {
    const xs = markX("slow", f), xf = markX("fast", f), same = xs !== undefined && xf !== undefined && Math.abs(xs - xf) < 30;
    if (xs !== undefined) drawMarker(ctx, env, xs - (same ? 50 : 0), MARK_Y + 4 * Math.sin(f * 0.16), "slow", 0.85 * ease.back(prog(f, SIM[0].f, 10)), C.teal);
    if (xf !== undefined) drawMarker(ctx, env, xf + (same ? 50 : 0), MARK_Y + 4 * Math.sin(f * 0.16 + 2), "fast", 0.85 * ease.back(prog(f, SIM[0].f, 10)), C.rose);
  }
  const note = f >= CUE.ret && f < CUE.print ? SIM[SIM.length - 1] : s;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(70, NOTE_Y - 34, 940, h, 20); c.fill(); c.restore(); g.touch(70, NOTE_Y - 34, 1010, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 34 ? 30 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: note.sub.length > 50 ? 23 : 26, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "hasCycle returns", value: "True", time: ["O(n)", "fast catches slow within a lap"], space: ["O(1)", "just two pointers"], y: 520 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["head = ", C.ink], ["[3, 2, 0, -4]", C.rose], [",  pos = ", C.ink], ["1", C.rose]], from: CUE.head, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.head, ret: CUE.ret, print: CUE.print, output: "True" });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -1 : 1 } as SfxCue)),
  { frame: CUE.head + 2, kind: "pop", variant: "tiny", label: "head" },
  ...SIM.flatMap((x, k): SfxCue[] => x.who === "slow" ? [{ frame: x.f + 6, kind: "swish", variant: "soft", label: `slow (${k})` }]
    : x.who === "fast" ? [{ frame: x.f + 6, kind: "whoosh", variant: "soft", dir: 1, label: `fast (${k})` }]
    : x.line === 7 ? [{ frame: x.f + 8, kind: x.meet ? "chime" : "tick", variant: x.meet ? "sparkle" : "soft", label: `compare (${k})`, gainDb: x.meet ? 2 : 5 }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "bell", label: "return" },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const listCycle: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: STEPS[3].f + 30, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.head, to: SIM[0].f, text: "head = [3, 2, 0, -4], the tail links back to index 1" }, { from: SIM[0].f, to: CUE.ret, text: "slow moves one step, fast two; in a loop, fast must land on slow." }, { from: CUE.ret, to: DURATION, text: "Output: True. Time O(n), space O(1)." }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "listCycle", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -2, -4], seed: 141 }),
};
