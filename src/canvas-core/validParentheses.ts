// VALID PARENTHESES · duckcode, crayon, 9:16. Six bracket ducks; the `c` pennant walks them. Openers fly
// onto the stack (a row of cards); a closer looks up its opener in brackets_map and pops the top card if
// it matches. Everything on screen comes from SIM, a simulation of the user's code.
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
import { lerp } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 20, TITLE = "Valid Parentheses", SUB = "LeetCode 20  ·  Python";
const S = "()[]{}", N = S.length, EXPECTED = true;
const MAP: [string, string][] = [["]", "["], [")", "("], ["}", "{"]];
const CODE = [
  `s = "${S}"`, "class Solution:", "    def isValid(self, s: str) -> bool:", '        brackets_map = {"]":"[", ")" : "(", "}" : "{"}', "        stack = []",
  "        for c in s:", "            if c in brackets_map:", "                if stack and brackets_map[c] == stack[-1]:", "                    stack.pop()", "                else:",
  "                    return False", "            else:", "                stack.append(c)", "        return not stack", "print(Solution().isValid(s))",
];

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; c?: number; stack: number[]; note: string; sub?: string; key?: string; push?: number; pop?: number; ok?: boolean };
export const SIM: Snap[] = (() => {
  const out: Snap[] = [], stack: number[] = [], map = new Map(MAP); let f = 150, c: number | undefined;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, c, stack: [...stack], note, ...x }); f += dur; };
  at(3, "brackets_map = { ']':'[',  ')':'(',  '}':'{' }", 45, { sub: "each closer → the opener it needs" });
  at(4, "stack = []", 30, { sub: "openers wait here for their closer" });
  let result = true;
  for (c = 0; c < N; c++) {
    const ch = S[c];
    at(5, `c = '${ch}'`, 30);
    if (map.has(ch)) {
      at(6, `'${ch}' in brackets_map  →  True`, 30, { key: ch, sub: "a closer: it must match the top of the stack" });
      const top = stack.length ? S[stack[stack.length - 1]] : undefined, ok = top !== undefined && map.get(ch) === top;
      at(7, `brackets_map['${ch}'] = '${map.get(ch)}'  ==  stack[-1] = '${top ?? "-"}'`, 60, { key: ch, ok, sub: ok ? "it matches the newest opener" : "no match" });
      if (!ok) { result = false; at(10, "return False", 30); break; }
      const p = stack.pop()!; at(8, "stack.pop()", 45, { pop: p, sub: `'${S[p]}' and '${ch}' close each other` });
    } else {
      at(6, `'${ch}' in brackets_map  →  False`, 30, { sub: "an opener" });
      stack.push(c); at(12, `stack.append('${ch}')`, 45, { push: c, sub: "wait on the stack for its closer" });
    }
  }
  c = undefined;
  if (result) { result = stack.length === 0; at(13, `return not stack  →  ${result ? "True" : "False"}`, 30, { sub: "the stack is empty: every opener was closed" }); }
  if (result !== EXPECTED) throw new Error("validParentheses: simulation disagrees");
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 23, 30, 38, 45, 53], s: 60, call: 90, def: 120, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.s, 0], [CUE.call, 14], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 14]];
checkBeats("validParentheses", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`validParentheses: gap before ${RUN[k][0]}`);
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "c", x.c === undefined ? "-" : `'${S[x.c]}'`], [x.f, "stack", `[${x.stack.map((i) => `'${S[i]}'`).join(", ")}]`]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 735, DUCK_K = 0.64, SX = (d: number) => 115 + d * 170, NOTE_Y = 515, STACK_Y = 965, MAP_Y = 1085;
const STX = (k: number) => 330 + k * 150, MAPX = (k: number) => 470 + k * 190;
const PANEL = { x: 46, y: 1192, w: 988, size: 23, lh: 34, pad: 18, file: "valid_parentheses.py" };

// ---------------------------------------------------------------- motion
const PUSH = SIM.filter((x) => x.push !== undefined), POP = SIM.filter((x) => x.pop !== undefined);
const HOPS: [number, number, number][] = [...SIM.filter((x) => x.line === 5).map((x) => [x.c!, x.f + 4, 40] as [number, number, number]),
  ...POP.flatMap((x) => [[x.c!, x.f + 6, 60], [x.pop!, x.f + 10, 60]] as [number, number, number][]),
  ...S.split("").flatMap((_, d) => [[d, CUE.party + d * 4, 34], [d, CUE.party + 60 + d * 4, 22]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), ...POP.flatMap((x) => [[x.f + 8, x.c!], [x.f + 14, x.pop!]] as [number, number][]), [CUE.party + 2, 0], [CUE.party + 8, 5]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.3); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && (s.pop === d || (s.pop !== undefined && s.c === d))) eye = "happy";
  else if (s && f < CUE.ret && s.c === d && s.line === 7) eye = "wide";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: SX(d), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.3 + 1), eye, look: 0.4, label: S[d], seed: 2000 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
const card = (env: Env, label: string, hot: boolean, w = 110) => sprite(env, `vpar:${label}:${hot}:${w}`, w + 30, 90, (w + 30) / 2, 45, (g) => {
  const col = hot ? "#c9b45a" : "#e8dfca";
  wax(g, () => crayonShape(g, roundRect(-w / 2, -32, w, 64, 14, 4), { col, shade: darker(col, 0.25), seed: 2700 + (hot ? 1 : 0) + w, lw: 2.4, gap: 4.2, w: 4.4 }));
  text(g, label, 0, 2, { size: 32, weight: 700, fill: C.ink });
});

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : undefined;
  if (s?.c !== undefined) waterRing(g, SX(s.c), DUCK_Y + 12, DUCK_K, C.teal, ease.out(prog(f, s.f, 8)), 2500 + s.c);
  if (s) s.stack.forEach((i) => waterRing(g, SX(i), DUCK_Y + 12, DUCK_K, C.rose, 1, 2520 + i));
  if (f >= CUE.ret) S.split("").forEach((_, d) => waterRing(g, SX(d), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + d * 4, 8)), 2560 + d));
  S.split("").forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, SX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.7));
  if (s?.c !== undefined) { const prev = SIM[SIM.indexOf(s) - 1], from = prev?.c ?? s.c, t = ease.inOut(prog(f, s.f, 12)); drawMarker(ctx, env, lerp(SX(from), SX(s.c), t), DUCK_Y + 42 + 4 * Math.sin(f * 0.16), "c", 0.85 * ease.back(prog(f, SIM.find((x) => x.c !== undefined)!.f, 10)), C.teal, true); }
  // the stack and brackets_map
  const dq = prog(f, CUE.def, 10) * (1 - prog(f, CUE.print - 10, 10));
  if (dq > 0) g.group("plain", () => { text(g, "stack", 160, STACK_Y, { size: 32, weight: 700, fill: C.ink, alpha: dq }); text(g, "brackets_map", 200, MAP_Y, { size: 28, weight: 700, fill: C.ink, alpha: dq }); if (s && !s.stack.length && s.pop === undefined) text(g, "[ ]  empty", 330, STACK_Y, { size: 28, weight: 500, fill: C.inkSoft, align: "left", alpha: dq * 0.8 }); });
  if (dq > 0) MAP.forEach(([k, v], i) => { const hot = s?.key === k, q = ease.back(prog(f, CUE.def + 4 + i * 6, 12)) * (1 - prog(f, CUE.print - 10, 10)); blit(ctx, env, card(env, `'${k}': '${v}'`, hot, 170), MAPX(i), MAP_Y + 3 * Math.sin(f * 0.1 + i) - (hot ? 6 * Math.sin(Math.PI * prog(f, s!.f, 16)) : 0), q * 0.85, q * 0.85); });
  if (s && f < CUE.print) {
    const shown = s.pop !== undefined ? [...s.stack, s.pop] : s.stack;
    shown.forEach((i, k) => {
      const pushed = PUSH.find((x) => x.push === i)!, t = ease.inOut(prog(f, pushed.f + 6, 24)), x = lerp(SX(i), STX(k), t), y = lerp(DUCK_Y - 20, STACK_Y, t) - 90 * Math.sin(Math.PI * t);
      const popping = s.pop === i, out = popping ? ease.inOut(prog(f, s.f + 14, 20)) : 0, top = k === shown.length - 1 && s.line === 7;
      blit(ctx, env, card(env, `'${S[i]}'`, top || popping), x, y + 3 * Math.sin(f * 0.1 + k) - 60 * out, 1 - out * 0.6, 1 - out * 0.6, 0, 1 - out);
    });
  }
  const note = f >= CUE.ret && f < CUE.print ? SIM[SIM.length - 1] : s;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(70, NOTE_Y - 34, 940, h, 20); c.fill(); c.restore(); g.touch(70, NOTE_Y - 34, 1010, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: note.note.length > 34 ? 30 : 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: 26, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "isValid returns", value: "True", time: ["O(n)", "one pass over s"], space: ["O(n)", "the stack can hold every char"], y: 520 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["s = ", C.ink], [`"${S}"`, C.rose]], from: CUE.s, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.s, ret: CUE.ret, print: CUE.print, output: "True" });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -1 : 1 } as SfxCue)),
  { frame: CUE.s + 2, kind: "pop", variant: "tiny", label: "s" },
  ...SIM.flatMap((x, k): SfxCue[] => x.push !== undefined ? [{ frame: x.f + 8, kind: "whoosh", variant: "soft", dir: 1, label: `push (${k})` }]
    : x.pop !== undefined ? [{ frame: x.f + 14, kind: "chime", variant: "sparkle", label: `pop (${k})`, gainDb: 2 }]
    : x.line === 5 ? [{ frame: x.f + 2, kind: "tick", variant: "soft", label: `next char (${k})`, gainDb: 5 }]
    : x.line === 7 ? [{ frame: x.f + 6, kind: "pop", variant: "tiny", label: `lookup (${k})`, gainDb: 3 }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "bell", label: "return" },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const validParentheses: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: POP[0].f + 20, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.s, to: SIM[0].f, text: `s = "${S}"` }, { from: SIM[0].f, to: CUE.ret, text: "Openers go on the stack; a closer must match the newest opener." }, { from: CUE.ret, to: DURATION, text: "Output: True. Time O(n), space O(n)." }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "validParentheses", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -1, -2, 1, -4], seed: 20 }),
};
