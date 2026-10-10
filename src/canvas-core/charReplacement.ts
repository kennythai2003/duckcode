// LONGEST REPEATING CHARACTER REPLACEMENT · duckcode, crayon, 9:16. Letter ducks; the window s[l..r] is a
// teal band. count is a row of cards; the ducks that would have to be replaced (not the most frequent
// letter) get rose rings, and the check (window - maxf) > k decides if l must move. Everything from SIM.
import type { Ctx, Env, Gfx } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { drawMarker, drawTag, splash, waterRing } from "./duck/fx";
import { C, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { checkBeats, stageBegin, stageEnd, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 424, TITLE = "Longest Repeating Character Replacement", SUB = "LeetCode 424  ·  Python";
const S = "ABAB", K = 2, N = S.length, EXPECTED = 4;
const CODE = [
  `s = "${S}"`, `k = ${K}`, "class Solution:", "    def characterReplacement(self, s: str, k: int) -> int:", "        count = {}", "        res = 0", "        l = 0", "        maxf = 0",
  "        for r in range(len(s)):", "            count[s[r]] = 1 + count.get(s[r], 0)", "            maxf = max(maxf, count[s[r]])", "            while (r - l + 1) - maxf > k:",
  "                count[s[l]] -= 1", "                l += 1", "            res = max(res, r - l + 1)", "        return res", "print(Solution().characterReplacement(s, k))",
];

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; l?: number; r?: number; res: number; maxf: number; count: [string, number][]; note: string; sub?: string; hot?: string; ok?: boolean; win?: boolean; swap?: number[] };
export const SIM: Snap[] = (() => {
  const out: Snap[] = [], count = new Map<string, number>(); let f = 150, l: number | undefined, r: number | undefined, res = 0, maxf = 0;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, l, r, res, maxf, count: [...count.entries()], note, ...x }); f += dur; };
  // the ducks in the window that are not the most frequent letter: the ones k would replace
  const swaps = () => { const top = [...count.entries()].find(([, v]) => v === maxf)?.[0]; const o: number[] = []; for (let i = l!; i <= r!; i++) if (S[i] !== top) o.push(i); return o; };
  at(4, "count = {}", 30, { sub: "how many of each letter are in the window" });
  at(5, "res = 0", 30, { sub: "the longest valid window so far" });
  l = 0; at(6, "l = 0", 30, { sub: "the window starts at the left end" });
  at(7, "maxf = 0", 30, { sub: "the count of the most frequent letter" });
  for (r = 0; r < N; r++) {
    const ch = S[r];
    at(8, `r = ${r}, s[r] = '${ch}'`, 30, { sub: "grow the window by one letter" });
    const was = count.get(ch) ?? 0; count.set(ch, 1 + was);
    at(9, `count['${ch}'] = 1 + ${was} = ${was + 1}`, 45, { hot: ch, sub: `the window has ${was + 1} '${ch}'${was ? "s" : ""}` });
    const pm = maxf; maxf = Math.max(maxf, count.get(ch)!);
    at(10, `maxf = max(${pm}, ${count.get(ch)}) = ${maxf}`, 45, { sub: maxf > pm ? "the most frequent letter got more common" : "no change" });
    for (;;) {
      const len = r - l + 1, need = len - maxf, ok = !(need > K);
      at(11, `(${r} - ${l} + 1) - ${maxf} = ${need}  >  k = ${K} ?   ${ok ? "No" : "Yes"}`, 60, { ok, swap: swaps(), sub: ok ? `${need} replacement${need === 1 ? "" : "s"} needed, k = ${K} allows it: keep l` : `${need} replacements, but k is only ${K}: shrink` });
      if (ok) break;
      count.set(S[l], count.get(S[l])! - 1); at(12, `count['${S[l]}'] -= 1`, 30, { hot: S[l] }); l += 1; at(13, `l = ${l}`, 30);
    }
    const len = r - l + 1, win = len > res; res = Math.max(res, len);
    at(14, `res = max(${win ? out[out.length - 1].res : res}, ${r} - ${l} + 1) = ${res}`, 45, { win, swap: swaps(), sub: `window "${S.slice(l, r + 1)}" has length ${len}${win ? ": a new best!" : ""}` });
  }
  if (res !== EXPECTED) throw new Error(`charReplacement: simulation gives ${res}`);
  r = undefined; l = undefined;
  at(15, `return ${res}`, 30, { sub: `replace both B's (k = ${K}) → "AAAA"` });
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 23, 30, 38], s: 45, k: 60, call: 90, def: 120, tags: 30, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.s, 0], [CUE.k, 1], [CUE.call, 16], [CUE.def, 3], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 16]];
checkBeats("charReplacement", RUN);
for (let i = 1; i < RUN.length; i++) if (RUN[i][0] - RUN[i - 1][0] > 90) throw new Error(`charReplacement: gap before ${RUN[i][0]}`);
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "l", x.l === undefined ? "-" : String(x.l)], [x.f, "r", x.r === undefined ? "-" : String(x.r)], [x.f, "maxf", String(x.maxf)], [x.f, "res", String(x.res)]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 730, DUCK_K = 0.8, DX = [195, 425, 655, 885], TAG_Y = 905, MARK_Y = 880, NOTE_Y = 515, DICT_Y = 1010, VAR_Y = 1105;
const PANEL = { x: 46, y: 1192, w: 988, size: 21, lh: 30, pad: 18, file: "char_replacement.py" };
const KEYS = [...new Set(S)], KX = (i: number) => 430 + i * 240;

// ---------------------------------------------------------------- motion
const WINS = SIM.filter((x) => x.win);
const HOPS: [number, number, number][] = [...SIM.filter((x) => x.line === 8).map((x) => [x.r!, x.f + 4, 40] as [number, number, number]),
  ...WINS.map((x) => [x.r!, x.f + 8, 60] as [number, number, number]),
  ...DX.flatMap((_, d) => [[d, CUE.party + d * 5, 34], [d, CUE.party + 60 + d * 5, 22]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), ...WINS.map((x) => [x.f + 10, x.r!] as [number, number]), [CUE.party + 2, 0], [CUE.party + 8, 3]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.5); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && s.swap?.includes(d)) eye = "worried"; else if (s && f < CUE.ret && s.win && s.r === d) eye = "wide";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: DX[d], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.5 + 1), eye, look: 0.4, label: S[d], seed: 4240 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
const entrySprite = (env: Env, ch: string, v: number, hot: boolean) => sprite(env, `cr:${ch}:${v}:${hot}`, 210, 90, 105, 45, (g) => {
  const col = hot ? "#c9b45a" : "#e8dfca";
  wax(g, () => crayonShape(g, roundRect(-92, -32, 184, 64, 14, 4), { col, shade: darker(col, 0.25), seed: 4700 + (hot ? 1 : 0), lw: 2.4, gap: 4.2, w: 4.4 }));
  text(g, `'${ch}': ${v}`, 0, 2, { size: 32, weight: 700, fill: C.ink });
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : undefined;
  if (s && s.l !== undefined && s.r !== undefined) {
    const prev = SIM[SIM.indexOf(s) - 1] ?? s, t = ease.inOut(prog(f, s.f, 12));
    const pl = prev.l ?? s.l, pr = prev.r ?? s.r, x0 = lerp(DX[pl], DX[s.l], t) - 105, x1 = lerp(DX[pr], DX[s.r], t) + 105, q = prog(f, SIM.find((x) => x.r !== undefined)!.f, 12);
    g.group("plain", () => { const c = g.cur, wob = 3 * Math.sin(f * 0.12); c.save(); c.globalAlpha = 0.22 * q; c.fillStyle = C.teal; c.beginPath(); c.roundRect(x0, 592 + wob, x1 - x0, 193, 30); c.fill(); c.globalAlpha = 0.8 * q; c.strokeStyle = darker(C.teal, 0.2); c.lineWidth = 5; c.stroke(); c.restore(); g.touch(x0 - 6, 570, x1 + 6, 795); });
  }
  // rose rings: the ducks k would replace
  if (s?.swap) s.swap.forEach((d) => waterRing(g, DX[d], DUCK_Y + 12, DUCK_K, C.rose, ease.out(prog(f, s.f, 10)), 4500 + d));
  if (f >= CUE.ret) DX.forEach((x, d) => waterRing(g, x, DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + d * 5, 8)), 4560 + d));
  for (let d = 0; d < N; d++) { const q = ease.spring(prog(f, CUE.tags + d * 4, 14)); if (q > 0) drawTag(ctx, env, DX[d], TAG_Y + 3.5 * Math.sin(f * 0.1 + d * 0.7), String(d), q, s?.l !== undefined && s.r !== undefined && d >= s.l && d <= s.r ? 1 : 0); }
  DX.forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, DX[d], DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.8));
  if (s && s.l !== undefined && f < CUE.ret) {
    const prev = SIM[SIM.indexOf(s) - 1] ?? s, t = ease.inOut(prog(f, s.f, 12));
    for (const [name, a, b] of [["l", prev.l, s.l], ["r", prev.r, s.r]] as [string, number | undefined, number | undefined][]) {
      if (b === undefined) continue;
      const side = s.l === s.r ? (name === "l" ? -27 : 27) : 0, from = a ?? b;
      drawMarker(ctx, env, lerp(DX[from], DX[b], t) + side, MARK_Y + 4 * Math.sin(f * 0.16 + (name === "r" ? 2 : 0)), name, 0.9 * (a === undefined ? ease.back(prog(f, s.f, 10)) : 1));
    }
  }
  // count cards and the carried values
  const last = s ?? SIM[SIM.length - 1], dq = prog(f, SIM[0].f, 10) * (1 - prog(f, CUE.print - 10, 10));
  if (dq > 0) g.group("plain", () => { text(g, "count", 170, DICT_Y, { size: 32, weight: 700, fill: C.ink, alpha: dq }); text(g, `maxf = ${last.maxf}      res = ${last.res}      k = ${K}`, 540, VAR_Y, { size: 36, weight: 700, fill: C.ink, alpha: dq }); });
  if (f < CUE.print) last.count.forEach(([ch, v]) => { const i = KEYS.indexOf(ch), born = SIM.find((x) => x.count.some(([c]) => c === ch))!.f, q = ease.back(prog(f, born, 12)) * (1 - prog(f, CUE.print - 10, 10)), hot = s?.hot === ch; blit(ctx, env, entrySprite(env, ch, v, hot), KX(i), DICT_Y + 3 * Math.sin(f * 0.1 + i) - (hot ? 6 * Math.sin(Math.PI * prog(f, s!.f, 16)) : 0), q, q); });
  const note = f >= CUE.ret && f < CUE.print ? SIM[SIM.length - 1] : s;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(70, NOTE_Y - 34, 940, h, 20); c.fill(); c.restore(); g.touch(70, NOTE_Y - 34, 1010, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 30 ? 32 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: note.sub.length > 50 ? 23 : 26, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "the function returns", value: String(EXPECTED), time: ["O(n)", "r and l each move right only"], space: ["O(m)", "m = distinct letters (≤ 26)"], y: 515 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["s = ", C.ink], [`"${S}"`, C.rose], [",  k = ", C.ink], [String(K), C.rose]], from: CUE.s, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.s, ret: CUE.ret, print: CUE.print, output: String(EXPECTED) });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -1 : 1 } as SfxCue)),
  { frame: CUE.s + 2, kind: "pop", variant: "tiny", label: "s" }, { frame: CUE.k + 2, kind: "pop", variant: "tiny", label: "k" },
  ...SIM.flatMap((x, i): SfxCue[] => x.win ? [{ frame: x.f + 8, kind: "chime", variant: "sparkle", label: `new best (${i})`, gainDb: 2 }]
    : x.line === 8 ? [{ frame: x.f + 2, kind: "tick", variant: "soft", label: `r steps (${i})`, gainDb: 5 }]
    : x.line === 9 ? [{ frame: x.f + 4, kind: "pop", variant: "tiny", label: `count (${i})`, gainDb: 3 }]
    : x.line === 11 ? [{ frame: x.f + 10, kind: "pop", variant: "cork", label: `window check (${i})` }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "bell", label: "return" },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const charReplacement: Film = {
  meta: { title: `Character Replacement · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: WINS[WINS.length - 1].f + 20, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.s, to: SIM[0].f, text: `s = "${S}", k = ${K}` }, { from: SIM[0].f, to: CUE.ret, text: "A window is valid while (length - most frequent count) ≤ k." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}. Time O(n), space O(m).` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "charReplacement", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, -1, 1, -3], seed: 424 }),
};
