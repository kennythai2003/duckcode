// PFP · the duckcode channel avatar: one crayon duck wearing "</>" on a pond-blue disc. 1080x1080 still.
import { Gfx, type Ctx, type Env } from "./core";
import type { Film } from "./film";
import { C, CRAYON_M, PAPER, cline, closed, scribble, wax } from "./duck/crayon";
import { drawDuck } from "./duck/duck";
import { FONTS, ellipse } from "./duck/kit";

const draw = (ctx: Ctx, _f: number, env: Env) => {
  const g = new Gfx(ctx, env, 0, CRAYON_M);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1080, 1080);
  const disc = ellipse(540, 540, 500, 500, 60), water = disc.filter(([, y]) => y > 600);
  wax(g, () => {
    scribble(g, disc, C.sky, { angle: 0.38, gap: 7, w: 6, alpha: 0.7, seed: 10 });
    scribble(g, disc, C.water, { angle: 0.06, gap: 6, w: 6.5, alpha: 0.9, seed: 11, keep: (_x, y) => y > 640 });
    cline(g, closed(disc, 2), C.ink, 3, 12, 0.9, 1);
  });
  void water;
  drawDuck(ctx, env, g, { x: 520, y: 660, k: 2.6, lift: 0, eye: "open", look: 0.3, label: "</>", seed: 77 }, 0);
  g.paper("paper", 0.06);
};
export const pfp: Film = { meta: { title: "duckcode pfp", W: 1080, H: 1080, fps: 30, bpm: 120, durationFrames: 1 }, assets: { images: {}, fonts: FONTS }, shots: [{ id: "pfp", start: 0, end: 1, draw }] };
