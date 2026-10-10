// THE CODE PANEL. Deliberately NOT hand-drawn (muted colours to sit with the crayon): a clean dark editor card floating on the pond, the
// way the reference video does it. Monospace, syntax colours, the running line lit by a soft bar
// with a yellow tick in the gutter, a watch strip of live variables, and a console line.
import { Gfx, type P } from "../core";
import { fillShape, clipped } from "../gallery";
import { FONT_MONO, roundRect, text, measure } from "./kit";

export const CODE = {
  BG: "#1d222c", EDGE: "#323a48", TEXT: "#d3d8df", DIM: "#6d7685", KW: "#d98aa3", FN: "#dcb65a", NUM: "#d99a6c", BUILTIN: "#89b9cf", OP: "#a3acb9", HL: "#dcb65a", STR: "#a9c48c",
};
const KEYWORDS = new Set(["def", "for", "in", "if", "else", "elif", "return", "while", "not", "and", "or", "None", "True", "False", "class", "break", "continue"]);
const BUILTINS = new Set(["print", "enumerate", "range", "len", "dict", "list", "set", "min", "max", "sorted"]);

type Tok = { s: string; col: string };
export const tokenize = (line: string): Tok[] => {
  const out: Tok[] = [], re = /(\s+)|([A-Za-z_][A-Za-z0-9_]*)|(\d+)|(#.*)|("[^"]*"|'[^']*')|(.)/g; let m: RegExpExecArray | null, prev = "";
  while ((m = re.exec(line))) {
    const [s, ws, id, num, com, str] = m;
    let col = CODE.TEXT;
    if (ws) col = CODE.TEXT; else if (com) col = CODE.DIM; else if (str) col = CODE.STR; else if (num) col = CODE.NUM;
    else if (id) col = KEYWORDS.has(id) ? CODE.KW : BUILTINS.has(id) ? CODE.BUILTIN : prev === "def" ? CODE.FN : CODE.TEXT;
    else col = CODE.OP;
    out.push({ s, col }); if (!ws) prev = id ?? s;
  }
  return out;
};

export type PanelState = {
  line: number;            // the running line, fractional while the bar slides (-1 = none)
  alpha?: number;          // the bar's strength
  watch?: [string, string][]; // name, value
  watchFresh?: string;     // the variable that just changed: it flashes
  flash?: number;          // 0..1
  output?: string; outQ?: number; // the console line and how much of it has printed
  pulse?: number;          // 0..1 a glow on the bar (the line that matters)
  lineNo0?: number;        // the first visible line's index, for a scrolled window of a longer file
};
export type PanelLayout = { x: number; y: number; w: number; size: number; lh: number; pad: number; file?: string };

export const panelHeight = (lines: string[], L: PanelLayout) => L.pad * 2 + 34 + lines.length * L.lh + 128;

export const drawPanel = (g: Gfx, lines: string[], L: PanelLayout, s: PanelState) => {
  const H = panelHeight(lines, L), card = roundRect(L.x, L.y, L.w, H, 30, 6);
  g.group("plain", () => {
    fillShape(g, roundRect(L.x + 6, L.y + 14, L.w, H, 30, 6), "#22343c", 0.35); // its shadow on the water
    fillShape(g, card, CODE.BG, 0.94);
    clipped(g, card, () => {
      // three window dots, like an editor
      ["#c96a62", "#d4b05a", "#7fae7c"].forEach((c, i) => fillShape(g, roundRect(L.x + 28 + i * 26, L.y + 22, 14, 14, 7, 3), c, 0.9));
      text(g, L.file ?? "two_sum.py", L.x + L.w / 2, L.y + 30, { size: 22, weight: 500, family: FONT_MONO, fill: CODE.DIM });
      const top = L.y + L.pad + 34;
      // the running line's bar
      if (s.line >= 0 && (s.alpha ?? 1) > 0) {
        const y = top + s.line * L.lh, a = s.alpha ?? 1;
        fillShape(g, [[L.x, y], [L.x + L.w, y], [L.x + L.w, y + L.lh], [L.x, y + L.lh]], "#ffffff", 0.07 * a + 0.06 * (s.pulse ?? 0));
        fillShape(g, [[L.x, y], [L.x + 7, y], [L.x + 7, y + L.lh], [L.x, y + L.lh]], CODE.HL, a);
      }
      // the code
      lines.forEach((ln, i) => {
        const y = top + i * L.lh + L.lh / 2 + 1; let x = L.x + 70;
        text(g, String(i + 1 + (s.lineNo0 ?? 0)), L.x + 44, y, { size: L.size * 0.72, weight: 500, family: FONT_MONO, fill: CODE.DIM, align: "right", alpha: 0.7 });
        tokenize(ln).forEach((t) => { if (t.s.trim()) text(g, t.s, x, y, { size: L.size, weight: t.col === CODE.KW || t.col === CODE.FN ? 700 : 500, family: FONT_MONO, fill: t.col, align: "left" }); x += measure(g, t.s, L.size, 500, FONT_MONO); });
      });
      // the watch strip: live variables as chips
      const wy = top + lines.length * L.lh + 26;
      fillShape(g, [[L.x + 24, wy - 8], [L.x + L.w - 24, wy - 8], [L.x + L.w - 24, wy - 6], [L.x + 24, wy - 6]], CODE.EDGE);
      let cx = L.x + 32;
      (s.watch ?? []).forEach(([k, v]) => {
        const label = `${k} = ${v}`, w = measure(g, label, 26, 500, FONT_MONO) + 28, fresh = s.watchFresh === k ? (s.flash ?? 0) : 0;
        fillShape(g, roundRect(cx, wy + 6, w, 44, 14, 4), fresh > 0 ? mixHex("#2b3240", "#dcb65a", fresh * 0.85) : "#2b3240");
        text(g, label, cx + 14, wy + 29, { size: 26, weight: 500, family: FONT_MONO, fill: fresh > 0.5 ? "#1d222c" : CODE.TEXT, align: "left" });
        cx += w + 14;
      });
      // the console
      const oy = wy + 86;
      text(g, ">>>", L.x + 32, oy, { size: 26, weight: 700, family: FONT_MONO, fill: CODE.DIM, align: "left" });
      if (s.output && (s.outQ ?? 0) > 0) {
        const n = Math.ceil(s.output.length * Math.min(1, s.outQ ?? 0));
        text(g, s.output.slice(0, n), L.x + 100, oy, { size: 28, weight: 700, family: FONT_MONO, fill: "#9cc792", align: "left" });
      }
    });
    // a thin rim, like glass
    const rim: P[] = [...card, card[0]];
    const c = g.cur; c.save(); c.strokeStyle = CODE.EDGE; c.lineWidth = 3; c.beginPath(); rim.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.restore();
  });
};

const mixHex = (a: string, b: string, t: number) => { const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const x = h(a), y = h(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
