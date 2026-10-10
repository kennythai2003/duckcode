// CONTAINS DUPLICATE · sound: the composed score, the kit's effects cued by frame, and the quacks.
import type { FilmAudio } from "./film";
import { composePiece, filmSfx, type SfxCue } from "./music";
import { filmAudio } from "./music/render";
import { containsDuplicateScore } from "./containsDuplicateScore";
import { quackInto } from "./duck/quack";

type Pass = { duck: number; start: number; check: number; add?: number; hit?: number };
type Cue = { land: number[]; nums: number; seen: number; ret: number; print: number; party: number; passes: Pass[]; quacks: [number, number][] };
const VOICE = [3, 1, -1, 1, -3]; // the two 1-ducks share a voice: they are twins

export const containsDuplicateAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(containsDuplicateScore()), hit = C.passes[C.passes.length - 1];
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: i ? -1 : 1 } as SfxCue)),
    { frame: C.nums + 2, kind: "pop", variant: "tiny", label: "nums" },
    { frame: C.seen + 4, kind: "pop", variant: "cork", label: "seen sign" },
    ...C.passes.flatMap((p, k): SfxCue[] => [
      k === 0 ? { frame: p.start + 10, kind: "whoosh", variant: "soft", dir: -1, label: "pointer flies in" } : { frame: p.start + 10, kind: "swish", variant: "soft", label: `pointer hops (${k})` },
      { frame: p.check + 10, kind: "swish", variant: "in", label: `look (${k})` },
      ...(p.add !== undefined ? [
        { frame: p.check + 32, kind: "pop", variant: "tiny", label: `not in seen (${k})`, gainDb: 2 },
        { frame: p.add + 16, kind: "whoosh", variant: "soft", dir: -1, label: `number to the pad (${k})` },
        { frame: p.add + 30, kind: "bubble", variant: "splash", label: `pad lands (${k})`, gainDb: -1 },
      ] as SfxCue[] : []),
    ]),
    { frame: hit.check + 30, kind: "riser", variant: "soft", beats: 4, label: "into the find" },
    { frame: hit.check + 32, kind: "chime", variant: "sparkle", label: "found the twin", gainDb: 2 },
    { frame: C.ret + 2, kind: "chime", variant: "bell", label: "return True" },
    { frame: C.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 217 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    C.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), VOICE[d], 3900 + i, (d - 2) * 0.2, 0.28));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
