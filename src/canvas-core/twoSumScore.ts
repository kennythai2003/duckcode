// TWO SUM · the score. Playful, F major, 120 bpm, 12 bars = exactly the 24 s film.
// Brief as numbers: bar 0-1 the ducks drop in (rising plinks), bars 2-5 the first duck asks and
// remembers (the motif, stated and answered), bars 6-7 the second duck asks (fragments, then a
// stop: the breath before the reveal), bar 8 "2 is in seen!" (home chord, the motif augmented up
// high, the climax), bar 9 return, bar 10 the answer is shouted, bar 11 a button.
// Motif: a 3-note staccato pickup cell with a leap up to the long note, answered a step lower.
import type { Material } from "./music";

const M = "r:.5 C5:.25 D5:.25 F5:.5 r:.5 A5:.5 G5:.5 F5:1";        // stated (F, Dm)
const M_ANS = "r:.5 Bb4:.25 C5:.25 D5:.5 r:.5 F5:.5 E5:.5 C5:1";   // answered lower (Bb, C7)
const M_UP = "r:.5 C5:.25 D5:.25 F5:.5 r:.5 C6:.5 A5:.5 F5:1";     // the leap stretched
const M_CAD = "A5:.5 G5:.5 E5:.5 C5:.5 D5:.5 E5:.5 G5:1";          // into the half cadence

export const twoSumScore = (): Material => ({
  style: "playful", title: "Two Sum (duckcode)", seed: 2093, mood: "playful",
  bpm: 120, key: "F", mode: "major", meter: "4/4",
  moodControls: { energy: 0.55, warmth: 0.5, brightness: 0.6, tension: 0.4, space: 0.45 },
  levels: { chords: -5, bass: -3.5 },
  swing: 0.54, dyn: [0.58, 0.7], tail: 1.2,
  chords: {
    F: { voicing: "[A3 C4 F4]", bass: "F2:1 C3:1 F2:1 C3:1" },
    Dm: { voicing: "[A3 D4 F4]", bass: "D2:1 A2:1 D2:1 A2:1" },
    Gm: { voicing: "[Bb3 D4 G4]", bass: "G2:1 D3:1 G2:1 D3:1" },
    Gm7: { voicing: "[F3 Bb3 D4]", bass: "G2:1 D3:1 G2:1 D3:1" },
    Bb: { voicing: "[Bb3 D4 F4]", bass: "Bb1:1 F2:1 Bb1:1 F2:1" },
    C7: { voicing: "[G3 Bb3 E4]", bass: "C2:1 G2:1 C2:1 G2:1" },
    G7: { voicing: "[B3 D4 F4]", bass: "G2:1 D3:1 G2:1 D3:1" },
    A7: { voicing: "[G3 C#4 E4]", bass: "A1:1 E2:1 A1:1 E2:1" },
  },
  motifs: { M, M_ANS, M_UP, M_CAD },
  grooves: { main: { family: "skip", density: 0.55, variation: 0.35 } },
  sections: [
    { kind: "intro", bars: 2, harmony: ["F Dm", "Gm C7"], groove: null, chordVel: 0.7, energy: 0.4,
      lead: ["r:1 C5:.5 F5:.5 A5:.5 C6:.5 r:1", "r:2 Bb5:.5 G5:.5 E5:1"],
      bass: ["F2:1 r:1 D2:1 r:1", "G2:1 r:1 C2:1 G2:1"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5"] },
    { kind: "verse", bars: 4, harmony: ["F Dm", "Bb C7", "F Dm", "G7 C7"], energy: 0.5,
      lead: ["M", "M_ANS", "M_UP", "M_CAD"],
      bass: ["F2:1 C3:1 D2:1 A2:1", "Bb1:1 F2:1 C2:1 G2:1", "F2:1 C3:1 D2:1 A2:1", "G2:1 D3:1 C2:1 E2:1"],
      comp: "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5" },
    { kind: "build", bars: 2, harmony: ["Dm Bb", "C7"], groove: "main", energy: 0.6,
      lead: ["r:.5 F5:.5 r:.5 F5:.5 r:.5 A5:.5 r:.5 D6:.5", "C6:.5 Bb5:.5 G5:.5 E5:.5 C5:1 r:1"],
      bass: ["D2:1 A2:1 Bb1:1 F2:1", "C2:.5 C2:.5 E2:.5 G2:.5 Bb2:1 r:1"],
      comp: ["r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 3, harmony: ["F A7", "Dm Bb", "Gm7 C7"], energy: 0.8, stretch: true,
      lead: ["C6:.5 F6:1 E6:.5 F6:.5 A6:1.5", "r:.5 F6:.5 D6:.5 A5:.5 Bb5:.5 D6:.5 F6:1", "G6:1 F6:.5 E6:.5 D6:.5 E6:.5 C6:1"],
      bass: ["F2:1 C3:1 A1:1 E2:1", "D2:1 A2:1 Bb1:1 F2:1", "G2:1 D3:1 C2:1 C3:1"],
      comp: "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5" },
    { kind: "outro", bars: 1, harmony: ["F"], groove: null, energy: 0.75,
      lead: ["F6:1 r:3"], bass: ["F2:1 r:3"], comp: "x:1 r:3" },
  ],
});
