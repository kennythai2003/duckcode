// VALID PALINDROME · duckcode, crayon, 9:16. Two ducks (left and right) walk in from both ends of a
// 30-cell tape: l and r markers skip punctuation and spaces, and each pair of letters is compared.
// Everything on screen comes from SIM, a line-by-line simulation of the user's code.
import type { Ctx, Env, Gfx, P } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { drawCard, drawCheck, drawCross, drawMarker, drawSparkle, splash, waterRing } from "./duck/fx";
import { C, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { checkBeats, stageBegin, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp, mix } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 125, TITLE = "Valid Palindrome", SUB = "LeetCode 125  ·  Python";
const S = "A man, a plan, a canal: Panama", N = S.length, EXPECTED = true;
const CODE = [
  `s = "${S}"`, "class Solution:", "    def isPalindrome(self, s: str) -> bool:", "        l, r = 0, len(s) - 1", "        while l < r:",
  "            while l < r and not self.isAlphanumeric(s[l]):", "                l = l + 1", "            while l < r and not self.isAlphanumeric(s[r]):", "                r = r - 1",
  "            if s[l].lower() != s[r].lower():", "                return False", "            l, r = l + 1, r - 1", "        return True",
  "    def isAlphanumeric(self, c):", "        return (ord('a') <= ord(c) <= ord('z') or", "                ord('A') <= ord(c) <= ord('Z') or", "                ord('0') <= ord(c) <= ord('9'))", "print(Solution().isPalindrome(s))",
];
const alnum = (c: string) => /[a-zA-Z0-9]/.test(c);

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; l: number; r: number; note: string; sub?: string; skip?: number; pair?: [number, number]; verdict?: "yes" | "no" };
const SIM: Snap[] = (() => {
  const out: Snap[] = []; let f = 150, l = 0, r = N - 1;   // right after the def line: no dead air
  let pairNo = 0; const fast = () => pairNo >= 3 && pairNo <= 8;   // the middle pairs speed up; the first and last slow down again
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, l, r, note, ...x }); f += fast() ? Math.max(15, Math.round(dur / 2 / 15) * 15) : dur; };
  at(3, `l = 0, r = ${N - 1}`, 45);
  let result = true;
  while (l < r) {
    at(4, `l = ${l} < r = ${r}`, 15);
    while (l < r && !alnum(S[l])) { at(5, `isAlphanumeric('${S[l]}')  →  False`, 30, { sub: "not a-z, A-Z or 0-9: skip it" }); const k = l; l += 1; at(6, `l = ${l}`, 15, { skip: k }); }
    at(5, `isAlphanumeric('${S[l]}')  →  True`, 30, { sub: "a letter or digit: l stays" });
    while (l < r && !alnum(S[r])) { at(7, `isAlphanumeric('${S[r]}')  →  False`, 30, { sub: "not a-z, A-Z or 0-9: skip it" }); const k = r; r -= 1; at(8, `r = ${r}`, 15, { skip: k }); }
    at(7, `isAlphanumeric('${S[r]}')  →  True`, 30, { sub: "a letter or digit: r stays" });
    const same = S[l].toLowerCase() === S[r].toLowerCase();
    at(9, `'${S[l]}'.lower() = '${S[l].toLowerCase()}'  vs  '${S[r]}'.lower() = '${S[r].toLowerCase()}'`, 45, { verdict: same ? "yes" : "no", sub: same ? "equal: keep going" : "different: not a palindrome" });
    if (!same) { result = false; at(10, "return False", 30); break; }
    const pair: [number, number] = [l, r]; l += 1; r -= 1; at(11, `l = ${l}, r = ${r}`, 30, { pair }); pairNo += 1;
  }
  if (result) at(4, `l = ${l} is not < r = ${r}: stop`, 30);
  if (result !== EXPECTED) throw new Error("validPalindrome: simulation disagrees with expected");
  at(12, "return True", 30);
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 300) / 120) * 120;   // spare frames go to the answer card, never to a gap
export const CUE = { land: [15, 23], s: 60, call: 90, def: 120, tape: 30, ret: RET, print: RET + 60, party: RET + 90 };
if (CUE.ret < SIM_END) throw new Error("validPalindrome: the simulation runs into the ending");
const RUN: Run = [[CUE.s, 0], [CUE.call, 17], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 17]];
checkBeats("validPalindrome", RUN);
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "l", String(x.l)], [x.f, "r", String(x.r)]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 740, DUCK_K = 0.8, DUCK_X = [260, 820], NOTE_Y = 535;
const cell = (c: number): P => [540 + ((c % 15) - 7) * 68, 950 + Math.floor(c / 15) * 175];
const PANEL = { x: 46, y: 1196, w: 988, size: 21, lh: 30, pad: 18, file: "valid_palindrome.py" };

// ---------------------------------------------------------------- motion
const CMP = SIM.filter((x) => x.line === 9);
const HOPS: [number, number, number][] = [...CMP.flatMap((x) => [[0, x.f + 6, 46], [1, x.f + 6, 46]] as [number, number, number][]),
  ...[0, 1].flatMap((i) => [[i, CUE.ret + i * 6, 76], [i, CUE.party + i * 6, 54], [i, CUE.party + 60 + i * 6, 34]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, i) => [f + 2, i] as [number, number]), ...CMP.filter((_, k) => k % 3 === 2).map((x) => [x.f + 8, 0] as [number, number]),
  [CUE.ret + 2, 0], [CUE.ret + 8, 1], [CUE.party + 2, 0], [CUE.party + 8, 1]];
const pose = (i: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const idx = s ? (i === 0 ? s.l : s.r) : i === 0 ? 0 : N - 1, ch = S[Math.min(N - 1, Math.max(0, idx))];
  let eye: Eye = "open";
  if (s && f < CUE.ret) eye = s.line === 9 ? (s.verdict === "yes" ? "wide" : "worried") : !alnum(ch) && (s.line === 5 || s.line === 7) ? "worried" : "open";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + i * 41) % 97 < 4) eye = "blink";
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye, look: i === 0 ? 0.6 : -0.6, label: ch === " " ? "␣" : ch, seed: 10000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
type Kind = "set" | "skip" | "match" | "best";
const cellSprite = (env: Env, ch: string, kind: Kind) => sprite(env, `vpcell:${ch}:${kind}`, 84, 90, 42, 45, (g) => {
  const col = kind === "best" ? mix(C.gold, "#efe6d3", 0.2) : kind === "match" ? mix(C.teal, "#efe6d3", 0.2) : kind === "skip" ? "#d9d1bd" : "#e8dfca";
  wax(g, () => crayonShape(g, roundRect(-29, -31, 58, 62, 9, 3), { col, shade: kind === "skip" ? "#cdc4ad" : darker(col, 0.25), seed: 10700 + (kind === "match" ? 1 : kind === "best" ? 2 : kind === "skip" ? 3 : 0), lw: kind === "skip" ? 1.4 : 2, gap: 4.2, w: 4 }));
  text(g, ch === " " ? "␣" : ch, 0, 2, { size: 34, weight: 700, fill: kind === "set" ? C.ink : kind === "skip" ? "#a89c80" : "#f6f0e2" });
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : undefined;
  [0, 1].forEach((i) => { if (f >= CUE.ret) waterRing(g, DUCK_X[i], DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + i * 6, 8)), 560 + i); else if (s) waterRing(g, DUCK_X[i], DUCK_Y + 12, DUCK_K, i ? C.teal : C.rose, ease.out(prog(f, SIM[0].f + 6, 8)), 500 + i); });
  // the tape: 30 cells, appearing left to right; skipped ones fade, matched pairs turn teal, then gold
  const matched = (c: number) => SIM.some((x) => x.pair && f >= x.f && (x.pair[0] === c || x.pair[1] === c)), skipped = (c: number) => SIM.some((x) => x.skip === c && f >= x.f);
  for (let c = 0; c < N; c++) {
    const q = ease.spring(prog(f, CUE.tape + c * 3, 14)); if (q <= 0) continue;
    const kind: Kind = f >= CUE.ret && alnum(S[c]) ? "best" : matched(c) ? "match" : skipped(c) ? "skip" : "set";
    const [x, y] = cell(c), cmpLift = s?.line === 9 && (c === s.l || c === s.r) ? 10 * Math.sin(Math.PI * prog(f, s.f, 30)) : 0;
    blit(ctx, env, cellSprite(env, S[c], kind), x, y - cmpLift + 4.5 * Math.sin(f * 0.1 + c * 0.45), q, q);
  }
  g.group("plain", () => { for (let c = 0; c < N; c++) { const [x, y] = cell(c); text(g, String(c), x - 25, y - 21, { size: 13, weight: 700, fill: "#3a302b", align: "left", alpha: 0.6 * prog(f, CUE.tape + c * 3 + 6, 6) }); } });
  // l and r markers (pointer markers, never the head pennant)
  if (s && f >= SIM[0].f) {
    const prev = SIM[SIM.indexOf(s) - 1] ?? s, t = ease.inOut(prog(f, s.f, 12)), up = f >= CUE.ret ? 1 - ease.out(prog(f, CUE.ret, 10)) : 1;
    const pos = (a: number, b: number, side: number): P => { const [ax, ay] = cell(a), [bx, by] = cell(b); return [lerp(ax, bx, t) + (s.l === s.r ? side * 27 : 0), lerp(ay, by, t) - 40 - (ay !== by ? 50 * 4 * t * (1 - t) : 0) + 4 * Math.sin(f * 0.16 + side)]; };
    const pl = pos(prev.l, s.l, -1), pr = pos(prev.r, s.r, 1);
    drawMarker(ctx, env, pr[0], pr[1], "r", 0.9 * up); drawMarker(ctx, env, pl[0], pl[1], "l", 0.9 * up);
  }
  if (f >= CUE.ret && f < CUE.print + 20) { const [x, y] = cell(15); void x; void y; }
  [0, 1].forEach((i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 12, (f - l) / 18, 1100 + i, 0.8));
  // compare verdict between the ducks, and the one-line note
  if (s?.line === 9) { const q = ease.back(prog(f, s.f + 8, 10)); (s.verdict === "yes" ? drawCheck : drawCross)(ctx, env, 540, DUCK_Y - 30, q * 1.1); }
  const note = f >= CUE.ret && f < CUE.print ? { note: "return True", sub: "every pair of letters matched" } : s;
  if (note && f < CUE.print) g.group("plain", () => { text(g, note.note, 540, NOTE_Y, { size: note.note.length > 30 ? 30 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: 26, weight: 500, fill: C.inkSoft }); });
  const aq = ease.spring(prog(f, CUE.print, 24)); if (aq > 0) drawCard(ctx, env, 540, 545, "isPalindrome returns", "True", aq);
  if (f >= CUE.party) for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 290, 545 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + k), a); }
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["s = ", C.ink], [`"${S}"`, C.rose]], from: CUE.s, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.s, ret: CUE.ret, print: CUE.print, output: "True" });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: i ? -1 : 1 } as SfxCue)),
  { frame: CUE.s + 2, kind: "pop", variant: "tiny", label: "s" }, { frame: CUE.tape + 20, kind: "pop", variant: "cork", label: "tape" },
  ...SIM.flatMap((x, k): SfxCue[] => x.line === 9 ? [{ frame: x.f + 8, kind: "pop", variant: "tiny", label: `compare (${k})`, gainDb: 3 }] : x.skip !== undefined ? [{ frame: x.f + 2, kind: "tick", variant: "soft", label: `skip (${k})`, gainDb: 5 }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "sparkle", label: "return True", gainDb: 2 },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
];
export const validPalindrome: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: CMP[5].f + 20, holds: [[CUE.party + 60, DURATION, "the answer, held for reading"]],
    captions: [{ from: CUE.s, to: SIM[0].f, text: `s = "${S}"` }, { from: SIM[0].f, to: CUE.ret, text: "Skip anything that isn't a letter or digit, then compare the two ends." }, { from: CUE.ret, to: DURATION, text: "Output: True" }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "validPalindrome", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, -2], seed: 125 }),
};
