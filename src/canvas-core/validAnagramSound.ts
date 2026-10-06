// VALID ANAGRAM · sound: the composed score, the kit's effects cued by frame, and the quacks.
import type { FilmAudio } from "./film";
import { composePiece, filmSfx, type SfxCue } from "./music";
import { filmAudio } from "./music/render";
import { validAnagramScore } from "./validAnagramScore";
import { quackInto } from "./duck/quack";

type Pass = { duck: number; start: number; fly: number; check?: number; d: 1 | -1 };
type Cue = { land: number[]; s: number; t: number; len: number; count: number; ret: number; print: number; party: number; passes: Pass[]; quacks: [number, number][] };
const VOICE = [3, 1, -1, 2, 0, -2]; // each duck has its own pitch (semitones)

export const validAnagramAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(validAnagramScore());
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: i ? -1 : 1 } as SfxCue)),
    { frame: C.s + 2, kind: "pop", variant: "tiny", label: "s" },
    { frame: C.t + 2, kind: "pop", variant: "tiny", label: "t" },
    { frame: C.len + 8, kind: "pop", variant: "pop", label: "lengths match" },
    { frame: C.count + 4, kind: "pop", variant: "cork", label: "count sign" },
    ...C.passes.flatMap((p, k): SfxCue[] => [
      k === 0 ? { frame: p.start + 10, kind: "whoosh", variant: "soft", dir: -1, label: "pointer flies in" } : { frame: p.start + 9, kind: "swish", variant: "soft", label: `pointer hops (${k})` },
      { frame: p.fly + 14, kind: "whoosh", variant: "soft", dir: -1, label: `letter to pad (${k})` },
      { frame: p.fly + 28, kind: "bubble", variant: k < 3 ? "splash" : "bubbles", label: `pad ${p.d > 0 ? "+1" : "-1"} (${k})`, gainDb: -1 },
      ...(p.check !== undefined ? [{ frame: p.check + 4, kind: "pop", variant: "tiny", label: `>= 0 (${k})` } as SfxCue] : []),
    ]),
    { frame: C.ret, kind: "riser", variant: "soft", beats: 4, label: "into return True" },
    { frame: C.ret + 2, kind: "chime", variant: "sparkle", label: "all zero", gainDb: 2 },
    { frame: C.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 242 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    C.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), VOICE[d], 1900 + i, (d - 2.5) * 0.18, 0.28));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
