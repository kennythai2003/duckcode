// PRODUCT OF ARRAY EXCEPT SELF · sound: the composed score, the kit's effects cued by frame, and the quacks.
import type { FilmAudio } from "./film";
import { composePiece, filmSfx, type SfxCue } from "./music";
import { filmAudio } from "./music/render";
import { productExceptSelfScore } from "./productExceptSelfScore";
import { quackInto } from "./duck/quack";

type Step = { pass: string; i: number; start: number; write: number; carry: number };
type Cue = { land: number[]; nums: number; res: number; prefix: number; postfix: number; ret: number; print: number; party: number; steps: Step[]; quacks: [number, number][] };
const VOICE = [3, 1, -1, -3];

export const productExceptSelfAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(productExceptSelfScore()), last = C.steps[C.steps.length - 1];
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: 1 } as SfxCue)),
    { frame: C.nums + 2, kind: "pop", variant: "tiny", label: "nums" },
    { frame: C.res + 4, kind: "pop", variant: "cork", label: "res cells" },
    { frame: C.prefix + 4, kind: "pop", variant: "pop", label: "prefix" },
    { frame: C.postfix + 4, kind: "pop", variant: "pop", label: "postfix" },
    ...C.steps.flatMap((s, k): SfxCue[] => [
      { frame: s.start + 6, kind: "swish", variant: "soft", label: `i moves (${k})` },
      { frame: s.write + 28, kind: "pop", variant: "tiny", label: `res[${s.i}] written (${k})`, gainDb: 2 },
      { frame: s.carry + 28, kind: "bubble", variant: "bubbles", label: `${s.pass} multiplied (${k})`, gainDb: -1 },
    ]),
    { frame: last.write + 28, kind: "riser", variant: "soft", beats: 4, label: "into the last cell" },
    { frame: C.ret + 2, kind: "chime", variant: "sparkle", label: "return res", gainDb: 2 },
    { frame: C.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 238 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    C.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), VOICE[d], 6900 + i, (d - 1.5) * 0.3, 0.3));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
