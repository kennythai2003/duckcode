// ENCODE AND DECODE STRINGS · duckcode, crayon, 9:16, 72 s at 120 bpm (a beat is 15 frames, a bar 60).
//
// The story in three sentences. Three ducks each wear a word. Encoding, each duck lays its length,
// a "#", then its letters onto one long tape: "4#neet4#code3#you". Decoding, two pennants i and j
// walk the tape (j runs to the "#", the digits before it say how far to jump) and every word they
// cut out flies home to its duck.
// The token: the "#" after each length, which is where j always stops.
// Everything the picture shows (cells, i, j, length, the words) comes from simulating the user's
// own algorithm below, so the video cannot disagree with the code.
import { Gfx, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { pondPlate, waterGlints } from "./duck/pond";
import { drawDuck, drawPointer, headTop, chest, type DuckPose, type Eye } from "./duck/duck";
import { drawPanel, type PanelLayout } from "./duck/codePanel";
import { drawBubble, drawCard, drawMarker, drawSparkle, drawTag, splash, waterRing } from "./duck/fx";
import { C, CRAYON_M, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { pillSprite, titleSprite } from "./duck/chrome";
import { lerp, mix } from "./gallery";
import { encodeDecodeAudio } from "./encodeDecodeSound";

const FPS = 30, BPM = 120, DURATION = 2160, W = 1080, H = 1920;

// ---------------------------------------------------------------- the problem
const STRS = ["neet", "code", "you"];
const CODE = [
  `strs = [${STRS.map((s) => `"${s}"`).join(", ")}]`,
  "class Solution:",
  "    def encode(self, strs: List[str]) -> str:",
  "        res = []",
  "        for s in strs:",
  "            res.append(str(len(s)))",
  "            res.append(\"#\")",
  "            res.append(s)",
  "        return \"\".join(res)",
  "    def decode(self, s: str) -> List[str]:",
  "        res = []",
  "        i = 0",
  "        while i < len(s):",
  "            j = i",
  "            while s[j] != '#':",
  "                j += 1",
  "            length = int(s[i:j])",
  "            i = j + 1",
  "            j = i + length",
  "            res.append(s[i:j])",
  "            i = j",
  "        return res",
  "sol = Solution()",
  "print(sol.decode(sol.encode(strs)))",
];
const ENC = STRS.map((s) => `${s.length}#${s}`).join("");
// which word each tape cell belongs to, and whether it is a length digit / "#" (meta) or a letter
const OWNER: number[] = [], META: boolean[] = [];
STRS.forEach((s, w) => { const head = `${s.length}#`; [...head].forEach(() => { OWNER.push(w); META.push(true); }); [...s].forEach(() => { OWNER.push(w); META.push(false); }); });
const SEG_START = STRS.map((_, w) => OWNER.indexOf(w));

// ---------------------------------------------------------------- encode timeline
const EP = STRS.map((s, w) => { const start = w === 0 ? 180 : 360 + 150 * (w - 1); const st = SEG_START[w], digits = String(s.length).length; return { w, start, len: start + 30, hash: start + 60, word: start + 90, st, digits }; });
// decode: run the user's decode, recording every executed line with the state after it
type Snap = { f: number; line: number; i: number; j: number; length: number; res: string[]; note: string; append?: { w: number; from: number; to: number } };
const DEC: Snap[] = (() => {
  const out: Snap[] = []; let f = 855, i = 0, j = 0, length = 0; const res: string[] = [], s = ENC;
  const at = (line: number, note: string, dur = 30, extra: Partial<Snap> = {}) => { out.push({ f, line, i, j, length, res: [...res], note, ...extra }); f += dur; };
  while (true) {
    if (!(i < s.length)) { at(12, `i = ${i}, not < ${s.length}: done`); break; }
    at(12, `i = ${i} < ${s.length}`);
    j = i; at(13, `j = i = ${j}`);
    while (s[j] !== "#") { at(14, `s[${j}] = '${s[j]}' ≠ '#'`); j += 1; at(15, `j = ${j}`); }
    at(14, `s[${j}] = '#': stop`);
    length = parseInt(s.slice(i, j), 10); at(16, `length = int(s[${i}:${j}]) = ${length}`, 45);
    i = j + 1; at(17, `i = j + 1 = ${i}`);
    j = i + length; at(18, `j = i + length = ${j}`);
    const word = s.slice(i, j); res.push(word); at(19, `res.append(s[${i}:${j}])  →  '${word}'`, 45, { append: { w: res.length - 1, from: i, to: j } });
    i = j; at(20, `i = j = ${i}`);
  }
  return out;
})();
const DEC_END = DEC[DEC.length - 1].f + 30;
export const CUE = { land: [15, 23, 30], strs: 60, def: 105, eres: 135, join: 660, scroll: 720, ddef: 765, dres: 795, i0: 825, ret: DEC_END, print: DEC_END + 60, party: DEC_END + 90, ep: EP, appends: DEC.filter((d) => d.append).map((d) => d.f) };
if (CUE.party + 150 > DURATION) throw new Error("encodeDecode: the film is too short for its timeline");
const RUN: [number, number][] = [[CUE.strs, 0], [CUE.def, 2], [CUE.eres, 3], ...EP.flatMap((p): [number, number][] => [[p.start, 4], [p.len, 5], [p.hash, 6], [p.word, 7]]),
  [CUE.join, 8], [CUE.ddef, 9], [CUE.dres, 10], [CUE.i0, 11], ...DEC.map((d): [number, number] => [d.f, d.line]), [CUE.ret, 21], [CUE.print, 23]];
for (const [f] of RUN) if (f % 15) throw new Error(`encodeDecode: a run cue at ${f} is off the beat`);
const RESULT = DEC[DEC.length - 1].res;
if (RESULT.join("|") !== STRS.join("|")) throw new Error("encodeDecode: decode(encode(strs)) != strs");

// ---------------------------------------------------------------- layout
const DUCK_Y = 740, DUCK_K = 0.88, DUCK_X = [240, 540, 840], TAG_Y = 822, NOTE_Y = 880;
const CELL_W = 104, COLS = 9, cellXY = (p: number): P => [540 + ((p % COLS) - (COLS - 1) / 2) * CELL_W, p < COLS ? 1000 : 1150];
const RES_AT: P = [540, 585];
const PANEL: PanelLayout = { x: 46, y: 1196, w: 988, size: 23, lh: 34, pad: 18, file: "encode_decode.py" };
const VIEW = 15, OFF_MAX = CODE.length - VIEW;
const GROUP_COL = [C.rose, C.teal, C.gold];

// encode: when each tape cell appears (digits at len, "#" at hash, letters staggered from word)
const CELL_AT: number[] = ENC.split("").map((_, p) => {
  const e = EP[OWNER[p]], k = p - e.st;
  return k < e.digits ? e.len + 22 : k === e.digits ? e.hash + 14 : e.word + 6 * (k - e.digits - 1) + 20;
});

// ---------------------------------------------------------------- motion
const APPEND = DEC.filter((d) => d.append);
const HOPS: [number, number, number][] = [
  ...EP.map((p, k) => [p.w, p.start + (k === 0 ? 6 : 18), 60] as [number, number, number]),
  ...APPEND.map((d) => [d.append!.w, d.f + 30, 74] as [number, number, number]),
  ...STRS.map((_, i) => [i, CUE.party + i * 6, 54] as [number, number, number]),
  ...STRS.map((_, i) => [i, CUE.party + 60 + i * 6, 34] as [number, number, number]),
];
export const QUACKS: [number, number][] = [
  ...CUE.land.map((f, i) => [f + 2, i] as [number, number]),
  ...APPEND.map((d) => [d.f + 32, d.append!.w] as [number, number]),
  ...STRS.map((_, i) => [CUE.party + i * 6 + 2, i] as [number, number]),
];
const eyeOf = (i: number, f: number): Eye => {
  let e: Eye = "open";
  if (EP.some((p) => p.w === i && f >= p.word && f < p.word + 50)) e = "wide";
  if (APPEND.some((d) => d.append!.w === i && f >= d.f + 30) || f >= CUE.party - 6) e = "happy";
  if (e === "open" && (f + i * 41) % 97 < 4) e = "blink";
  return e;
};
const pose = (i: number, f: number): DuckPose => {
  const bob = Math.sin((2 * Math.PI * f) / 60 + i * 1.7);
  let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const d = drop(f, CUE.land[i]); if (d) { lift += d.lift; sx *= d.sx; sy *= d.sy; }
  for (const [j, f0, h] of HOPS) if (j === i) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  const look = EP.some((p) => p.w === i && f >= p.len && f < p.word + 60) ? -0.6 : 0.3;
  return { x: DUCK_X[i], y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + i * 1.7 + 1), eye: eyeOf(i, f), look, label: STRS[i], seed: 6000 + i * 100, mouth: QUACKS.some(([q, j]) => j === i && f >= q && f < q + 9) ? 1 : 0 };
};
const sPointer = (f: number): { at: P; tilt: number } | null => {
  if (f < EP[0].start || f >= CUE.join) return null;
  const top = (i: number) => headTop(pose(i, f));
  if (f < EP[0].start + 12) { const t = ease.out((f - EP[0].start) / 12), p = top(0); return { at: [lerp(p[0] - 200, p[0], t), lerp(-120, p[1], t)], tilt: lerp(-1, -0.12, t) }; }
  let cur = 0;
  for (let k = 1; k < EP.length; k++) if (f >= EP[k].start) {
    const a = top(k - 1), b = top(k), t = ease.inOut((f - EP[k].start) / 18);
    if (t < 1) return { at: [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - 120 * 4 * t * (1 - t)], tilt: -0.12 + 0.5 * Math.sin(Math.PI * t) };
    cur = k;
  }
  return { at: top(cur), tilt: -0.12 };
};
// i and j on the tape: slide from their previous cell to the new one over 12 frames (a hop across rows)
const tapePos = (p: number, side: number): P => { const [x, y] = cellXY(Math.min(p, ENC.length)); return [x + side * 27, y - 30]; };
const ijAt = (f: number, which: "i" | "j"): P | null => {
  if (f < CUE.i0) return null;
  const snaps = DEC.filter((d) => d.f <= f); const cur = snaps.length ? snaps[snaps.length - 1] : null, prev = snaps.length > 1 ? snaps[snaps.length - 2] : null;
  if (which === "j" && (!cur || cur.f < DEC[1].f)) return null;
  const side = which === "i" ? -1 : 1, v = (s: Snap | null) => (s ? s[which] : 0);
  const a = tapePos(prev ? v(prev) : 0, side), b = tapePos(cur ? v(cur) : 0, side), t = cur ? ease.inOut(prog(f, cur.f, 12)) : 1;
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - (a[1] !== b[1] ? 60 : 24) * 4 * t * (1 - t) * (a[0] !== b[0] || a[1] !== b[1] ? 1 : 0)];
};

// ---------------------------------------------------------------- sprites
const cellSprite = (env: Env, ch: string, w: number, meta: boolean) => sprite(env, `edcell:${ch}:${w}:${meta}`, 120, 100, 60, 50, (g) => {
  const col = meta ? "#e8dfca" : mix(GROUP_COL[w], "#efe6d3", 0.15);
  wax(g, () => crayonShape(g, roundRect(-46, -32, 92, 64, 10, 4), { col, shade: meta ? "#cdbf9f" : darker(GROUP_COL[w], 0.28), seed: 6700 + w * 10 + (meta ? 1 : 0), lw: 2, gap: 4.2, w: 4.2 }));
  text(g, ch, 0, 2, { size: 36, weight: 700, fill: meta ? darker(GROUP_COL[w], 0.35) : "#f6f0e2" });
});
const slotSprite = (env: Env) => sprite(env, "edslot", 120, 100, 60, 50, (g) => wax(g, () => crayonShape(g, roundRect(-46, -32, 92, 64, 10, 4), { col: "#e9e2d0", shade: "#d6ccb4", seed: 6790, lw: 1.4, gap: 6, w: 3.6 })));

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = new Gfx(ctx, env, f, CRAYON_M);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(pondPlate(env).canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  waterGlints(g, f, W, H);

  // rings: rose = being encoded, teal = encoded, gold = decoded back home
  EP.forEach((p, k) => {
    const arrive = p.start + (k === 0 ? 12 : 18), done = (EP[k + 1]?.start ?? CUE.join) + 6, home = APPEND[k] ? APPEND[k].f + 30 : 1e9;
    waterRing(g, DUCK_X[p.w], DUCK_Y + 14, DUCK_K, C.rose, ease.out(prog(f, arrive, 8)) * (f < done ? 1 : 0), 500 + k);
    waterRing(g, DUCK_X[p.w], DUCK_Y + 14, DUCK_K, C.teal, ease.out(prog(f, done, 8)) * (f < home ? 1 : 0), 520 + k);
    waterRing(g, DUCK_X[p.w], DUCK_Y + 14, DUCK_K, C.gold, ease.out(prog(f, home, 8)), 540 + k);
  });
  STRS.forEach((_, i) => drawTag(ctx, env, DUCK_X[i], TAG_Y + 2 * Math.sin(f * 0.1 + i), String(i), ease.back(prog(f, CUE.strs + i * 3, 8))));

  // the tape: empty slots once res exists, cells as they are laid, the word being cut out lifts and glows
  const tq = ease.back(prog(f, CUE.eres, 10));
  if (tq > 0) {
    const cut = [...DEC].reverse().find((d) => d.append && f >= d.f && f < d.f + 45)?.append;
    g.group("plain", () => {
      text(g, f < CUE.join ? "res" : "s", 40, 950, { size: 26, weight: 700, fill: C.ink, align: "left", alpha: tq });
      text(g, "index", 40, 1080, { size: 18, weight: 500, fill: "#2f3d44", align: "left", alpha: 0 });
    });
    for (let p = 0; p < ENC.length; p++) {
      const [x, y] = cellXY(p), on = f >= CELL_AT[p];
      if (!on) { blit(ctx, env, slotSprite(env), x, y, tq * 0.94, tq * 0.94, 0, 0.8); continue; }
      const lift = cut && p >= cut.from && p < cut.to ? 14 * Math.sin(Math.PI * prog(f, DEC.find((d) => d.append === cut)!.f, 45)) : 0;
      const q = ease.spring(prog(f, CELL_AT[p], 16));
      blit(ctx, env, cellSprite(env, ENC[p], OWNER[p], META[p]), x, y - lift, q, q);
    }
    g.group("plain", () => { for (let p = 0; p < ENC.length; p++) { const [x, y] = cellXY(p); text(g, String(p), x - 34, y - 20 - (0), { size: 16, weight: 700, fill: "#3a302b", align: "left", alpha: 0.7 * tq }); } });
    // the joined string glows once, at return "".join(res)
    if (f >= CUE.join && f < CUE.join + 40) for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + f * 0.05; drawSparkle(ctx, env, 540 + Math.cos(a) * 470, 1055 + Math.sin(a) * 90, 13 * Math.sin(Math.PI * prog(f, CUE.join, 40)), a); }
  }

  // ducks, the s pennant (encode), i and j (decode)
  STRS.forEach((_, i) => { if (drop(f, CUE.land[i]) !== null) drawDuck(ctx, env, g, pose(i, f), f); });
  const sp = sPointer(f); if (sp) drawPointer(ctx, env, sp.at, DUCK_K * 1.1, sp.tilt, "s");
  const ip = ijAt(f, "i"), jp = ijAt(f, "j"), ijq = 1 - ease.out(prog(f, CUE.ret, 10));
  if (ijq > 0 && jp) drawMarker(ctx, env, jp[0], jp[1] + 4 * Math.sin(f * 0.16 + 1.3), "j", 0.92 * ijq);
  if (ijq > 0 && ip) drawMarker(ctx, env, ip[0], ip[1] + 4 * Math.sin(f * 0.16), "i", 0.92 * ijq);
  CUE.land.forEach((l, i) => splash(g, DUCK_X[i], DUCK_Y + 14, (f - l) / 18, 1100 + i, 0.9));

  // flights: encode = length, "#" and letters from duck to tape; decode = the cut word back to its duck
  const fly = (s: string, a: P, b: P, t0: number, dur: number, arc: number, size = 40) => {
    if (f < t0 || f >= t0 + dur) return;
    const u = ease.inOut(prog(f, t0, dur)), x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) - arc * 4 * u * (1 - u), k = 1 + 0.3 * Math.sin(Math.PI * u);
    g.group("plain", () => text(g, s, x, y, { size: size * k, weight: 700, fill: "#f6f0e2", stroke: C.ink, sw: 7 }));
  };
  EP.forEach((e) => {
    const a = chest(pose(e.w, f));
    for (let k = 0; k < e.digits; k++) fly(String(STRS[e.w].length)[k], a, cellXY(e.st + k), e.len + 2, 20, 120);
    fly("#", [540, 905], cellXY(e.st + e.digits), e.hash + 2, 12, 40);
    [...STRS[e.w]].forEach((ch, k) => { const p = e.st + e.digits + 1 + k; fly(ch, a, cellXY(p), CELL_AT[p] - 18, 18, 110, 36); });
  });
  APPEND.forEach((d) => {
    const { w, from, to } = d.append!, mid = cellXY(Math.floor((from + to - 1) / 2));
    fly(ENC.slice(from, to), mid, chest(pose(w, f)), d.f + 8, 24, 160, 40);
  });

  // what the decode line just did, in words, between the ducks and the tape
  const now = [...DEC].reverse().find((d) => f >= d.f);
  if (now && f < CUE.ret + 20) g.group("plain", () => text(g, now.note, 540, NOTE_Y, { size: 30, weight: 700, fill: now.append ? C.rose : C.ink, alpha: ease.out(prog(f, now.f, 8)) * (1 - prog(f, CUE.ret + 4, 12)) }));
  if (f >= CUE.def && f < CUE.join + 30) {
    const e = [...EP].reverse().find((x) => f >= x.start);
    const note = !e ? "" : f >= e.word ? `res.append('${STRS[e.w]}')` : f >= e.hash ? `res.append("#")` : f >= e.len ? `res.append(str(len('${STRS[e.w]}')))  →  '${STRS[e.w].length}'` : `s = '${STRS[e.w]}'`;
    if (f >= CUE.join) g.group("plain", () => text(g, `"".join(res)  →  "${ENC}"`, 540, NOTE_Y, { size: 30, weight: 700, fill: C.rose, alpha: ease.out(prog(f, CUE.join, 8)) * (1 - prog(f, CUE.join + 24, 8)) }));
    else if (note) g.group("plain", () => text(g, note, 540, NOTE_Y, { size: 30, weight: 700, fill: C.ink, alpha: ease.out(prog(f, Math.max(e!.start, [e!.start, e!.len, e!.hash, e!.word].filter((x) => x <= f).pop()!), 8)) }));
  }

  // res (decode) in the sky; the answer card
  const res = now ? now.res : [];
  const rq = ease.back(prog(f, CUE.dres + 4, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8)));
  drawBubble(ctx, env, RES_AT[0], RES_AT[1], [["res = ", C.ink], [`[${res.map((r) => `'${r}'`).join(", ")}]`, C.rose]], [RES_AT[0], RES_AT[1] + 66], rq, 6800 + res.length, 34);
  const cq = ease.spring(prog(f, CUE.print, 24));
  if (cq > 0) drawCard(ctx, env, 540, 545, "decode(encode(strs))", RESULT.join(", "), cq);
  if (f >= CUE.party) for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + (f - CUE.party) * 0.025; drawSparkle(ctx, env, 540 + Math.cos(a) * 280, 545 + Math.sin(a) * 120, 13 + 4 * Math.sin(f * 0.3 + s), a); }

  // title; the input pill becomes the encoded string at return "".join(res)
  const tq2 = ease.spring(prog(f, 0, 20));
  blit(ctx, env, titleSprite(env, "Encode & Decode Strings", "LeetCode 271  ·  Python"), 540, 270, tq2, tq2);
  const pq = ease.back(prog(f, CUE.strs, 10)) * (1 - ease.out(prog(f, CUE.join - 4, 8)));
  blit(ctx, env, pillSprite(env, [["strs = ", C.ink], [`[${STRS.join(", ")}]`, C.rose]]), 540, 432, pq, pq);
  const eq = ease.back(prog(f, CUE.join + 6, 10)) * (1 - ease.out(prog(f, CUE.print - 6, 8)));
  blit(ctx, env, pillSprite(env, [["s = ", C.ink], ...STRS.map((s, w): [string, string] => [`${s.length}#${s}`, darker(GROUP_COL[w], 0.15)])]), 540, 432, eq, eq);
  g.paper("paper", 0.05);

  // the code: a 15-line window that scrolls from encode to decode
  const off = Math.round(OFF_MAX * ease.inOut(prog(f, CUE.scroll, 30)));
  let line = -1, from = -1, at = 0;
  for (const [f0, l] of RUN) if (f >= f0) { from = line; line = l; at = f0; }
  const shown = (from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 8)))) - off;
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  const W_: [number, string, string][] = [...EP.flatMap((e): [number, string, string][] => [[e.start, "s", `'${STRS[e.w]}'`], [e.len, "len(s)", String(STRS[e.w].length)]]),
    ...DEC.flatMap((d): [number, string, string][] => [[d.f, "i", String(d.i)], ...(d.f >= DEC[1].f ? [[d.f, "j", String(d.j)] as [number, string, string]] : []), ...(d.line >= 16 && d.length ? [[d.f, "length", String(d.length)] as [number, string, string]] : [])]),
    [CUE.i0, "i", "0"]];
  for (const [f0, k, v] of W_.sort((x, y) => x[0] - y[0])) if (f >= f0) { if (watch.get(k) !== v) { fresh = k; freshAt = f0; } watch.set(k, v); }
  if (f >= CUE.scroll) { watch.delete("s"); watch.delete("len(s)"); }
  drawPanel(g, CODE.slice(off, off + VIEW), PANEL, {
    line: shown >= -0.5 && shown < VIEW ? shown : -1, alpha: prog(f, CUE.strs - 4, 6), lineNo0: off,
    pulse: f >= CUE.ret && f < CUE.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: `[${RESULT.map((r) => `'${r}'`).join(", ")}]`, outQ: prog(f, CUE.print + 4, 14),
  });
};

export const encodeDecode: Film = {
  meta: {
    title: "Encode and Decode Strings · duckcode", W, H, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: APPEND[1].f + 20,
    holds: [[CUE.party + 100, DURATION, "the answer, held for reading"]],
    captions: [
      { from: CUE.strs, to: EP[0].start, text: `strs = [${STRS.join(", ")}]` },
      { from: EP[0].start, to: CUE.join, text: "Encode: write each word's length, a #, then the word." },
      { from: CUE.join, to: CUE.i0, text: `Encoded: ${ENC}` },
      { from: CUE.i0, to: CUE.ret, text: "Decode: j runs to the #, the digits say how many letters to cut." },
      { from: CUE.ret, to: DURATION, text: `Output: [${RESULT.join(", ")}]` },
    ],
  },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "encodeDecode", start: 0, end: DURATION, draw }],
  audio: encodeDecodeAudio(FPS, DURATION, { ...CUE, quacks: QUACKS }),
};
