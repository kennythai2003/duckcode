// GROUP ANAGRAMS · sound: the composed score, the kit's effects cued by frame, and the quacks.
import type { FilmAudio } from "./film";
import { composePiece, filmSfx, type SfxCue } from "./music";
import { filmAudio } from "./music/render";
import { groupAnagramsScore } from "./groupAnagramsScore";
import { quackInto } from "./duck/quack";

type Pass = { duck: number; start: number; reset: number; letters: number; append: number; lands: number };
type Cue = { land: number[]; strs: number; res: number; ret: number; print: number; party: number; passes: Pass[]; quacks: [number, number][] };
const VOICE = [3, 1, -1, 2, 0, -2];

export const groupAnagramsAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(groupAnagramsScore());
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: i ? -1 : 1 } as SfxCue)),
    { frame: C.strs + 2, kind: "pop", variant: "tiny", label: "strs" },
    { frame: C.res + 4, kind: "pop", variant: "cork", label: "res" },
    ...C.passes.flatMap((p, k): SfxCue[] => [
      k === 0 ? { frame: p.start + 10, kind: "whoosh", variant: "soft", dir: -1, label: "pointer flies in" } : { frame: p.start + 9, kind: "swish", variant: "soft", label: `pointer hops (${k})` },
      { frame: p.letters + 12, kind: "tick", variant: "soft", label: `letters (${k})`, gainDb: 3 },
      { frame: p.letters + 30, kind: "tick", variant: "soft", label: `letters done (${k})`, gainDb: 5 },
      { frame: p.append + 8, kind: "whoosh", variant: "soft", dir: 1, label: `word to bucket (${k})` },
      { frame: p.lands, kind: "pop", variant: "pop", label: `bucket (${k})` },
    ]),
    { frame: C.ret, kind: "riser", variant: "soft", beats: 4, label: "into the groups" },
    { frame: C.ret + 2, kind: "chime", variant: "sparkle", label: "groups form", gainDb: 2 },
    { frame: C.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 49 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    C.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), VOICE[d], 2900 + i, (d - 2.5) * 0.18, 0.28));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
