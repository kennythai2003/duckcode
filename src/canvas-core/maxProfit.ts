// BEST TIME TO BUY AND SELL STOCK · duckcode, crayon, 9:16. The ducks are the days; under them a crayon
// price chart. `sell` walks the days, `buy` remembers the cheapest day so far, and the gap between the
// two bars is today's profit. Everything on screen comes from SIM, a simulation of the user's code.
import type { Ctx, Env, Gfx } from "./core";
import type { Film } from "./film";
import { drawDuck, type DuckPose, type Eye } from "./duck/duck";
import { drawCheck, drawMarker, splash, waterRing } from "./duck/fx";
import { C, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, ease, prog, roundRect, text } from "./duck/kit";
import { hop, drop } from "./duck/motion";
import { checkBeats, stageBegin, stageEnd, stagePanel, stageTitle, type Run, type Watch } from "./duck/stage";
import { duckSound } from "./duck/sound";
import { themeFor } from "./duck/themes";
import { lerp, mix } from "./gallery";
import type { SfxCue } from "./music";

const FPS = 30, BPM = 120, LC = 121, TITLE = "Best Time to Buy and Sell Stock", SUB = "LeetCode 121  ·  Python";
const PRICES = [7, 1, 5, 3, 6, 4], N = PRICES.length, EXPECTED = 5;
const CODE = [
  "prices = [7, 1, 5, 3, 6, 4]", "class Solution:", "    def maxProfit(self, prices: List[int]) -> int:", "        max_profit = 0", "        min_buy = prices[0]",
  "        for sell in prices:", "            max_profit = max(max_profit, sell - min_buy)", "            min_buy = min(min_buy, sell)", "        return max_profit", "print(Solution().maxProfit(prices))",
];

// ---------------------------------------------------------------- simulate the user's code
type Snap = { f: number; line: number; day?: number; buy?: number; best: number; bestDay?: [number, number]; note: string; sub?: string; win?: boolean; profit?: number };
export const SIM: Snap[] = (() => {
  const out: Snap[] = []; let f = 150, max_profit = 0, min_buy = PRICES[0], buy: number | undefined, day: number | undefined, bestDay: [number, number] | undefined;
  const at = (line: number, note: string, dur: number, x: Partial<Snap> = {}) => { out.push({ f, line, day, buy, best: max_profit, bestDay, note, ...x }); f += dur; };
  at(3, "max_profit = 0", 45, { sub: "no trade yet, so no profit" });
  buy = 0; at(4, `min_buy = prices[0] = ${min_buy}`, 45, { sub: "the cheapest price seen so far" });
  PRICES.forEach((sell, d) => {
    day = d; at(5, `sell = ${sell}`, 30, { sub: `day ${d}: what if we sold today?` });
    const p = sell - min_buy, win = p > max_profit; max_profit = Math.max(max_profit, p); if (win) bestDay = [buy!, d];
    at(6, `max(${win ? max_profit - (max_profit - out[out.length - 1].best) : out[out.length - 1].best}, ${sell} - ${min_buy}) = ${max_profit}`, 60, { profit: p, win, sub: win ? `a profit of ${p}: the new best!` : p < 0 ? `${p}: selling below the buy loses money` : `${p} doesn't beat ${max_profit}` });
    const cheaper = sell < min_buy; min_buy = Math.min(min_buy, sell); if (cheaper) buy = d;
    at(7, `min(${cheaper ? PRICES[out[out.length - 1].buy!] : min_buy}, ${sell}) = ${min_buy}`, 45, { sub: cheaper ? `${sell} is cheaper: buy on day ${d} instead` : `still buying at ${min_buy}` });
  });
  day = undefined;
  if (max_profit !== EXPECTED) throw new Error(`maxProfit: simulation gives ${max_profit}`);
  at(8, `return ${max_profit}`, 30, { sub: `buy at ${PRICES[bestDay![0]]}, sell at ${PRICES[bestDay![1]]}` });
  return out;
})();
const SIM_END = SIM[SIM.length - 1].f + 30, RET = Math.ceil(SIM_END / 15) * 15, DURATION = Math.ceil((RET + 330) / 120) * 120;
export const CUE = { land: [15, 23, 30, 38, 45, 53], prices: 60, call: 90, def: 120, chart: 30, ret: RET, print: RET + 60, party: RET + 90 };
const RUN: Run = [[CUE.prices, 0], [CUE.call, 9], [CUE.def, 2], ...SIM.map((x): [number, number] => [x.f, x.line]), [CUE.print, 9]];
checkBeats("maxProfit", RUN);
for (let k = 1; k < RUN.length; k++) if (RUN[k][0] - RUN[k - 1][0] > 90) throw new Error(`maxProfit: gap before ${RUN[k][0]}`);
const WATCH: Watch = SIM.flatMap((x): [number, string, string][] => [[x.f, "max_profit", String(x.best)], [x.f, "min_buy", x.buy === undefined ? "-" : String(PRICES[x.buy])], [x.f, "sell", x.day === undefined ? "-" : String(PRICES[x.day])]]);
const snapAt = (f: number) => [...SIM].reverse().find((x) => f >= x.f);

// ---------------------------------------------------------------- layout
const DUCK_Y = 735, DUCK_K = 0.64, SX = (s: number) => 115 + s * 170, NOTE_Y = 515, BASE_Y = 1290, UNIT = 32, BEST_Y = 870;
const barH = (d: number) => 40 + PRICES[d] * UNIT, top = (d: number) => BASE_Y - barH(d);
const PANEL = { x: 46, y: 1340, w: 988, size: 23, lh: 34, pad: 18, file: "max_profit.py" };

// ---------------------------------------------------------------- motion
const WINS = SIM.filter((x) => x.win);
const HOPS: [number, number, number][] = [...WINS.flatMap((x) => [[x.day!, x.f + 6, 60], [x.buy!, x.f + 12, 40]] as [number, number, number][]),
  ...PRICES.flatMap((_, d) => [[d, CUE.party + d * 4, 50], [d, CUE.party + 60 + d * 4, 30]] as [number, number, number][])];
export const QUACKS: [number, number][] = [...CUE.land.map((f, d) => [f + 2, d] as [number, number]), ...WINS.map((x) => [x.f + 8, x.day!] as [number, number]),
  ...SIM.filter((x) => x.line === 7 && x.sub?.includes("cheaper")).map((x) => [x.f + 6, x.day!] as [number, number]), [CUE.party + 2, 1], [CUE.party + 8, 4]];
const pose = (d: number, f: number): DuckPose => {
  const s = snapAt(f), bob = Math.sin((2 * Math.PI * f) / 60 + d * 1.3); let lift = 3 + 3 * bob, sx = 1, sy = 1;
  const dr = drop(f, CUE.land[d]); if (dr) { lift += dr.lift; sx *= dr.sx; sy *= dr.sy; }
  for (const [j, f0, h] of HOPS) if (j === d) { const o = hop(f, f0, h); lift += o.lift; sx *= o.sx; sy *= o.sy; }
  let eye: Eye = "open";
  if (s && f < CUE.ret && s.day === d && s.line === 6) eye = s.win ? "wide" : (s.profit ?? 0) < 0 ? "worried" : "open";
  if (f >= CUE.ret) eye = "happy"; else if (eye === "open" && (f + d * 41) % 97 < 4) eye = "blink";
  return { x: SX(d), y: DUCK_Y, k: DUCK_K, lift, sx, sy, tilt: 0.025 * Math.sin((2 * Math.PI * f) / 60 + d * 1.3 + 1), eye, look: 0.4, label: String(PRICES[d]), seed: 12100 + d * 100, mouth: QUACKS.some(([q, j]) => j === d && f >= q && f < q + 9) ? 1 : 0 };
};

// ---------------------------------------------------------------- sprites
type Kind = "set" | "buy" | "sell" | "best";
const KCOL: Record<Kind, string> = { set: "#cfc3a6", buy: C.rose, sell: C.teal, best: C.gold };
const barSprite = (env: Env, d: number, kind: Kind) => { const h = barH(d); return sprite(env, `mpbar:${d}:${kind}`, 100, h + 40, 50, h + 10, (g) => {
  const col = mix(KCOL[kind], "#efe6d3", kind === "set" ? 0 : 0.15);
  wax(g, () => crayonShape(g, roundRect(-32, -h, 64, h, 10, 3), { col, shade: darker(col, 0.25), seed: 12700 + d, lw: 2.2, gap: 4.4, w: 4.6 }));
  text(g, String(PRICES[d]), 0, -h + 22, { size: 26, weight: 700, fill: kind === "set" ? C.ink : "#f6f0e2" });
}); };

// ---------------------------------------------------------------- one frame
const draw = (ctx: Ctx, f: number, env: Env) => {
  const g: Gfx = stageBegin(ctx, env, f), s = f < CUE.ret ? snapAt(f) : undefined;
  if (s?.buy !== undefined) waterRing(g, SX(s.buy), DUCK_Y + 12, DUCK_K, C.rose, ease.out(prog(f, s.f, 8)), 1500 + s.buy);
  if (s?.day !== undefined && s.day !== s.buy) waterRing(g, SX(s.day), DUCK_Y + 12, DUCK_K, C.teal, ease.out(prog(f, s.f, 8)), 1520 + s.day);
  const best = f >= CUE.ret ? SIM[SIM.length - 1].bestDay : undefined;
  if (best) best.forEach((d, k) => waterRing(g, SX(d), DUCK_Y + 12, DUCK_K, C.gold, ease.out(prog(f, CUE.ret + k * 6, 8)), 1560 + d));
  PRICES.forEach((_, d) => { if (drop(f, CUE.land[d]) !== null) drawDuck(ctx, env, g, pose(d, f), f); });
  CUE.land.forEach((l, d) => splash(g, SX(d), DUCK_Y + 12, (f - l) / 18, 1100 + d, 0.7));
  // the price chart: bars grow in, buy rose, sell teal, the winning pair gold at the end
  for (let d = 0; d < N; d++) {
    const q = ease.spring(prog(f, CUE.chart + d * 5, 16)); if (q <= 0) continue;
    const kind: Kind = best?.includes(d) ? "best" : s?.day === d ? "sell" : s?.buy === d ? "buy" : "set";
    blit(ctx, env, barSprite(env, d, kind), SX(d), BASE_Y + 3 * Math.sin(f * 0.1 + d * 0.8), 1, q);
  }
  // today's profit: a dashed line at the buy price, and an arrow up (or down) to the sell price
  if (s?.line === 6 && s.day !== undefined && s.buy !== undefined) {
    const q = ease.out(prog(f, s.f, 12)), y0 = top(s.buy), y1 = top(s.day), xa = SX(Math.min(s.buy, s.day)) - 40, xb = SX(s.day) + 46, col = (s.profit ?? 0) > 0 ? darker(C.teal, 0.3) : darker(C.rose, 0.2);
    g.group("plain", () => {
      const c = g.cur; c.save(); c.globalAlpha = q; c.strokeStyle = col; c.lineWidth = 4; c.setLineDash([12, 9]); c.beginPath(); c.moveTo(xa, y0); c.lineTo(lerp(xa, xb, q), y0); c.stroke(); c.setLineDash([]);
      const ye = lerp(y0, y1, ease.out(prog(f, s.f + 10, 14))); c.lineWidth = 6; c.beginPath(); c.moveTo(xb, y0); c.lineTo(xb, ye); c.stroke();
      if (Math.abs(y1 - y0) > 8) { const dir = y1 < y0 ? 1 : -1; c.fillStyle = col; c.beginPath(); c.moveTo(xb - 12, ye + 14 * dir); c.lineTo(xb + 12, ye + 14 * dir); c.lineTo(xb, ye); c.fill(); }
      c.restore(); g.touch(xa - 4, Math.min(y0, y1) - 20, xb + 70, Math.max(y0, y1) + 20);
      const p = s.profit ?? 0; text(g, (p > 0 ? "+" : "") + p, xb + 30, (y0 + y1) / 2, { size: 30, weight: 700, fill: col, align: "left", alpha: prog(f, s.f + 18, 8) });
    });
  }
  // markers on the bars
  if (s && f < CUE.ret) {
    const prev = SIM[SIM.indexOf(s) - 1] ?? s, t = ease.inOut(prog(f, s.f, 12));
    for (const [name, a, b, col] of [["buy", prev.buy, s.buy, C.rose], ["sell", prev.day, s.day, C.teal]] as [string, number | undefined, number | undefined, string][]) {
      if (b === undefined) continue;
      const both = s.buy === s.day, side = both ? (name === "buy" ? -34 : 34) : 0, from = a ?? b;
      const x = lerp(SX(from), SX(b), t) + side, y = lerp(top(from), top(b), t) - 6 + 4 * Math.sin(f * 0.16 + name.length);
      drawMarker(ctx, env, x, y, name, 0.82 * (a === undefined ? ease.back(prog(f, s.f, 10)) : 1), col);
    }
  }
  // the best profit so far, carried above the chart
  if (s && s.line >= 3) g.group("plain", () => { const fresh = s.win ? 1 - prog(f, s.f + 10, 30) : 0; text(g, `max_profit = ${s.best}`, 540, BEST_Y, { size: 40 + 8 * fresh, weight: 700, fill: C.ink, alpha: prog(f, SIM[0].f, 10) }); });
  if (s?.win) drawCheck(ctx, env, 780, BEST_Y - 4, ease.back(prog(f, s.f + 8, 10)) * 0.7);
  const note = f >= CUE.ret && f < CUE.print ? SIM[SIM.length - 1] : s;
  if (note && f < CUE.print) g.group("plain", () => { const c = g.cur, h = note.sub ? 104 : 62; c.save(); c.globalAlpha = 0.82; c.fillStyle = "#efe6d3"; c.beginPath(); c.roundRect(110, NOTE_Y - 34, 860, h, 20); c.fill(); c.restore(); g.touch(110, NOTE_Y - 34, 970, NOTE_Y - 34 + h); text(g, note.note, 540, NOTE_Y, { size: 36, weight: 700, fill: C.ink }); if (note.sub) text(g, note.sub, 540, NOTE_Y + 42, { size: 26, weight: 500, fill: C.inkSoft }); });
  stageEnd(ctx, env, f, { print: CUE.print, party: CUE.party, title: "maxProfit returns", value: String(EXPECTED), time: ["O(n)", "one pass over the prices"], space: ["O(1)", "just two numbers"], y: 520 });
  stageTitle(ctx, env, f, TITLE, SUB, [{ parts: [["prices = ", C.ink], [`[${PRICES.join(", ")}]`, C.rose]], from: CUE.prices, to: CUE.print }]);
  stagePanel(g, f, { code: CODE, layout: PANEL, run: RUN, watch: WATCH, show: CUE.prices, ret: CUE.ret, print: CUE.print, output: String(EXPECTED) });
};

const cues: SfxCue[] = [
  ...CUE.land.map((f, d) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${d} lands`, gainDb: d % 2 ? -1 : 1 } as SfxCue)),
  { frame: CUE.prices + 2, kind: "pop", variant: "tiny", label: "prices" },
  ...SIM.flatMap((x, k): SfxCue[] => x.win ? [{ frame: x.f + 8, kind: "chime", variant: "sparkle", label: `new best (${k})`, gainDb: 2 }]
    : x.line === 5 ? [{ frame: x.f + 2, kind: "tick", variant: "soft", label: `next day (${k})`, gainDb: 5 }]
    : x.line === 7 && x.sub?.includes("cheaper") ? [{ frame: x.f + 4, kind: "pop", variant: "cork", label: `cheaper buy (${k})` }] : []),
  { frame: CUE.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" }, { frame: CUE.ret + 2, kind: "chime", variant: "bell", label: "return" },
  { frame: CUE.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" }, { frame: CUE.print + 124, kind: "pop", variant: "pop", label: "complexity card" },
];
export const maxProfit: Film = {
  meta: { title: `${TITLE} · duckcode`, W: 1080, H: 1920, fps: FPS, bpm: BPM, durationFrames: DURATION, kind: "explainer", poster: WINS[1].f + 20, holds: [[CUE.party + 150, DURATION, "the complexity card, held for reading"]],
    captions: [{ from: CUE.prices, to: SIM[0].f, text: `prices = [${PRICES.join(", ")}]` }, { from: SIM[0].f, to: CUE.ret, text: "Keep the cheapest buy so far; each day, check what selling would earn." }, { from: CUE.ret, to: DURATION, text: `Output: ${EXPECTED}. Time O(n), space O(1).` }] },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "maxProfit", start: 0, end: DURATION, draw }],
  audio: duckSound({ fps: FPS, frames: DURATION, theme: themeFor(LC, TITLE), cues, quacks: QUACKS, voices: [2, 0, -1, -2, 1, -4], seed: 121 }),
};
