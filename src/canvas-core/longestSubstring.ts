// LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS · duckcode, crayon, 9:16. Eight letter ducks; the window
// s[l..r] is a teal band on the water. r walks right; when s[r] was seen inside the window, l jumps past
// its last index. last_seen (the user's `mp`, renamed) is a row of cards. Everything comes from SIM.
import type { Ctx, Env, Gfx } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { drawCheck, drawMarker, drawTag, splash } from "./duck/fx";
import { C, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { checkBeats, stageBegin, stageEnd, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 3, TITLE = "Longest Substring Without Repeating Characters", SUB = "LeetCode 3  ·  Python";
const S = "abcabcbb", N = S.length, EXPECTED = 3;
const CODE = [
  `s = "${S}"`, "class Solution:", "    def lengthOfLongestSubstring(self, s: str) -> int:", "        last_seen = {}", "        l = 0", "        res = 0",
  "        for r in range(len(s)):", "            if s[r] in last_seen:", "                l = max(last_seen[s[r]] + 1, l)", "            last_seen[s[r]] = r",
  "            res = max(res, r - l + 1)", "        return res", "print(Solution().lengthOfLongestSubstring(s))",
];

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; l?: number; r?: number; res: number; seen: [string, number][]; note: string; sub?: string; hot?: string; dup?: boolean; win?: boolean };
export const SIM: Snap[] = (() => {
  const out: Snap[] = [], seen = new Map<string, number>(); let f = 150, l: number | undefined, r: number | undefined, res = 0, fast = false;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, l, r, res, seen: [...seen.entries()], note, ...x }); f += fast ? Math.max(15, Math.round(dur / 2 / 15) * 15) : dur; };
  at(3, "last_seen = {}", 45, { sub: "each letter → the last index it was seen at" });
  l = 0; at(4, "l = 0", 30, { sub: "the window starts at the left end" });
  at(5, "res = 0", 30, { sub: "the longest window so far" });
  for (r = 0; r < N; r++) {
    const ch = S[r]; fast = r === 4 || r === 5;
    at(6, `r = ${r}, s[r] = '${ch}'`, 30, { sub: "grow the window by one letter" });
    if (seen.has(ch)) {
      at(7, `'${ch}' in last_seen  →  True`, 45, { dup: true, hot: ch, sub: `seen before, at index ${seen.get(ch)}` });
      const was = l; l = Math.max(seen.get(ch)! + 1, l);
      at(8, `l = max(${seen.get(ch)} + 1, ${was}) = ${l}`, 60, { hot: ch, sub: l > was ? `l jumps past the old '${ch}'` : `the old '${ch}' is already outside the window` });
    } else at(7, `'${ch}' in last_seen  →  False`, 30, { sub: "a new letter: the window is still unique" });
    seen.set(ch, r); at(9, `last_seen['${ch}'] = ${r}`, 30, { hot: ch, sub: `remember where '${ch}' is now` });
    const len = r - l + 1, win = len > res; res = Math.max(res, len);
    at(10, `res = max(${win ? res - (res - out[out.length - 1].res) : res}, ${r} - ${l} + 1) = ${res}`, 45, { win, sub: `window "${S.slice(l, r + 1)}" has length ${len}${win ? ": a new best!" : ""}` });
  }
  r = undefined; l = undefined; fast = false;
  if (res !== EXPECTED) throw new Error(`longestSubstring: simulation gives ${res}`);
  at(11, `return ${res}`, 30, { sub: `the longest window was "abc"` });
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 21, 27, 33, 39, 45, 51, 57], s: 60, call: 90, def: 120, tags: 30, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.s, 0], [CUE.call, 12], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 12]];
checkBeats("longestSubstring", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`longestSubstring: gap before ${RUN[k][0]}`);
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "l", x.l === undefined ? "-" : String(x.l)], [x.f, "r", x.r === undefined ? "-" : String(x.r)], [x.f, "res", String(x.res)]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 715, DUCK_K = 0.56, SX = (d: number) => 102 + d * 125, TAG_Y = 900, MARK_Y = 876, NOTE_Y = 515, DICT_Y = 1035, RES_Y = 1150;
const PANEL = { x: 46, y: 1250, w: 988, size: 23, lh: 34, pad: 18, file: "longest_substring.py" };
const KEYS = [...new Set(S)], KX = (k: number) => 440 + k * 210;

// ---------------------------------------------------------------- motion
const DUPS = SIM.filter((x) => x.line === 8), WINS = SIM.filter((x) => x.win);
const HOPS: [number, number, number][] = [...SIM.filter((x) => x.line === 6).map((x) => [x.r!, x.f + 4, 36] as [number, number, number]),
  ...S.split("").flatMap((_, d) => [[d, CUE.party + d * 4, 50], [d, CUE.party + 60 + d * 4, 30]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.filter((_, d) => d % 2 === 0).map((f, k) => [f + 2, k * 2] as [number, number]), ...DUPS.map((x) => [x.f + 6, x.r!] as [number, number]), [CUE.party + 2, 0], [CUE.party + 8, 2]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.1); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && s.r === d && (s.dup || s.line === 8)) eye = "wide";
  else if (s && f < CUE.ret && s.hot === S[d] && s.r !== d && (s.line === 7 || s.line === 8)) eye = "worried";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: SX(d), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.1 + 1), eye, look: 0.4, label: S[d], seed: 3000 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
const entrySprite = (env: Env, ch: string, v: number, hot: boolean) => sprite(env, `ls:${ch}:${v}:${hot}`, 210, 90, 105, 45, (g) => {
  const col = hot ? "#c9b45a" : "#e8dfca";
  wax(g, () => crayonShape(g, roundRect(-92, -32, 184, 64, 14, 4), { col, shade: darker(col, 0.25), seed: 3700 + (hot ? 1 : 0), lw: 2.4, gap: 4.2, w: 4.4 }));
  text(g, `'${ch}': ${v}`, 0, 2, { size: 32, weight: 700, fill: C.ink });
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : undefined;
  // the window band s[l..r] on the water, gliding as l and r move
  if (s && s.l !== undefined && s.r !== undefined) {
    const prev = SIM[SIM.indexOf(s) - 1] ?? s, t = ease.inOut(prog(f, s.f, 12));
    const pl = prev.l ?? s.l, pr = prev.r ?? s.r ?? s.l, x0 = lerp(SX(pl), SX(s.l), t) - 58, x1 = lerp(SX(pr), SX(s.r), t) + 58, q = prog(f, SIM.find((x) => x.r !== undefined)!.f, 12);
    g.group("plain", () => { const c = g.cur, wob = 3 * Math.sin(f * 0.12); c.save(); c.globalAlpha = 0.22 * q; c.fillStyle = C.teal; c.beginPath(); c.roundRect(x0, 596 + wob, x1 - x0, 172, 28); c.fill(); c.globalAlpha = 0.8 * q; c.strokeStyle = darker(C.teal, 0.2); c.lineWidth = 5; c.stroke(); c.restore(); g.touch(x0 - 6, 586, x1 + 6, 780); });
  }
  for (let d = 0; d < N; d++) { const q = ease.spring(prog(f, CUE.tags + d * 3, 14)); if (q > 0) drawTag(ctx, env, SX(d), TAG_Y + 3.5 * Math.sin(f * 0.1 + d * 0.7), String(d), q, s?.l !== undefined && s.r !== undefined && d >= s.l && d <= s.r ? 1 : 0); }
  S.split("").forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, SX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.6));
  // l and r markers on the index tags
  if (s && s.l !== undefined && f < CUE.ret) {
    const prev = SIM[SIM.indexOf(s) - 1] ?? s, t = ease.inOut(prog(f, s.f, 12));
    for (const [name, a, b] of [["l", prev.l, s.l], ["r", prev.r, s.r]] as [string, number | undefined, number | undefined][]) {
      if (b === undefined) continue;
      const side = s.l === s.r ? (name === "l" ? -27 : 27) : 0, from = a ?? b;
      drawMarker(ctx, env, lerp(SX(from), SX(b), t) + side, MARK_Y + 4 * Math.sin(f * 0.16 + (name === "r" ? 2 : 0)), name, 0.85 * (a === undefined ? ease.back(prog(f, s.f, 10)) : 1));
    }
  }
  // last_seen: one card per letter; the card being read or written glows
  const dq = prog(f, SIM[0].f, 10) * (1 - prog(f, CUE.print - 10, 10));
  if (dq > 0) g.group("plain", () => { text(g, "last_seen", 185, DICT_Y, { size: 30, weight: 700, fill: C.ink, alpha: dq }); text(g, `res = ${(s ?? SIM[SIM.length - 1]).res}`, 540, RES_Y, { size: 40, weight: 700, fill: C.ink, alpha: dq }); });
  if (s?.win) drawCheck(ctx, env, 680, RES_Y - 4, ease.back(prog(f, s.f + 8, 10)) * 0.6);
  const seen = (s ?? SIM[SIM.length - 1]).seen;
  if (f < CUE.print) seen.forEach(([ch, v]) => { const k = KEYS.indexOf(ch), born = SIM.find((x) => x.seen.some(([c]) => c === ch))!.f, q = ease.back(prog(f, born, 12)) * (1 - prog(f, CUE.print - 10, 10)); const hot = s?.hot === ch; blit(ctx, env, entrySprite(env, ch, v, hot), KX(k), DICT_Y + 3 * Math.sin(f * 0.1 + k) - (hot ? 6 * Math.sin(Math.PI * prog(f, s!.f, 16)) : 0), q, q); });
  const note = f >= CUE.ret && f < CUE.print ? SIM[SIM.length - 1] : s;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(90, NOTE_Y - 34, 900, h, 20); c.fill(); c.restore(); g.touch(90, NOTE_Y - 34, 990, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 30 ? 32 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: 26, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "the function returns", value: String(EXPECTED), time: ["O(n)", "r and l each move right only"], space: ["O(m)", "m = distinct characters in s"], y: 520 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["s = ", C.ink], [`"${S}"`, C.rose]], from: CUE.s, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.s, ret: CUE.ret, print: CUE.print, output: String(EXPECTED) });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -2 : 0 } as SfxCue)),
  { frame: CUE.s + 2, kind: "pop", variant: "tiny", label: "s" },
  ...SIM.flatMap((x, k): SfxCue[] => x.win ? [{ frame: x.f + 8, kind: "chime", variant: "sparkle", label: `new best (${k})`, gainDb: 2 }]
    : x.line === 8 ? [{ frame: x.f + 4, kind: "whoosh", variant: "soft", dir: 1, label: `l jumps (${k})` }]
    : x.line === 6 ? [{ frame: x.f + 2, kind: "tick", variant: "soft", label: `r steps (${k})`, gainDb: 5 }]
    : x.line === 9 ? [{ frame: x.f + 4, kind: "pop", variant: "tiny", label: `last_seen write (${k})`, gainDb: 3 }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "bell", label: "return" },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const longestSubstring: Film = {
  meta: { title: `Longest Substring · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: DUPS[0].f + 20, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.s, to: SIM[0].f, text: `s = "${S}"` }, { from: SIM[0].f, to: CUE.ret, text: "Grow the window with r; on a repeat, jump l past the letter's last index." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}. Time O(n), space O(m).` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "longestSubstring", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -2, 1, -1, 3, -3, 0], seed: 3 }),
};
