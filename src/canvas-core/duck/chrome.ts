// CHROME: the title block and the parameters pill every duck film opens with.
import type { Env } from "../core";
import { C, cline, crayonShape, sprite, wax } from "./crayon";
import { measure, roundRect, text } from "./kit";

export const titleSprite = (env: Env, title: string, sub: string) => sprite(env, `title:${title}:${sub}`, 900, 240, 450, 120, (g) => {
  const size = Math.min(title.length > 10 ? 92 : 104, Math.floor((104 * 840) / measure(g, title, 104, 700)));
  text(g, title, 0, -14, { size, weight: 700, fill: C.ink });
  const w = Math.min(380, measure(g, title, 100, 700) * 0.45);
  wax(g, () => cline(g, [[-w, 46], [-w * 0.2, 52], [w, 44]], C.gold, 9, 1950, 0.85, 1.4));
  text(g, sub, 0, 88, { size: 34, weight: 500, fill: C.inkSoft });
});
// parts: [text, colour][] laid left to right inside a crayon pill
export const pillSprite = (env: Env, parts: [string, string][]) => sprite(env, `pill:${parts.map((p) => p.join("|")).join("~")}`, 760, 120, 380, 60, (g) => {
  const ws = parts.map(([t]) => measure(g, t, 36, 700)), w = ws.reduce((a, b) => a + b, 0) + 64;
  wax(g, () => crayonShape(g, roundRect(-w / 2, -34, w, 68, 30, 6), { col: "#efe4cc", shade: "#cdbf9f", seed: 1900, lw: 2.4, gap: 5, w: 4.6 }));
  let x = -w / 2 + 32; parts.forEach(([t, col], i) => { text(g, t, x, 2, { size: 36, weight: 700, fill: col, align: "left" }); x += ws[i]; });
});
