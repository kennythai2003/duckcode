// LIST: linked-list pieces for the duck films. A node is a duck; its `next` is an ink arrow on the water
// under it (plain strokes, so it can glide when a pointer is re-aimed); None is a small plaque; pointer
// variables are upward markers under the arrows that stack when two point at the same node.
import type { Ctx, Env, Gfx, P } from "../core";
import { lerp } from "../gallery";
import { C, blit, crayonShape, sprite, wax } from "./crayon";
import { drawMarker } from "./fx";
import { ease, roundRect, text } from "./kit";

// a `next` arrow from a to b, cut short at both ends, sagging downward in proportion to its length
export const nextArrow = (g: Gfx, a: P, b: P, q = 1, col: string = C.ink, sag = 0.12, cut = 34) => {
  if (q <= 0) return;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  const p0: P = [a[0] + ux * cut, a[1] + uy * cut], p1: P = [b[0] - ux * cut, b[1] - uy * cut], c: P = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + sag * Math.abs(dx)];
  g.group("plain", () => {
    const x = g.cur; x.save(); x.globalAlpha = q; x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 6; x.lineCap = "round";
    x.beginPath(); x.moveTo(p0[0], p0[1]); x.quadraticCurveTo(c[0], c[1], p1[0], p1[1]); x.stroke();
    const tx = p1[0] - c[0], ty = p1[1] - c[1], tl = Math.hypot(tx, ty) || 1, hx = tx / tl, hy = ty / tl;
    x.beginPath(); x.moveTo(p1[0] + hx * 6, p1[1] + hy * 6); x.lineTo(p1[0] - hx * 16 - hy * 10, p1[1] - hy * 16 + hx * 10); x.lineTo(p1[0] - hx * 16 + hy * 10, p1[1] - hy * 16 - hx * 10); x.closePath(); x.fill();
    x.restore(); g.touch(Math.min(p0[0], p1[0], c[0]) - 20, Math.min(p0[1], p1[1], c[1]) - 20, Math.max(p0[0], p1[0], c[0]) + 20, Math.max(p0[1], p1[1], c[1]) + 20);
  });
};

// the None plaque
export const drawNone = (ctx: Ctx, env: Env, x: number, y: number, q = 1, label = "None") => {
  const s = sprite(env, `none:${label}`, 140, 70, 70, 35, (g) => {
    wax(g, () => crayonShape(g, roundRect(-44, -20, 88, 40, 12, 4), { col: "#cfc6b2", shade: "#b5aa92", seed: 9100, lw: 2, gap: 3.8, w: 4 }));
    text(g, label, 0, 1, { size: 22, weight: 700, fill: C.inkSoft });
  });
  if (q > 0) blit(ctx, env, s, x, y, q, q);
};

// pointer markers under the nodes, pointing up. `now` and `before` map a name to an x (undefined = hidden);
// markers on the same x stack downward. `t` is the tween from before to now.
export const markersUp = (ctx: Ctx, env: Env, f: number, now: [string, number | undefined][], before: [string, number | undefined][], t: number, y: number, cols: Record<string, string>, scale = 0.8) => {
  const live = now.filter(([, x]) => x !== undefined) as [string, number][];
  live.forEach(([name, x], k) => {
    const level = live.slice(0, k).filter(([, x2]) => Math.abs(x2 - x) < 120).length, px = before.find(([n]) => n === name)?.[1];
    const xx = px === undefined ? x : lerp(px, x, t), q = px === undefined ? ease.back(Math.min(1, t * 1.4)) : 1;
    drawMarker(ctx, env, xx, y + level * 66 + 4 * Math.sin(f * 0.16 + k * 1.7), name, scale * q, cols[name], true);
  });
};
