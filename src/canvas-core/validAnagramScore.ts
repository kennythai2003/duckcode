// VALID ANAGRAM · the score. Playful, D major, 120 bpm, shuffle groove, 15 bars = the 30 s film.
// Brief as numbers: bars 0-2 the ducks drop in and the lengths match (plinks, then a settled cadence),
// bars 3-6 s is counted (a motif that climbs in thirds: counting UP), bars 7-9 t takes them back
// (the motif turned upside down and quieter: counting DOWN), bars 10-11 the last letter (fragments,
// then a stop), bar 12 "return True" (the climax), bar 13 the answer card, bar 14 a button.
import type { Material } from "./music";

export const validAnagramScore = (): Material => ({
  style: "playful", title: "Valid Anagram (duckcode)", seed: 2420, mood: "playful",
  bpm: 120, key: "D", mode: "major", meter: "4/4",
  moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 },
  levels: { chords: -5, bass: -3.5, ghost: 6 },
  swing: 0.56, dyn: [0.58, 0.7], tail: 1.2,
  chords: {
    D: { voicing: "[F#3 A3 D4]", bass: "D2:1 A2:1 D2:1 A2:1" },
    Bm: { voicing: "[F#3 B3 D4]", bass: "B1:1 F#2:1 B1:1 F#2:1" },
    G: { voicing: "[G3 B3 D4]", bass: "G2:1 D3:1 G2:1 D3:1" },
    A7: { voicing: "[G3 C#4 E4]", bass: "A1:1 E2:1 A1:1 E2:1" },
    Em: { voicing: "[G3 B3 E4]", bass: "E2:1 B2:1 E2:1 B2:1" },
    "F#m": { voicing: "[F#3 A3 C#4]", bass: "F#2:1 C#3:1 F#2:1 C#3:1" },
  },
  motifs: {
    UP1: "D5:.5 F#5:.5 A5:.5 r:.5 B5:.75 A5:.25 F#5:1",
    UP2: "D5:.5 G5:.5 B5:.5 r:.5 C#6:.75 B5:.25 A5:1",
    UP3: "F#5:.5 A5:.5 D6:.5 r:.5 C#6:.75 A5:.25 F#5:1",
    UP4: "G5:.5 E5:.5 B4:.5 r:.5 C#5:.5 E5:.5 A5:1",
    DN1: "F#5:.5 D5:.5 B4:.5 r:.5 D5:.75 B4:.25 G4:1",
    DN2: "E5:.5 B4:.5 G4:.5 r:.5 A4:.75 C#5:.25 E5:1",
    DN3: "D5:.5 F#5:.5 A5:.5 r:.5 G5:.5 E5:.5 C#5:1",
  },
  grooves: { main: { family: "shuffle", density: 0.5, variation: 0.35 } },
  sections: [
    { kind: "intro", bars: 3, harmony: ["D Bm", "G A7", "D"], groove: null, chordVel: 0.7, energy: 0.4,
      lead: ["r:1 A4:.5 D5:.5 F#5:.5 A5:.5 r:1", "r:2 G5:.5 F#5:.5 E5:1", "r:.5 A4:.5 r:.5 A4:.5 D5:1 r:1"],
      bass: ["D2:1 r:1 B1:1 r:1", "G2:1 r:1 A1:1 E2:1", "D2:1 A2:1 D2:1 r:1"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5", "x:1 r:3"] },
    { kind: "verse", bars: 4, harmony: ["D Bm", "G A7", "D F#m", "Em A7"], energy: 0.5,
      lead: ["UP1", "UP2", "UP3", "UP4"],
      bass: ["D2:1 A2:1 B1:1 F#2:1", "G2:1 D3:1 A1:1 E2:1", "D2:1 A2:1 F#2:1 C#3:1", "E2:1 B2:1 A1:1 C#2:1"],
      comp: "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5" },
    { kind: "verse", bars: 3, harmony: ["Bm G", "Em A7", "D A7"], energy: 0.42,
      lead: ["DN1", "DN2", "DN3"],
      bass: ["B1:1 F#2:1 G2:1 D3:1", "E2:1 B2:1 A1:1 E2:1", "D2:1 A2:1 A1:1 C#2:1"], comp: "r:1 x:1 r:1 x:1" },
    { kind: "build", bars: 2, harmony: ["Bm G", "A7"], groove: "main", energy: 0.6,
      lead: ["r:.5 B4:.5 r:.5 D5:.5 r:.5 F#5:.5 r:.5 B5:.5", "A5:.5 G5:.5 E5:.5 C#5:.5 A4:1 r:1"],
      bass: ["B1:1 F#2:1 G2:1 D3:1", "A1:.5 A1:.5 C#2:.5 E2:.5 G2:1 r:1"],
      comp: ["r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 2, harmony: ["D G", "Em A7"], energy: 0.8, stretch: true,
      lead: ["A5:.5 D6:1 C#6:.5 D6:.5 F#6:1.5", "G6:1 F#6:.5 E6:.5 B5:.5 C#6:.5 A5:1"],
      bass: ["D2:1 A2:1 G2:1 D3:1", "E2:1 B2:1 A1:1 A2:1"], comp: "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5" },
    { kind: "outro", bars: 1, harmony: ["D"], groove: null, energy: 0.75, lead: ["D6:1 r:3"], bass: ["D2:1 r:3"], comp: "x:1 r:3" },
  ],
});
