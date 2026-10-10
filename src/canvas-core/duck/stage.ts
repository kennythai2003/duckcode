// STAGE: the frame skeleton every duck film shares. stageBegin draws the pond; stageTitle the title block
// and the input pills; stagePanel the code panel (running line, watch chips, console) from a run/watch table.
import { Gfx, type Ctx, type Env } from "../core";
import { lerp } from "../gallery";
import { CRAYON_M, blit } from "./crayon";
import { drawPanel, type PanelLayout } from "./codePanel";
import { pillSprite, titleSprite } from "./chrome";
import { ease, prog } from "./kit";
import { pondPlate, waterGlints } from "./pond";

export const W = 1080, H = 1920;
export const stageBegin = (ctx: Ctx, env: Env, f: number): Gfx => {
  const g = new Gfx(ctx, env, f, CRAYON_M);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(pondPlate(env).canvas as CanvasImageSource, 0, 0);
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0); waterGlints(g, f, W, H);
  return g;
};
export type Pill = { parts: [string, string][]; from: number; to: number };
// title at (540, 270); each pill at (540, 432) between `from` and `to` (frames)
export const stageTitle = (ctx: Ctx, env: Env, f: number, title: string, sub: string, pills: Pill[]) => {
  const tq = ease.spring(prog(f, 0, 20)); blit(ctx, env, titleSprite(env, title, sub), 540, 270, tq, tq);
  for (const p of pills) { const q = ease.back(prog(f, p.from, 10)) * (1 - ease.out(prog(f, p.to - 6, 8))); blit(ctx, env, pillSprite(env, p.parts), 540, 432, q, q); }
};
export type Run = [frame: number, line: number][];
export type Watch = [frame: number, name: string, value: string][];
export const checkBeats = (name: string, run: Run) => { for (const [f] of run) if (f % 15) throw new Error(`${name}: a run cue at ${f} is off the beat`); };
export type PanelSpec = { code: string[]; layout: PanelLayout; run: Run; watch: Watch; show: number; ret: number; print: number; output: string; window?: { off: number; view: number } };
// paper grain, then the panel. `window` shows `view` lines starting at `off` (a scrolling window for long code).
export const stagePanel = (g: Gfx, f: number, o: PanelSpec) => {
  g.paper("paper", 0.05);
  let line = -1, from = -1, at = 0;
  for (const [f0, l] of o.run) if (f >= f0) { from = line; line = l; at = f0; }
  const off = o.window?.off ?? 0, shown = (from < 0 ? line : lerp(from, line, ease.out(prog(f, at, 8)))) - off;
  const watch = new Map<string, string>(); let fresh = "", freshAt = -99;
  for (const [f0, k, v] of [...o.watch].sort((a, b) => a[0] - b[0])) if (f >= f0) { if (watch.get(k) !== v) { fresh = k; freshAt = f0; } watch.set(k, v); }
  const code = o.window ? o.code.slice(off, off + o.window.view) : o.code;
  drawPanel(g, code, o.layout, {
    line: shown >= -0.5 && shown < code.length ? shown : -1, alpha: prog(f, o.show - 4, 6), lineNo0: off,
    pulse: f >= o.ret && f < o.print ? 0.5 + 0.5 * Math.sin(f * 0.3) : 0,
    watch: [...watch.entries()], watchFresh: fresh, flash: 1 - prog(f, freshAt, 14),
    output: o.output, outQ: prog(f, o.print + 4, 12),
  });
};
