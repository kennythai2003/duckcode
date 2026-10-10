// CONTAINS DUPLICATE · the score. Playful, G major, 120 bpm, skip groove, 24 bars = the 48 s film.
// Brief as numbers: bars 0-2 the ducks drop in and `seen = set()`, bars 3-6 the first duck asks
// (a "question" motif: two plinks, a rest, an upward step, an answer falling home), bars 7-10 the
// next ducks (the motif higher), bars 11-13 the third duck (quieter, longer notes), bars 14-15 a
// build that stops, bars 16-18 the second 1 finds its twin (the climax), bars 19-21 the answer card,
// bars 22-23 a button.
import type { Material } from "./music";

// root-fifth bass for one bar of one or two chords ("G Em")
const R: Record<string, [string, string]> = { G: ["G2", "D3"], Em: ["E2", "B2"], C: ["C2", "G2"], D7: ["D2", "A2"], Am: ["A1", "E2"], Bm: ["B1", "F#2"] };
const bass = (bar: string) => { const [a, b = a] = bar.split(" "); return `${R[a][0]}:1 ${R[a][1]}:1 ${R[b][0]}:1 ${R[b][1]}:1`; };
const sec = (harmony: string[]) => ({ harmony, bass: harmony.map(bass) });

export const containsDuplicateScore = (): Material => ({
  style: "playful", title: "Contains Duplicate (duckcode)", seed: 2170, mood: "playful",
  bpm: 120, key: "G", mode: "major", meter: "4/4",
  moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 },
  levels: { chords: -5, bass: -3.5 },
  swing: 0.54, dyn: [0.56, 0.7], tail: 1.4,
  chords: {
    G: { voicing: "[G3 B3 D4]", bass: bass("G") }, Em: { voicing: "[G3 B3 E4]", bass: bass("Em") }, C: { voicing: "[G3 C4 E4]", bass: bass("C") },
    D7: { voicing: "[F#3 A3 C4]", bass: bass("D7") }, Am: { voicing: "[A3 C4 E4]", bass: bass("Am") }, Bm: { voicing: "[F#3 B3 D4]", bass: bass("Bm") },
  },
  grooves: { main: { family: "skip", density: 0.5, variation: 0.35 } },
  sections: [
    { kind: "intro", bars: 3, harmony: ["G Em", "C D7", "G"], groove: null, chordVel: 0.7, energy: 0.4,
      lead: ["r:1 B4:.5 D5:.5 G5:.5 B5:.5 r:1", "r:2 A5:.5 F#5:.5 D5:1", "r:.5 D5:.5 r:.5 D5:.5 G5:1 r:1"],
      bass: ["G2:1 r:1 E2:1 r:1", "C2:1 r:1 D2:1 A2:1", "G2:1 D3:1 G2:1 r:1"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5", "x:1 r:3"] },
    { kind: "verse", bars: 4, ...sec(["G Em", "C D7", "G Em", "Am D7"]), energy: 0.48, comp: "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5",
      lead: ["B4:.5 D5:.5 r:.5 G5:.5 G5:.5 E5:.5 B4:1", "C5:.5 E5:.5 r:.5 G5:.5 F#5:.5 A5:.5 D5:1", "B4:.5 D5:.5 r:.5 B5:.5 G5:.5 E5:.5 G5:1", "A4:.5 C5:.5 r:.5 E5:.5 D5:.5 C5:.5 A4:1"] },
    { kind: "verse", bars: 4, ...sec(["Em C", "G D7", "Bm Em", "C D7"]), energy: 0.52, comp: "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5",
      lead: ["E5:.5 G5:.5 r:.5 B5:.5 C6:.5 G5:.5 E5:1", "D5:.5 G5:.5 r:.5 B5:.5 A5:.5 F#5:.5 D5:1", "F#5:.5 B5:.5 r:.5 D6:.5 B5:.5 G5:.5 E5:1", "E5:.5 G5:.5 r:.5 C6:.5 A5:.5 F#5:.5 D5:1"] },
    { kind: "verse", bars: 3, ...sec(["G Em", "C D7", "G D7"]), energy: 0.42, comp: "r:1 x:1 r:1 x:1",
      lead: ["D5:1 B4:.5 G4:.5 E5:1 B4:1", "E5:1 C5:.5 G4:.5 F#5:1 D5:1", "D5:.5 B4:.5 G4:1 A4:1 C5:1"] },
    { kind: "build", bars: 2, harmony: ["Em C", "D7"], bass: ["E2:1 B2:1 C2:1 G2:1", "D2:.5 D2:.5 F#2:.5 A2:.5 C3:1 r:1"], groove: "main", energy: 0.6,
      lead: ["r:.5 E5:.5 r:.5 G5:.5 r:.5 C6:.5 r:.5 E6:.5", "D6:.5 C6:.5 A5:.5 F#5:.5 D5:1 r:1"],
      comp: ["r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 3, ...sec(["G C", "Am D7", "G Em"]), energy: 0.8, comp: "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5",
      lead: ["D6:.5 G6:1 F#6:.5 E6:.5 C6:1.5", "A5:.5 C6:1 E6:.5 F#6:.5 D6:1.5", "B5:.5 D6:1 G6:.5 G6:.5 E6:1.5"] },
    { kind: "hook", bars: 3, ...sec(["C D7", "Bm Em", "Am D7"]), energy: 0.75, stretch: true, comp: "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5",
      lead: ["E6:.5 G6:.5 r:.5 E6:.5 F#6:.5 A6:.5 D6:1", "D6:.5 F#6:.5 r:.5 B5:.5 B5:.5 G5:.5 E5:1", "C6:.5 E6:.5 r:.5 A5:.5 A5:.5 F#5:.5 D5:1"] },
    { kind: "outro", bars: 2, harmony: ["G", "G"], groove: null, energy: 0.7,
      lead: ["B5:.5 D6:.5 G6:1 r:2", "G5:1 r:3"], bass: ["G2:1 D3:1 G2:1 r:1", "G2:1 r:3"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:3"] },
  ],
});
