// SOUND: score + effect cues + per-duck quacks, mixed and limited. Films pass a theme (duck/themes.ts),
// their cue list and a quacks list of [frame, duckIndex]. Throws unless the length is a whole number of
// 4-second units (the themes stretch in 2-bar steps), so the music always ends on its phrase.
import type { FilmAudio } from "../film";
import { composePiece, filmSfx, type Material, type SfxCue } from "../music";
import { filmAudio } from "../music/render";
import { quackInto } from "./quack";

export const duckSound = (o: { fps: number; frames: number; theme: Material; cues: SfxCue[]; quacks: [number, number][]; voices: number[]; seed: number }): FilmAudio => {
  if (o.frames % 120) throw new Error(`duckSound: ${o.frames} frames is not a multiple of 120 (4 s)`);
  const piece = composePiece(o.theme), base = filmSfx(filmAudio(piece, o.frames / o.fps), { fps: o.fps, frames: o.frames, cues: o.cues, score: { piece }, seed: o.seed });
  const n = o.voices.length;
  const audio = ((sr: number) => {
    const [L, R] = base(sr);
    o.quacks.forEach(([f, d], i) => quackInto(L, R, sr, Math.round((f / o.fps) * sr), o.voices[d], 9000 + o.seed * 10 + i, (d - (n - 1) / 2) * 0.3, 0.28));
    let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    if (pk > 0.89) { const k = 0.89 / pk; for (let i = 0; i < L.length; i++) { L[i] *= k; R[i] *= k; } }
    return [L, R] as [Float32Array, Float32Array];
  }) as FilmAudio;
  audio.scores = [piece];
  return audio;
};
