// TWO SUM · sound: the composed score, the kit's effects cued by frame, and duckcode's own quack.
import type { FilmAudio } from "./film";
import { composePiece, filmSfx, type SfxCue } from "./music";
import { filmAudio } from "./music/render";
import { twoSumScore } from "./twoSumScore";
import { quackInto } from "./duck/quack";

type Iter = { i: number; start: number; need: number; look: number; store?: number; found?: number };
type Cue = { land: number[]; nums: number; target: number; seen: number; ret: number; print: number; party: number; iters: Iter[]; quacks: [number, number][] };
const VOICE = [2, 0, -2, -4]; // each duck has its own pitch (semitones)

export const twoSumAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(twoSumScore()), last = C.iters[C.iters.length - 1];
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: 1 } as SfxCue)),
    { frame: C.nums + 2, kind: "pop", variant: "tiny", label: "index tags" },
    { frame: C.target + 2, kind: "pop", variant: "pop", label: "target" },
    { frame: C.seen + 4, kind: "pop", variant: "cork", label: "seen sign" },
    ...C.iters.flatMap((t, k): SfxCue[] => [
      k === 0 ? { frame: t.start + 10, kind: "whoosh", variant: "soft", dir: -1, label: "the pointer flies in" } : { frame: t.start + 9, kind: "swish", variant: "soft", label: "the pointer hops" },
      { frame: t.need + 8, kind: "pop", variant: "pop", label: `need (${k})` },
      { frame: t.look + 8, kind: "swish", variant: "in", label: `look (${k})` },
      ...(t.store !== undefined ? [
        { frame: t.look + 28, kind: "pop", variant: "tiny", label: `not in seen (${k})` },
        { frame: t.store + 16, kind: "whoosh", variant: "soft", dir: -1, label: `number to the pad (${k})` },
        { frame: t.store + 30, kind: "bubble", variant: "splash", label: `pad lands (${k})`, gainDb: -1 },
      ] as SfxCue[] : []),
    ]),
    { frame: last.look, kind: "riser", variant: "soft", beats: 4, label: "into the find" },
    { frame: last.look + 26, kind: "chime", variant: "sparkle", label: "found", gainDb: 2 },
    { frame: C.ret + 2, kind: "chime", variant: "bell", label: "return" },
    { frame: C.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 41 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    C.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), VOICE[d], 900 + i, (d - 1.5) * 0.3, 0.3));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
