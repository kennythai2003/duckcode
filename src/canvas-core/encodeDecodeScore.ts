// ENCODE AND DECODE STRINGS · the score. Playful, C major, 120 bpm, skip groove, 36 bars = the 72 s film.
// Brief as numbers: bars 0-2 the ducks drop in, bars 3-10 encoding (a busy "writing" motif, then
// higher), bars 11-12 the joined tape and the scroll (a calm two-bar breath), bars 13-22 decoding
// (a scanning motif that walks down, then a variation), bars 23-25 a build that stops, bars 26-29
// the last word comes home (the climax), bars 30-32 the answer card, bars 33-35 a button.
import type { Material } from "./music";

const R: Record<string, [string, string]> = { C: ["C2", "G2"], Am: ["A1", "E2"], F: ["F1", "C2"], G7: ["G1", "D2"], Dm: ["D2", "A2"], Em: ["E2", "B2"] };
const bass = (bar: string) => { const [a, b = a] = bar.split(" "); return `${R[a][0]}:1 ${R[a][1]}:1 ${R[b][0]}:1 ${R[b][1]}:1`; };
const sec = (harmony: string[]) => ({ harmony, bass: harmony.map(bass) });
const STABS = "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", PUSH = "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5";

export const encodeDecodeScore = (): Material => ({
  style: "playful", title: "Encode and Decode Strings (duckcode)", seed: 2710, mood: "playful",
  bpm: 120, key: "C", mode: "major", meter: "4/4",
  moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 },
  levels: { chords: -5, bass: -3.5 },
  swing: 0.53, dyn: [0.55, 0.7], tail: 1.4,
  chords: {
    C: { voicing: "[G3 C4 E4]", bass: bass("C") }, Am: { voicing: "[A3 C4 E4]", bass: bass("Am") }, F: { voicing: "[A3 C4 F4]", bass: bass("F") },
    G7: { voicing: "[G3 B3 F4]", bass: bass("G7") }, Dm: { voicing: "[A3 D4 F4]", bass: bass("Dm") }, Em: { voicing: "[G3 B3 E4]", bass: bass("Em") },
  },
  grooves: { main: { family: "skip", density: 0.45, variation: 0.35 } },
  sections: [
    { kind: "intro", bars: 3, harmony: ["C Am", "F G7", "C"], groove: null, chordVel: 0.7, energy: 0.4,
      lead: ["r:1 E5:.5 G5:.5 C6:.5 E6:.5 r:1", "r:2 D6:.5 B5:.5 G5:1", "r:.5 G5:.5 r:.5 G5:.5 C6:1 r:1"],
      bass: ["C2:1 r:1 A1:1 r:1", "F1:1 r:1 G1:1 D2:1", "C2:1 G2:1 C2:1 r:1"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5", "x:1 r:3"] },
    { kind: "verse", bars: 4, ...sec(["C Am", "F G7"]), energy: 0.5, comp: STABS, loopLines: true,
      lead: ["E5:.5 G5:.5 r:.5 C6:.5 C6:.5 A5:.5 E5:1", "F5:.5 A5:.5 r:.5 C6:.5 B5:.5 D6:.5 G5:1"] },
    { kind: "verse", bars: 4, ...sec(["Am F", "Dm G7"]), energy: 0.54, comp: STABS, loopLines: true,
      lead: ["A5:.5 C6:.5 r:.5 E6:.5 F6:.5 C6:.5 A5:1", "A5:.5 D6:.5 r:.5 F6:.5 D6:.5 B5:.5 G5:1"] },
    { kind: "bridge", bars: 2, ...sec(["F G7", "C"]), groove: null, energy: 0.4, comp: "x:2 x:2", lead: ["A5:2 G5:2", "E5:2 C5:2"] },
    { kind: "verse", bars: 5, ...sec(["C Em", "F G7"]), energy: 0.46, comp: "r:1 x:1 r:1 x:1", loopLines: true,
      lead: ["G5:.5 E5:.5 r:.5 C5:.5 E5:.5 G5:.5 B5:1", "A5:.5 F5:.5 r:.5 C5:.5 D5:.5 F5:.5 B5:1"] },
    { kind: "verse", bars: 5, ...sec(["Am Dm", "F G7"]), energy: 0.5, comp: STABS, loopLines: true,
      lead: ["C6:.5 A5:.5 r:.5 E5:.5 F5:.5 A5:.5 D6:1", "C6:.5 A5:.5 r:.5 F5:.5 G5:.5 B5:.5 D6:1"] },
    { kind: "build", bars: 3, harmony: ["Dm Em", "F", "G7"], bass: ["D2:1 A2:1 E2:1 B2:1", "F1:1 C2:1 F1:1 C2:1", "G1:.5 G1:.5 B1:.5 D2:.5 F2:1 r:1"], groove: "main", energy: 0.6,
      lead: ["r:.5 D5:.5 r:.5 F5:.5 r:.5 G5:.5 r:.5 B5:.5", "r:.5 A5:.5 r:.5 C6:.5 r:.5 F6:.5 r:.5 A6:.5", "G6:.5 F6:.5 D6:.5 B5:.5 G5:1 r:1"],
      comp: [STABS, STABS, "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 4, ...sec(["C F", "Am G7", "F G7", "C Am"]), energy: 0.8, comp: PUSH,
      lead: ["G6:.5 C7:1 B6:.5 A6:.5 F6:1.5", "E6:.5 A6:1 G6:.5 G6:.5 D6:1.5", "F6:.5 A6:1 C7:.5 B6:.5 G6:1.5", "E6:.5 G6:1 C7:.5 C7:.5 A6:1.5"] },
    { kind: "hook", bars: 3, ...sec(["F G7", "Em Am", "Dm G7"]), energy: 0.75, stretch: true, comp: PUSH,
      lead: ["A6:.5 F6:.5 r:.5 C6:.5 D6:.5 G6:.5 B6:1", "G6:.5 E6:.5 r:.5 B5:.5 C6:.5 E6:.5 A6:1", "F6:.5 D6:.5 r:.5 A5:.5 B5:.5 D6:.5 G6:1"] },
    { kind: "outro", bars: 3, harmony: ["C", "C", "C"], groove: null, energy: 0.7,
      lead: ["E6:.5 G6:.5 C7:1 r:2", "G6:1 E6:1 C6:2", "C6:1 r:3"], bass: ["C2:1 G2:1 C2:1 r:1", "C2:1 G2:1 C2:1 r:1", "C2:1 r:3"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 r:1", "x:1 r:3"] },
  ],
});
