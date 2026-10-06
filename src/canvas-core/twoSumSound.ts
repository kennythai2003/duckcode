// TWO SUM · sound: the composed score, the kit's effects cued by frame, and duckcode's own quack.
import type { FilmAudio } from "./film";
import { composePiece } from "./music";
import { filmAudio } from "./music/render";
import { filmSfx, type SfxCue } from "./music";
import { twoSumScore } from "./twoSumScore";
import { quackInto } from "./duck/quack";

type Cue = { land: number[]; [k: string]: number | number[] };
export const twoSumAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(twoSumScore());
  const n = (k: string) => C[k] as number;
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: 1 } as SfxCue)),
    { frame: n("nums") + 2, kind: "pop", variant: "tiny", label: "index tags" },
    { frame: n("target") + 2, kind: "pop", variant: "pop", label: "target" },
    { frame: n("seen") + 4, kind: "pop", variant: "cork", label: "seen sign" },
    { frame: n("i0") + 10, kind: "whoosh", variant: "soft", dir: -1, label: "the hat flies in" },
    { frame: n("i0") + 22, kind: "bubble", variant: "bubbles", label: "duck 0 hops" },
    { frame: n("need0") + 8, kind: "pop", variant: "pop", label: "need = 7" },
    { frame: n("look0") + 8, kind: "swish", variant: "in", label: "magnifier" },
    { frame: n("look0") + 32, kind: "pop", variant: "tiny", label: "not here yet" },
    { frame: n("store0") + 16, kind: "whoosh", variant: "soft", dir: -1, label: "2 flies to the pad" },
    { frame: n("store0") + 30, kind: "bubble", variant: "splash", label: "the pad lands", gainDb: -1 },
    { frame: n("i1") + 9, kind: "swish", variant: "soft", label: "the hat hops" },
    { frame: n("i1") + 34, kind: "bubble", variant: "bubbles", label: "duck 1 hops" },
    { frame: n("need1") + 8, kind: "pop", variant: "pop", label: "need = 2" },
    { frame: n("look1"), kind: "riser", variant: "soft", beats: 4, label: "into the find" },
    { frame: n("look1") + 20, kind: "chime", variant: "sparkle", label: "2 is in seen!", gainDb: 2 },
    { frame: n("ret") + 2, kind: "chime", variant: "bell", label: "return [0, 1]" },
    { frame: n("print"), kind: "impact", variant: "bloom", snap: "bar", label: "the answer" },
  ];
  const quacks: [number, number][] = [ // frame, pitch (semitones): each duck has its own voice
    ...C.land.map((f, i) => [f + 2, [2, 0, -2, -4][i]] as [number, number]),
    [n("look1") + 22, 3], [n("ret") + 2, 2], [n("ret") + 8, 0],
    ...[0, 1, 2, 3].map((i) => [n("party") + i * 6 + 2, [2, 0, -2, -4][i]] as [number, number]),
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 41 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    quacks.forEach(([f, st], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), st, 900 + i, i % 2 ? 0.25 : -0.25));
    // the quacks sit on top of a mastered mix: keep the whole under -1 dBFS
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
