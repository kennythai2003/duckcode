// THE POND · crayon. Late afternoon, muted: a dusty sky scribbled over warm paper, a low sun, two
// soft clouds, rolling hills in sage greens with a darker crayon on their shade sides, round trees,
// the ducks' little house on stilts at the water's edge, and the pond in three blues worked
// sideways, the deep water darker toward the viewer. The plate is drawn once and cached; the
// water's glints are drawn every frame.
import { Gfx, rng, type Env, type Layer, type P } from "../core";
import { blob, fillShape, inside, mix, smooth } from "../gallery";
import { C, CRAYON_M, PAPER, cline, closed, crayonShape, darker, scribble, wax } from "./crayon";
import { ellipse, roundRect } from "./kit";

export const POND = { HORIZON: 560 };

const sky = (g: Gfx, W: number) => {
  wax(g, () => {
    const all: P[] = [[0, 0], [W, 0], [W, POND.HORIZON + 10], [0, POND.HORIZON + 10]];
    scribble(g, all, C.sky, { angle: 0.38, gap: 7, w: 6, alpha: 0.6, seed: 10, over: 1 });
    scribble(g, all, C.skyD, { angle: -0.5, gap: 12, w: 5, alpha: 0.4, seed: 11, over: 1, keep: (_x, y) => y < 260 });
    // a low sun, top right, worked in a pale ochre
    const sun = blob(900, 150, 58, 56, 20, 0.05, 16);
    fillShape(g, sun, PAPER); scribble(g, sun, C.sun, { angle: 0.9, gap: 4.5, w: 5, alpha: 0.85, seed: 21 }); scribble(g, sun, darker(C.sun, 0.25), { angle: -0.7, gap: 7, w: 4, alpha: 0.4, seed: 22, keep: (x, y) => (x - 900) + (y - 150) > 20 });
    cline(g, closed(sun), darker(C.sun, 0.35), 1.8, 23, 0.8);
  });
  const cloud = (cx: number, cy: number, s: number, seed: number) => {
    const r = rng(seed), puffs: P[][] = [];
    for (let i = 0; i < 5; i++) puffs.push(blob(cx + (i - 2) * 34 * s + (r() - 0.5) * 10, cy - Math.sin((i / 4) * Math.PI) * 26 * s, (34 + r() * 14) * s, (26 + r() * 8) * s, seed + i, 0.08, 12));
    wax(g, () => {
      puffs.forEach((p) => fillShape(g, p, C.cloud));
      puffs.forEach((p, i) => scribble(g, p, C.cloudS, { angle: 0.2, gap: 6, w: 4.5, alpha: 0.5, seed: seed + 10 + i, keep: (_x, y) => y > cy + 4 * s }));
      puffs.forEach((p, i) => {
        let run: P[] = []; const runs: P[][] = [];
        p.forEach((q) => { const hid = puffs.some((o, j) => j !== i && inside(o, q[0], q[1])); if (!hid) run.push(q); else if (run.length) { runs.push(run); run = []; } });
        if (run.length) runs.push(run);
        runs.filter((x) => x.length > 3).forEach((x, kk) => cline(g, x.filter((_, m) => m % 3 === 0 || m === x.length - 1), "#8b9ca3", 1.5, seed + 20 + i * 5 + kk, 0.75, 0.9));
      });
    });
  };
  cloud(210, 150, 1, 40); cloud(640, 96, 0.75, 60);
};

const hills = (g: Gfx, W: number) => {
  const H = POND.HORIZON;
  const ridge = (y0: number, amp: number, ph: number): P[] => Array.from({ length: 25 }, (_, i) => [-40 + ((W + 80) * i) / 24, y0 + Math.sin(i * 0.42 + ph) * amp + Math.sin(i * 0.17 + ph * 2) * amp * 0.8] as P);
  const back = ridge(430, 26, 0.6), front = ridge(494, 20, 2.4);
  const yOn = (r: P[], x: number) => { for (let i = 1; i < r.length; i++) if (x <= r[i][0]) { const t = (x - r[i - 1][0]) / (r[i][0] - r[i - 1][0]); return r[i - 1][1] + (r[i][1] - r[i - 1][1]) * t; } return r[r.length - 1][1]; };
  wax(g, () => {
    const bs: P[] = [...back, [W + 40, H + 10], [-40, H + 10]];
    fillShape(g, bs, PAPER); scribble(g, bs, C.hill, { angle: 0.15, gap: 5.5, w: 6, alpha: 0.88, seed: 400, over: 1 });
    scribble(g, bs, C.hillS, { angle: -0.4, gap: 8, w: 5, alpha: 0.5, seed: 401, over: 1, keep: (x, y) => y > 470 + Math.sin(x * 0.01) * 14 });
    cline(g, back.filter((_, i) => i % 2 === 0), darker(C.hillS, 0.3), 2, 402, 0.85, 1);
  });
  [[250, 0.9], [320, 1.1], [770, 1.15], [850, 0.9], [1010, 1.05]].forEach(([x, s], i) => wax(g, () => {
    const yb = yOn(back, x) + 8, h = 40 * s;
    cline(g, [[x, yb + 4], [x + 1, yb - h * 0.6], [x, yb - h]], C.trunk, 4 * s, 410 + i, 0.95, 0.4);
    const crown = blob(x, yb - h - 26 * s, 30 * s, 34 * s, 420 + i, 0.12, 14);
    crayonShape(g, crown, { col: C.tree, shade: C.treeS, seed: 430 + i * 7, lw: 2, gap: 4, w: 4.5 });
  }));
  wax(g, () => {
    const fs: P[] = [...front, [W + 40, H + 10], [-40, H + 10]];
    fillShape(g, fs, PAPER); scribble(g, fs, C.hill2, { angle: -0.12, gap: 5, w: 6.5, alpha: 0.9, seed: 460, over: 1 });
    scribble(g, fs, C.hill2S, { angle: 0.5, gap: 7, w: 5, alpha: 0.5, seed: 461, over: 1, keep: (_x, y) => y > 528 });
    cline(g, front.filter((_, i) => i % 2 === 0), darker(C.hill2S, 0.3), 2.2, 463, 0.9, 1);
    const r = rng(464); for (let i = 0; i < 50; i++) { const x = r() * W, y = yOn(front, x) + 10 + r() * 40; if (y < H - 4) cline(g, [[x, y], [x + 2, y - 6 - r() * 7]], C.hill2S, 1.1, 470 + i, 0.75, 0.3); }
  });
};

const water = (g: Gfx, W: number, H: number) => {
  const y0 = POND.HORIZON, wave = (y: number, amp: number, ph: number): P[] => Array.from({ length: 25 }, (_, i) => [(W * i) / 24, y + Math.sin(i * 0.8 + ph) * amp] as P);
  wax(g, () => {
    const all: P[] = [[0, y0], [W, y0], [W, H], [0, H]];
    fillShape(g, all, PAPER);
    scribble(g, all, C.water, { angle: 0.06, gap: 6, w: 6.5, alpha: 0.85, seed: 500, over: 1 });
    scribble(g, all, C.far, { angle: -0.05, gap: 6, w: 6, alpha: 0.7, seed: 501, over: 1, keep: (x, y) => y < 680 + Math.sin(x * 0.012) * 10 });
    scribble(g, all, C.deep, { angle: 0.1, gap: 7, w: 5.5, alpha: 0.6, seed: 502, over: 1, keep: (x, y) => y > 1120 + Math.sin(x * 0.01 + 1) * 14 });
    scribble(g, all, C.deepest, { angle: -0.08, gap: 9, w: 5, alpha: 0.5, seed: 503, over: 1, keep: (x, y) => y > 1420 + Math.sin(x * 0.01 + 2) * 18 });
    cline(g, wave(y0 + 3, 2, 0.4), "#e9efe8", 3.2, 510, 0.9, 0.8);
    cline(g, wave(y0 - 3, 2, 0.4), darker(C.hill2S, 0.3), 2, 511, 0.85, 0.8);
  });
};

// the ducks' house: a little hut on stilts with a red roof, its round door warm
const house = (g: Gfx) => {
  const x = 60, y = 430, w = 150, h = 112;
  wax(g, () => {
    for (let i = 0; i < 3; i++) { const sx = x + 26 + i * 50; cline(g, [[sx, y + h - 4], [sx + 1, y + h + 40], [sx, y + h + 86]], C.woodS, 7, 200 + i, 0.95, 0.4); }
    const ramp: P[] = [[x + w - 10, y + h - 4], [x + w + 70, y + h + 86], [x + w + 54, y + h + 94], [x + w - 26, y + h + 6]];
    crayonShape(g, ramp, { col: C.wood, shade: C.woodS, seed: 210, lw: 2, gap: 4, w: 4 });
    const wall = roundRect(x, y, w, h, 6);
    crayonShape(g, wall, { col: C.wall, shade: C.wallS, seed: 220, lw: 2.4 });
    const door = ellipse(x + w * 0.5, y + h * 0.58, 28, 32, 28);
    crayonShape(g, door, { col: C.door, shade: darker(C.door, 0.3), seed: 230, lw: 2.2, gap: 4, w: 4.5, shadeKeep: (_x, yy) => yy < y + h * 0.5 });
    const roof: P[] = smooth([[x - 24, y + 14], [x + w * 0.5, y - 60], [x + w + 24, y + 14], [x + w * 0.5, y + 4]], true, 4);
    crayonShape(g, roof, { col: C.roof, shade: C.roofS, seed: 240, lw: 2.6 });
  });
};

// a lily pad seen at the pond's angle: an ellipse with its notch
export const padShapeP = (cx: number, cy: number, rx: number, ry: number, notch: number): P[] => {
  const rim: P[] = []; for (let i = 0; i <= 40; i++) { const a = notch + 0.22 + (i / 40) * (Math.PI * 2 - 0.44); rim.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return [[cx, cy], ...rim];
};
export const drawPad = (g: Gfx, cx: number, cy: number, rx: number, notch: number, seed: number, col = C.pad) => {
  const ry = rx * 0.42, pad = padShapeP(cx, cy, rx, ry, notch);
  wax(g, () => {
    fillShape(g, pad.map(([x, y]) => [x + 5, y + 9] as P), C.deepest, 0.3);
    crayonShape(g, pad, { col, shade: C.padS, seed, lw: 2.2, gap: 4.4, w: 5, every: 2 });
    for (let i = 0; i < 7; i++) { const a = notch + 0.5 + (i / 6) * (Math.PI * 2 - 1); cline(g, [[cx, cy], [cx + Math.cos(a) * rx * 0.75, cy + Math.sin(a) * ry * 0.75]], darker(C.padS, 0.2), 1, seed + 20 + i, 0.55, 0.3); }
  });
};

export const pondPlate = (env: Env): Layer => {
  const key = `duckcode:pond:crayon:${env.scale}:${env.W}x${env.H}`, hit = env.cache.get(key) as Layer | undefined;
  if (hit) return hit;
  const L = env.canvas(Math.round(env.W * env.scale), Math.round(env.H * env.scale)), g = new Gfx(L.ctx, env, 0, CRAYON_M);
  L.ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  L.ctx.fillStyle = PAPER; L.ctx.fillRect(0, 0, env.W, env.H);
  sky(g, env.W); hills(g, env.W); water(g, env.W, env.H); house(g);
  drawPad(g, 1030, 640, 44, 2.6, 3501); drawPad(g, 50, 1010, 56, 0.4, 3502); drawPad(g, 1040, 1150, 46, 3.4, 3503);
  g.paper("paper", 0.1);
  env.cache.set(key, L);
  return L;
};

// the moving part of the water: pale crayon glints that drift sideways and breathe
export const waterGlints = (g: Gfx, f: number, W: number, H: number) => {
  g.group("plain", () => {
    const r = rng(777);
    for (let i = 0; i < 22; i++) {
      const y = POND.HORIZON + 40 + r() * (H - POND.HORIZON - 60), depth = (y - POND.HORIZON) / (H - POND.HORIZON);
      const len = 30 + r() * 60 * (0.5 + depth), speed = 0.2 + r() * 0.3, ph = r() * 6.28, x = ((r() * (W + 200) + f * speed) % (W + 200)) - 100;
      const a = 0.3 + 0.3 * Math.sin(f * 0.05 + ph);
      cline(g, [[x, y], [x + len * 0.5, y - 2], [x + len, y]], mix(C.glint, C.far, i % 3 ? 0 : 0.4), 2 + depth * 2, 900 + i, a, 0.5);
    }
  }, { textures: ["pencilTooth"] });
};
