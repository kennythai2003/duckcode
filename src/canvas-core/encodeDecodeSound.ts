// ENCODE AND DECODE STRINGS · sound: the composed score, the kit's effects cued by frame, and the quacks.
import type { FilmAudio } from "./film";
import { composePiece, filmSfx, type SfxCue } from "./music";
import { filmAudio } from "./music/render";
import { encodeDecodeScore } from "./encodeDecodeScore";
import { quackInto } from "./duck/quack";

type Cue = { land: number[]; strs: number; eres: number; join: number; i0: number; ret: number; print: number; party: number; ep: { start: number; len: number; hash: number; word: number }[]; appends: number[]; quacks: [number, number][] };
const VOICE = [2, 0, -2];

export const encodeDecodeAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(encodeDecodeScore()), last = C.appends[C.appends.length - 1];
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: 1 } as SfxCue)),
    { frame: C.strs + 2, kind: "pop", variant: "tiny", label: "strs" },
    { frame: C.eres + 4, kind: "pop", variant: "cork", label: "the tape" },
    ...C.ep.flatMap((e, k): SfxCue[] => [
      k === 0 ? { frame: e.start + 10, kind: "whoosh", variant: "soft", dir: -1, label: "s flies in" } : { frame: e.start + 9, kind: "swish", variant: "soft", label: `s hops (${k})` },
      { frame: e.len + 22, kind: "pop", variant: "pop", label: `length (${k})` },
      { frame: e.hash + 14, kind: "tick", variant: "key", label: `# (${k})`, gainDb: 5 },
      { frame: e.word + 20, kind: "scratch", variant: "marker", lengthS: 0.6, label: `letters (${k})`, gainDb: 3 },
    ]),
    { frame: C.join + 2, kind: "chime", variant: "glint", label: "joined", gainDb: 2 },
    { frame: C.i0 + 4, kind: "pop", variant: "pop", label: "i = 0" },
    ...C.appends.map((f, k): SfxCue => ({ frame: f + 32, kind: k === C.appends.length - 1 ? "chime" : "bubble", variant: k === C.appends.length - 1 ? "sparkle" : "splash", label: `word home (${k})`, gainDb: 1 })),
    { frame: last + 30, kind: "riser", variant: "soft", beats: 4, label: "into the last word home" },
    { frame: C.ret + 2, kind: "chime", variant: "bell", label: "return res" },
    { frame: C.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 271 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    C.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), VOICE[d], 5900 + i, (d - 1) * 0.3, 0.3));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
