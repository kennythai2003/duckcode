// THUMBNAIL BACKGROUNDS · three clean duckcode plates (frame 0, 1, 2) for the thumbnail generator: the pond
// with ducks low in the frame, so the top two-thirds stays free for the title text.
import type { Ctx, Env, Gfx, P } from "./core";
import type { Film } from "./film";
import { drawDuck } from "./duck/duck";
import { drawMarker, waterRing } from "./duck/fx";
import { C, blit, crayonShape, darker, sprite, wax } from "./duck/crayon";
import { FONTS, roundRect, text } from "./duck/kit";
import { drawNone, nextArrow } from "./duck/list";
import { stageBegin } from "./duck/stage";
import { mix } from "./gallery";

const Y = 1500;
const duck = (ctx: Ctx, env: Env, g: Gfx, x: number, y: number, k: number, label: string, i: number, eye: "open" | "happy" = "happy") =>
  drawDuck(ctx, env, g, { x, y, k, lift: 0, sx: 1, sy: 1, tilt: 0.03 * Math.sin(i * 1.7), eye, look: 0.4, label, seed: 7700 + i * 100, mouth: 0 }, 0);
const bar = (env: Env, v: number, gold: boolean) => { const h = 50 + v * 34; return sprite(env, `tb:${v}:${gold}`, 110, h + 40, 55, h + 10, (g) => {
  const col = gold ? mix(C.gold, "#efe6d3", 0.15) : "#cfc3a6";
  wax(g, () => crayonShape(g, roundRect(-34, -h, 68, h, 10, 3), { col, shade: darker(col, 0.25), seed: 7900 + v, lw: 2.2, gap: 4.4, w: 4.6 }));
  text(g, String(v), 0, -h + 24, { size: 28, weight: 700, fill: gold ? "#f6f0e2" : C.ink });
}); };

const draw = (ctx: Ctx, f: number, env: Env) => {
  const g = stageBegin(ctx, env, f);
  if (f === 0) { // a row of ducks, the winner ringed in gold
    [2, 7, 11, 15, 4].forEach((v, i) => { const x = 140 + i * 200; if (i === 2) waterRing(g, x, Y + 14, 0.85, C.gold, 1, 7701); duck(ctx, env, g, x, Y, 0.85, String(v), i, i === 2 ? "happy" : "open"); });
  } else if (f === 1) { // a linked list
    const xs = [150, 345, 540, 735, 930], a = (x: number): P => [x, Y + 70];
    xs.forEach((x, i) => nextArrow(g, a(x), i < 4 ? a(xs[i + 1]) : [1040, Y + 70], 1, C.ink, 0.12, i < 4 ? 40 : 12));
    xs.forEach((x, i) => duck(ctx, env, g, x, Y, 0.76, String(i + 1), i, "open"));
    drawMarker(ctx, env, 345, Y + 120, "curr", 0.95, C.teal, true); drawMarker(ctx, env, 150, Y + 120, "prev", 0.95, C.rose, true);
  } else { // a rotated array as a crayon bar chart
    const vals = [4, 5, 6, 7, 0, 1, 2];
    vals.forEach((v, i) => blit(ctx, env, bar(env, v, v === 0), 120 + i * 140, 1830, 1, 1));
    vals.forEach((v, i) => duck(ctx, env, g, 120 + i * 140, 1440, 0.64, String(v), i, v === 0 ? "happy" : "open"));
  }
};
export const thumbBg: Film = {
  meta: { title: "duckcode thumbnail plates", W: 1080, H: 1920, fps: 30, bpm: 120, durationFrames: 3, kind: "still" as never },
  assets: { images: {}, fonts: FONTS },
  shots: [{ id: "thumbBg", start: 0, end: 3, draw }],
};
