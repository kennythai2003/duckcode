// TOP K FREQUENT ELEMENTS · sound: the composed score, the kit's effects cued by frame, and the quacks.
import type { FilmAudio } from "./film";
import { composePiece, filmSfx, type SfxCue } from "./music";
import { filmAudio } from "./music/render";
import { topKFrequentScore } from "./topKFrequentScore";
import { quackInto } from "./duck/quack";

type Cue = {
  land: number[]; nums: number; count: number; freq: number; res: number; ret: number; print: number; party: number;
  p1: { start: number; fly: number; lands: number }[]; p2: { start: number; fly: number; lands: number }[];
  p3: { at: number; appends: { at: number; check: number }[] }[]; quacks: [number, number][];
};
const VOICE = [3, 3, 3, 0, 0, -3]; // ducks with the same number share a voice

export const topKFrequentAudio = (fps: number, frames: number, C: Cue): FilmAudio => {
  const piece = composePiece(topKFrequentScore()), first = C.p3.flatMap((s) => s.appends)[0];
  const cues: SfxCue[] = [
    ...C.land.map((f, i) => ({ frame: f, kind: "bubble", variant: "splash", label: `duck ${i} lands`, gainDb: i ? -1 : 1 } as SfxCue)),
    { frame: C.nums + 2, kind: "pop", variant: "tiny", label: "nums" },
    { frame: C.count + 4, kind: "pop", variant: "cork", label: "count" },
    { frame: C.freq + 4, kind: "pop", variant: "pop", label: "freq cells" },
    ...C.p1.flatMap((p, k): SfxCue[] => [
      k === 0 ? { frame: p.start + 10, kind: "whoosh", variant: "soft", dir: -1, label: "num flies in" } : { frame: p.start + 9, kind: "swish", variant: "soft", label: `num hops (${k})` },
      { frame: p.lands, kind: "bubble", variant: "bubbles", label: `count +1 (${k})`, gainDb: -1 },
    ]),
    ...C.p2.flatMap((p, k): SfxCue[] => [{ frame: p.start + 4, kind: "pop", variant: "tiny", label: `item (${k})`, gainDb: 2 }, { frame: p.lands, kind: "pop", variant: "cork", label: `into freq (${k})` }]),
    { frame: C.res + 4, kind: "pop", variant: "pop", label: "res" },
    ...C.p3.map((s, k): SfxCue => ({ frame: s.at + 4, kind: "tick", variant: "soft", label: `i step (${k})`, gainDb: 5 })),
    { frame: first.at, kind: "riser", variant: "soft", beats: 4, label: "into the first append" },
    ...C.p3.flatMap((s) => s.appends).map((a, k): SfxCue => ({ frame: a.at + 28, kind: "chime", variant: k ? "bell" : "sparkle", label: `append (${k})`, gainDb: 2 })),
    { frame: C.print, kind: "impact", variant: "soft", snap: "bar", label: "the answer" },
  ];
  const base = filmSfx(filmAudio(piece, frames / fps), { fps, frames, cues, score: { piece }, seed: 347 });
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    C.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / fps) * sr), VOICE[d], 4900 + i, (d - 2.5) * 0.18, 0.28));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    const lim = 0.89; if (pk > lim) { const g = lim / pk; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
