// LONGEST CONSECUTIVE SEQUENCE · sound: the composed score, the kit's effects cued by frame, and the quacks.
import type { FilmAudio } from "./film";
import { composePiece, filmSfx, type SfxCue } from "./music";
import { filmAudio } from "./music/render";
import { longestConsecutiveScore } from "./longestConsecutiveScore";
import { quackInto } from "./duck/quack";

type Snap = { f: number; line: number; check?: { v: number; inSet: boolean } };
type Cue = { land: number[]; nums: number; set: number; longest: number; ret: number; print: number; party: number; sim: Snap[]; quacks: [number, number][] };
const VOICE = [-3, 1, -5, 4, 2, 3];

export const longestConsecutiveAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(longestConsecutiveScore());
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: i ? -1 : 1 } as SfxCue)),
    { frame: C.nums + 2, kind: "pop", variant: "tiny", label: "nums" },
    { frame: C.set + 40, kind: "pop", variant: "cork", label: "numSet built" },
    { frame: C.longest + 6, kind: "pop", variant: "pop", label: "longest = 0" },
    ...C.sim.flatMap((s, k): SfxCue[] => {
      if (s.line === 5) return [{ frame: s.f + 4, kind: "swish", variant: "soft", label: `num moves (${k})` }];
      if (s.check) return [{ frame: s.f + 6, kind: "pop", variant: "tiny", label: `check ${s.check.v} (${k})`, gainDb: 3 }];
      if (s.line === 9 || s.line === 7) return [{ frame: s.f + 4, kind: "bubble", variant: "bubbles", label: `run grows (${k})`, gainDb: -1 }];
      if (s.line === 10) return [{ frame: s.f + 6, kind: "chime", variant: "glint", label: `longest (${k})`, gainDb: 1 }];
      return [];
    }),
    { frame: C.ret, kind: "riser", variant: "soft", beats: 4, label: "into return" },
    { frame: C.ret + 2, kind: "chime", variant: "sparkle", label: "return longest", gainDb: 2 },
    { frame: C.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 128 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    C.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), VOICE[d], 7900 + i, (d - 2.5) * 0.18, 0.28));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
