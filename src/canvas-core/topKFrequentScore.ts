// TOP K FREQUENT ELEMENTS · the score. Playful, A major, 120 bpm, shuffle groove, 36 bars = the 72 s film.
// Brief as numbers: bars 0-2 the ducks drop in, bars 3-4 count and freq appear, bars 5-15 the
// ducks report to the count pads (a counting motif, then higher, then quieter), bars 16-21 the
// numbers move into their buckets (a calmer bridge, held notes), bars 22-25 i walks down from the
// top (a build that stops), bars 26-30 res fills (the climax), bars 31-33 the answer card, 34-35 a button.
import type { Material } from "./music";

const R: Record<string, [string, string]> = { A: ["A1", "E2"], "F#m": ["F#1", "C#2"], D: ["D2", "A2"], E7: ["E2", "B2"], Bm: ["B1", "F#2"], "C#m": ["C#2", "G#2"] };
const bass = (bar: string) => { const [a, b = a] = bar.split(" "); return `${R[a][0]}:1 ${R[a][1]}:1 ${R[b][0]}:1 ${R[b][1]}:1`; };
const sec = (harmony: string[]) => ({ harmony, bass: harmony.map(bass) });
const STABS = "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", PUSH = "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5";

export const topKFrequentScore = (): Material => ({
  style: "playful", title: "Top K Frequent (duckcode)", seed: 3470, mood: "playful",
  bpm: 120, key: "A", mode: "major", meter: "4/4",
  moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 },
  levels: { chords: -5, bass: -3.5, ghost: 6 },
  swing: 0.56, dyn: [0.55, 0.7], tail: 1.4,
  chords: {
    A: { voicing: "[A3 C#4 E4]", bass: bass("A") }, "F#m": { voicing: "[F#3 A3 C#4]", bass: bass("F#m") }, D: { voicing: "[F#3 A3 D4]", bass: bass("D") },
    E7: { voicing: "[G#3 D4 E4]", bass: bass("E7") }, Bm: { voicing: "[F#3 B3 D4]", bass: bass("Bm") }, "C#m": { voicing: "[G#3 C#4 E4]", bass: bass("C#m") },
  },
  grooves: { main: { family: "shuffle", density: 0.5, variation: 0.35 } },
  sections: [
    { kind: "intro", bars: 3, harmony: ["A F#m", "D E7", "A"], groove: null, chordVel: 0.7, energy: 0.4,
      lead: ["r:1 C#5:.5 E5:.5 A5:.5 C#6:.5 r:1", "r:2 B5:.5 G#5:.5 E5:1", "r:.5 E5:.5 r:.5 E5:.5 A5:1 r:1"],
      bass: ["A1:1 r:1 F#1:1 r:1", "D2:1 r:1 E2:1 B2:1", "A1:1 E2:1 A1:1 r:1"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5", "x:1 r:3"] },
    { kind: "verse", bars: 2, ...sec(["D E7", "A E7"]), energy: 0.44, comp: "r:1 x:1 r:1 x:1", lead: ["F#5:1 A5:1 G#5:1 B5:1", "A5:1 C#6:.5 B5:.5 G#5:1 E5:1"] },
    { kind: "verse", bars: 4, ...sec(["A F#m", "D E7"]), energy: 0.5, comp: STABS, loopLines: true,
      lead: ["C#5:.5 E5:.5 r:.5 A5:.5 A5:.5 F#5:.5 C#5:1", "D5:.5 F#5:.5 r:.5 A5:.5 G#5:.5 B5:.5 E5:1"] },
    { kind: "verse", bars: 4, ...sec(["F#m D", "Bm E7"]), energy: 0.54, comp: STABS, loopLines: true,
      lead: ["F#5:.5 A5:.5 r:.5 C#6:.5 D6:.5 A5:.5 F#5:1", "F#5:.5 B5:.5 r:.5 D6:.5 B5:.5 G#5:.5 E5:1"] },
    { kind: "verse", bars: 3, ...sec(["A F#m", "D E7", "A E7"]), energy: 0.42, comp: "r:1 x:1 r:1 x:1",
      lead: ["E5:1 C#5:.5 A4:.5 F#5:1 C#5:1", "F#5:1 D5:.5 A4:.5 G#5:1 E5:1", "E5:.5 C#5:.5 A4:1 B4:1 D5:1"] },
    { kind: "bridge", bars: 6, ...sec(["Bm C#m", "D E7"]), energy: 0.46, comp: "x:2 x:2", loopLines: true,
      lead: ["D5:1 F#5:1 E5:1 G#5:1", "F#5:1.5 A5:.5 B5:1 G#5:1"] },
    { kind: "build", bars: 4, harmony: ["F#m D", "E7", "F#m D", "E7"], bass: ["F#1:1 C#2:1 D2:1 A2:1", "E2:1 B2:1 E2:1 B2:1", "F#1:1 C#2:1 D2:1 A2:1", "E2:.5 E2:.5 G#2:.5 B2:.5 D3:1 r:1"], groove: "main", energy: 0.6,
      lead: ["r:.5 F#5:.5 r:.5 A5:.5 r:.5 D6:.5 r:.5 F#6:.5", "E6:.5 D6:.5 B5:.5 G#5:.5 E5:1 r:1"], loopLines: true,
      comp: [STABS, "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 5, ...sec(["A D", "F#m E7", "D E7", "A F#m", "Bm E7"]), energy: 0.8, comp: PUSH,
      lead: ["E6:.5 A6:1 G#6:.5 F#6:.5 D6:1.5", "C#6:.5 F#6:1 E6:.5 E6:.5 B5:1.5", "D6:.5 F#6:1 A6:.5 G#6:.5 E6:1.5", "C#6:.5 E6:1 A6:.5 A6:.5 F#6:1.5", "B5:.5 D6:1 F#6:.5 E6:.5 G#6:1.5"] },
    { kind: "hook", bars: 3, ...sec(["A F#m", "D E7", "A E7"]), energy: 0.75, stretch: true, comp: PUSH,
      lead: ["E6:.5 C#6:.5 r:.5 A5:.5 C#6:.5 F#6:.5 A6:1", "F#6:.5 D6:.5 r:.5 A5:.5 B5:.5 G#5:.5 E5:1", "C#6:.5 A5:.5 r:.5 E5:.5 D6:.5 B5:.5 G#5:1"] },
    { kind: "outro", bars: 2, harmony: ["A", "A"], groove: null, energy: 0.7,
      lead: ["C#6:.5 E6:.5 A6:1 r:2", "A5:1 r:3"], bass: ["A1:1 E2:1 A1:1 r:1", "A1:1 r:3"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:3"] },
  ],
});
