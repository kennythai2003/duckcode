// FX · crayon props for the duck films: speech bubbles, the "seen" signpost, the magnifier, the
// lily-pad entries, sparkles, a check mark, splashes, index tags, water rings and the answer card.
// Anything that pops or moves is a sprite drawn once and blitted, so its wax never swims.
import { Gfx, rng, type Ctx, type Env, type P } from "../core";
import { fillShape, smooth } from "../gallery";
import { C, PAPER, blit, cline, closed, crayonShape, darker, scribble, sprite, wax } from "./crayon";
import { ellipse, measure, roundRect, text } from "./kit";
import { padShapeP } from "./pond";

export type Parts = [string, string][];
const key = (parts: Parts) => parts.map((p) => p.join("|")).join("~");

// a speech bubble: a paper box worked over with a pale crayon, the contour twice, a tail to the speaker
export const drawBubble = (ctx: Ctx, env: Env, cx: number, cy: number, parts: Parts, to: P, q: number, seed: number, size = 38) => {
  if (q <= 0) return;
  const tdx = Math.round(to[0] - cx), tdy = Math.round(to[1] - cy);
  const s = sprite(env, `bubble:${key(parts)}:${tdx}:${tdy}:${size}`, 900, 400, 450, 160, (g) => {
    const full = parts.map((p) => p[0]).join(""), w = measure(g, full, size, 700) + 60, h = size + 46, x0 = -w / 2, y0 = -h / 2;
    const tx = Math.max(x0 + 40, Math.min(x0 + w - 40, tdx));
    const box = roundRect(x0, y0, w, h, 22, 6), tail: P[] = [[tx - 16, y0 + h - 2], [tdx, tdy], [tx + 14, y0 + h - 2]];
    wax(g, () => {
      fillShape(g, box.map(([x, y]) => [x + 6, y + 9] as P), C.deepest, 0.25);
      fillShape(g, tail, "#f4ecdb"); fillShape(g, box, "#f4ecdb");
      scribble(g, box, "#e2d6bd", { angle: 0.5, gap: 7, w: 4.5, alpha: 0.5, seed, keep: (x, y) => x * 0.004 + y * 0.03 > 0.2 });
      cline(g, closed(box, 2), C.ink, 2.6, seed + 1, 0.92, 0.6);
      cline(g, [[tx - 16, y0 + h - 1], [tdx, tdy]], C.ink, 2.4, seed + 2, 0.92, 0.4); cline(g, [[tx + 14, y0 + h - 1], [tdx, tdy]], C.ink, 2.4, seed + 3, 0.92, 0.4);
    });
    let x = -measure(g, full, size, 700) / 2;
    parts.forEach(([t, col]) => { text(g, t, x, 2, { size, weight: 700, fill: col, align: "left" }); x += measure(g, t, size, 700); });
  });
  blit(ctx, env, s, cx, cy, q, q);
};

// the dictionary's signpost: a little wooden board on a post, stuck in the pond
export const drawSign = (ctx: Ctx, env: Env, x: number, y: number, label: string, q: number) => {
  const s = sprite(env, `sign:${label}`, 220, 190, 110, 100, (g) => {
    wax(g, () => {
      cline(g, [[0, -10], [1, 30], [0, 72]], C.woodS, 9, 701, 0.95, 0.3);
      crayonShape(g, roundRect(-86, -66, 172, 70, 10, 4), { col: C.wood, shade: C.woodS, seed: 702, lw: 2.6 });
      cline(g, closed(ellipse(0, 74, 22, 6, 18), 1), C.glint, 2, 703, 0.8);
    });
    text(g, label, 0, -30, { size: 36, weight: 700, fill: "#f4ecdb" });
  });
  blit(ctx, env, s, x, y, q, q);
};

// a magnifying glass, for "is it in there?"
export const drawMagnifier = (ctx: Ctx, env: Env, x: number, y: number, q: number, rot = -0.3) => {
  const s = sprite(env, "magnifier", 200, 200, 70, 70, (g) => {
    wax(g, () => {
      const handle = smooth([[30, 30], [72, 72], [80, 64], [38, 22]], true, 3);
      crayonShape(g, handle, { col: C.wood, shade: C.woodS, seed: 1501, lw: 2.2, gap: 3.6, w: 4 });
      const rimO = ellipse(0, 0, 46, 46, 34), lens = ellipse(0, 0, 35, 35, 30);
      crayonShape(g, rimO, { col: "#8c8f96", shade: "#5f6168", seed: 1502, lw: 2.4, gap: 3.6, w: 4.4 });
      fillShape(g, lens, "#dfe9e8"); scribble(g, lens, "#c3d6d8", { angle: 0.8, gap: 6, w: 4, alpha: 0.5, seed: 1503, keep: (x, y) => x + y > 0 });
      cline(g, [[-20, -8], [-8, -22]], "#fbf7ec", 3.4, 1504, 0.9, 0.3); cline(g, closed(lens, 2), C.ink, 1.8, 1505, 0.85, 0.4);
    });
  });
  blit(ctx, env, s, x, y, q, q, rot + 0.3);
};

// a lily pad holding one dictionary entry ("2 : 0")
export const drawEntry = (ctx: Ctx, env: Env, x: number, y: number, label: string, q: number, glow = 0, seed = 800) => {
  const pad = (col: string, k: string) => sprite(env, `entry:${label}:${k}`, 260, 140, 130, 60, (g) => {
    const pts = padShapeP(0, 0, 96, 40, 2.4);
    wax(g, () => {
      fillShape(g, pts.map(([px, py]) => [px + 5, py + 9] as P), C.deepest, 0.3);
      crayonShape(g, pts, { col, shade: C.padS, seed, lw: 2.4, gap: 4.4, w: 5, every: 2 });
    });
    text(g, label, -6, -2, { size: 38, weight: 700, fill: "#f4ecdb", stroke: C.ink, sw: 4 });
  });
  blit(ctx, env, pad(C.pad, "plain"), x, y, q, q);
  if (glow > 0) blit(ctx, env, pad("#c9b45a", "gold"), x, y, q, q, 0, glow);
};

// a four-point crayon sparkle
export const drawSparkle = (ctx: Ctx, env: Env, x: number, y: number, r: number, rot = 0) => {
  if (r <= 0.5) return;
  const s = sprite(env, "sparkle", 80, 80, 40, 40, (g) => {
    const pts: P[] = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? 9 : 30; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    wax(g, () => crayonShape(g, smooth(pts, true, 3), { col: "#e3c66f", shade: darker("#e3c66f", 0.25), seed: 1620, lw: 1.8, gap: 3.2, w: 3.6, every: 1 }));
  });
  blit(ctx, env, s, x, y, r / 30, r / 30, rot);
};

// a check mark, crayon green, for "found it"
export const drawCheck = (ctx: Ctx, env: Env, x: number, y: number, q: number) => {
  const s = sprite(env, "check", 120, 120, 60, 60, (g) => wax(g, () => { cline(g, [[-34, 0], [-12, 26], [36, -32]], darker(C.teal, 0.25), 13, 1630, 0.95, 0.6); cline(g, [[-34, 0], [-12, 26], [36, -32]], C.teal, 8, 1631, 0.95, 0.6); }));
  blit(ctx, env, s, x, y, q, q);
};
// a cross, for "not there"
export const drawCross = (ctx: Ctx, env: Env, x: number, y: number, q: number) => {
  const s = sprite(env, "cross", 110, 110, 55, 55, (g) => wax(g, () => { cline(g, [[-26, -26], [26, 26]], C.rose, 9, 1640, 0.9, 0.6); cline(g, [[26, -26], [-26, 26]], C.rose, 9, 1641, 0.9, 0.6); }));
  blit(ctx, env, s, x, y, q, q);
};

// a splash: pale droplets thrown up and out, a ring spreading on the skin
export const splash = (g: Gfx, x: number, y: number, t: number, seed: number, k = 1) => {
  if (t <= 0 || t >= 1) return;
  const r = rng(seed);
  g.group("plain", () => {
    cline(g, closed(ellipse(x, y, (40 + 110 * t) * k, (8 + 22 * t) * k, 30), 1), C.glint, (4 * (1 - t) + 1) * k, seed + 1, 0.9 * (1 - t), 0.5);
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.2, v = (90 + r() * 70) * k, px = x + Math.cos(a) * v * t * 1.1, py = y + Math.sin(a) * v * t * 1.6 + 260 * t * t * k, rr = (6 + r() * 5) * (1 - t * 0.6) * k;
      fillShape(g, ellipse(px, py, rr, rr * 1.15, 12), "#dbe7e4", 0.9); cline(g, closed(ellipse(px, py, rr, rr * 1.15, 12), 1), C.deep, 1.2, seed + 10 + i, 0.7, 0.2);
    }
  }, { textures: ["pencilTooth"] });
};

// an index tag under a duck: a small plaque floating on the water
export const drawTag = (ctx: Ctx, env: Env, x: number, y: number, label: string, q: number, hot = 0) => {
  const tag = (col: string, k: string) => sprite(env, `tag:${label}:${k}`, 90, 70, 45, 35, (g) => {
    wax(g, () => crayonShape(g, roundRect(-23, -19, 46, 38, 12, 4), { col, shade: darker(col, 0.3), seed: 600, lw: 2, gap: 3.6, w: 4 }));
    text(g, label, 0, 1, { size: 24, weight: 700, fill: "#f6f0e2" });
  });
  blit(ctx, env, tag(C.deep, "cold"), x, y, q, q);
  if (hot > 0) blit(ctx, env, tag(C.gold, "hot"), x, y, q, q, 0, hot);
};

// a ring on the water around a duck: rose = the duck being asked, teal = asked, gold = the answer
export const waterRing = (g: Gfx, x: number, y: number, k: number, col: string, q: number, seed: number) => {
  if (q <= 0) return;
  g.group("plain", () => {
    const o = ellipse(x, y, 112 * k * (0.8 + 0.2 * q), 21 * k * (0.8 + 0.2 * q), 40);
    cline(g, closed(o, 1), col, 9 * k, seed, 0.85, 0.5);
    cline(g, closed(o, 1), darker(col, 0.3), 2.4 * k, seed + 1, 0.7, 0.8);
  }, { alpha: q, textures: ["pencilTooth"] });
};

// the answer card: what the function returns, on a paper card
export const drawCard = (ctx: Ctx, env: Env, x: number, y: number, title: string, value: string, q: number) => {
  const s = sprite(env, `card:${title}:${value}`, 520, 260, 260, 130, (g) => {
    const box = roundRect(-200, -86, 400, 172, 22, 6);
    wax(g, () => {
      fillShape(g, box.map(([px, py]) => [px + 8, py + 12] as P), C.deepest, 0.3);
      crayonShape(g, box, { col: "#f1e6cc", shade: "#d4c4a2", seed: 1800, lw: 2.8, gap: 6, w: 5 });
      cline(g, [[-150, 50], [-40, 54], [150, 48]], C.gold, 6, 1801, 0.85, 1);
    });
    text(g, title, 0, -46, { size: 28, weight: 500, fill: C.inkSoft });
    text(g, value, 0, 8, { size: value.length > 12 ? 40 : value.length > 7 ? 56 : 72, weight: 700, fill: C.ink });
  });
  blit(ctx, env, s, x, y, q, q);
};
export { PAPER };

// a pointer marker for indices on a tape or array (i, j, l, r, lo, hi): a big coloured crayon tag with
// its name, and an arrow tip pointing down at the cell. Distinct colours per pointer; never a tiny pennant.
export const MARKER_COL: Record<string, string> = { i: C.rose, j: C.teal, l: C.rose, r: C.teal, lo: C.rose, hi: C.teal, mid: C.gold, k: C.gold };
export const drawMarker = (ctx: Ctx, env: Env, x: number, tipY: number, name: string, q = 1, col = MARKER_COL[name] ?? C.gold) => {
  const s = sprite(env, `marker:${name}:${col}`, 120, 130, 60, 104, (g) => {
    const w = Math.max(56, 26 + name.length * 22), box = roundRect(-w / 2, -96, w, 58, 16, 5), tip: P[] = [[-14, -40], [14, -40], [0, -2]];
    wax(g, () => { crayonShape(g, tip, { col, shade: darker(col, 0.3), seed: 7100, lw: 2.2, gap: 3.4, w: 4, every: 1 }); crayonShape(g, box, { col, shade: darker(col, 0.3), seed: 7101, lw: 2.6, gap: 3.8, w: 4.4 }); });
    text(g, name, 0, -66, { size: 38, weight: 700, fill: "#f6f0e2", stroke: darker(col, 0.45), sw: 4 });
  });
  blit(ctx, env, s, x, tipY, q, q);
};
