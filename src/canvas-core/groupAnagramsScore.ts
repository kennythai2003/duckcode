// GROUP ANAGRAMS · the score. Playful, Bb major, 120 bpm, bounce groove, 15 bars = the 30 s film.
// Brief as numbers: bars 0-1 the ducks drop in, bars 2-5 the first words are counted (a syncopated
// motif: three quick plinks, then two long notes, like letters dropping into cells), bars 6-8 more
// words, quieter, bars 9-10 the last word (fragments, a stop), bar 11 the ducks swim into their
// groups (the climax), bar 12 the answer card, bar 13 the party, bar 14 a button.
import type { Material } from "./music";

export const groupAnagramsScore = (): Material => ({
  style: "playful", title: "Group Anagrams (duckcode)", seed: 4949, mood: "playful",
  bpm: 120, key: "Bb", mode: "major", meter: "4/4",
  moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 },
  levels: { chords: -5, bass: -3.5, ghost: 6, hat: -3 },
  swing: 0.55, dyn: [0.58, 0.7], tail: 1.2,
  chords: {
    Bb: { voicing: "[F3 Bb3 D4]", bass: "Bb1:1 F2:1 Bb1:1 F2:1" },
    Gm: { voicing: "[G3 Bb3 D4]", bass: "G1:1 D2:1 G1:1 D2:1" },
    Eb: { voicing: "[G3 Bb3 Eb4]", bass: "Eb2:1 Bb2:1 Eb2:1 Bb2:1" },
    F7: { voicing: "[F3 A3 Eb4]", bass: "F1:1 C2:1 F1:1 C2:1" },
    Cm: { voicing: "[G3 C4 Eb4]", bass: "C2:1 G2:1 C2:1 G2:1" },
    Dm: { voicing: "[F3 A3 D4]", bass: "D2:1 A2:1 D2:1 A2:1" },
  },
  motifs: {
    G1: "r:.5 F5:.5 D5:.5 F5:.5 G5:1 Bb5:1",
    G2: "r:.5 G5:.5 Eb5:.5 G5:.5 A5:1 F5:1",
    G3: "r:.5 F5:.5 D5:.5 Bb5:.5 A5:1 F5:1",
    G4: "r:.5 Eb5:.5 C5:.5 G5:.5 F5:1 C5:1",
  },
  grooves: { main: { family: "bounce", density: 0.5, variation: 0.35 } },
  sections: [
    { kind: "intro", bars: 2, harmony: ["Bb Gm", "Eb F7"], groove: null, chordVel: 0.7, energy: 0.4,
      lead: ["r:1 D5:.5 F5:.5 Bb5:.5 D6:.5 r:1", "r:2 C6:.5 A5:.5 F5:1"],
      bass: ["Bb1:1 r:1 G1:1 r:1", "Eb2:1 r:1 F1:1 C2:1"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5"] },
    { kind: "verse", bars: 4, harmony: ["Bb Gm", "Eb F7", "Bb Dm", "Cm F7"], energy: 0.5,
      lead: ["G1", "G2", "G3", "G4"],
      bass: ["Bb1:1 F2:1 G1:1 D2:1", "Eb2:1 Bb2:1 F1:1 C2:1", "Bb1:1 F2:1 D2:1 A2:1", "C2:1 G2:1 F1:1 A1:1"],
      comp: "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5" },
    { kind: "verse", bars: 3, harmony: ["Gm Eb", "Cm F7", "Bb F7"], energy: 0.42,
      lead: ["r:.5 D5:.5 Bb4:.5 D5:.5 Eb5:1 G5:1", "r:.5 C5:.5 G4:.5 C5:.5 Eb5:1 C5:1", "D5:.5 F5:.5 Bb5:.5 F5:.5 Eb5:1 A4:1"],
      bass: ["G1:1 D2:1 Eb2:1 Bb2:1", "C2:1 G2:1 F1:1 C2:1", "Bb1:1 F2:1 F1:1 A1:1"], comp: "r:1 x:1 r:1 x:1" },
    { kind: "build", bars: 2, harmony: ["Gm Eb", "F7"], groove: "main", energy: 0.6,
      lead: ["r:.5 G4:.5 r:.5 Bb4:.5 r:.5 D5:.5 r:.5 G5:.5", "F5:.5 Eb5:.5 C5:.5 A4:.5 F4:1 r:1"],
      bass: ["G1:1 D2:1 Eb2:1 Bb2:1", "F1:.5 F1:.5 A1:.5 C2:.5 Eb2:1 r:1"],
      comp: ["r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 3, harmony: ["Bb Eb", "Cm F7", "Gm F7"], energy: 0.8, stretch: true,
      lead: ["F5:.5 Bb5:1 A5:.5 Bb5:.5 D6:1.5", "Eb6:1 D6:.5 C6:.5 A5:.5 C6:.5 F6:1", "D6:.5 G6:1 D6:.5 C6:.5 Eb6:.5 A5:1"],
      bass: ["Bb1:1 F2:1 Eb2:1 Bb2:1", "C2:1 G2:1 F1:1 C2:1", "G1:1 D2:1 F1:1 F2:1"], comp: "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5" },
    { kind: "outro", bars: 1, harmony: ["Bb"], groove: null, energy: 0.75, lead: ["Bb5:1 r:3"], bass: ["Bb1:1 r:3"], comp: "x:1 r:3" },
  ],
});
