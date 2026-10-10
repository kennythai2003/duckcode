// LONGEST CONSECUTIVE SEQUENCE · the score. Playful, E major, 120 bpm, shuffle groove, 26 bars = the 52 s film.
// Brief as numbers: bars 0-3 the ducks drop in and fill numSet; bars 4-10 num = 1 starts a run and
// it grows to 4 (a climbing motif, then higher as the run stretches); bars 11-13 the skips (quieter);
// bars 14-16 the short run at 100; bars 17-18 a build; bars 19-21 return 4 (the climax); bars 22-23
// the answer card; bars 24-25 a button.
import type { Material } from "./music";

const R: Record<string, [string, string]> = { E: ["E2", "B2"], "C#m": ["C#2", "G#2"], A: ["A1", "E2"], B7: ["B1", "F#2"], "F#m": ["F#1", "C#2"], "G#m": ["G#1", "D#2"] };
const bass = (bar: string) => { const [a, b = a] = bar.split(" "); return `${R[a][0]}:1 ${R[a][1]}:1 ${R[b][0]}:1 ${R[b][1]}:1`; };
const sec = (harmony: string[]) => ({ harmony, bass: harmony.map(bass) });
const STABS = "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", PUSH = "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5";

export const longestConsecutiveScore = (): Material => ({
  style: "playful", title: "Longest Consecutive Sequence (duckcode)", seed: 1280, mood: "playful",
  bpm: 120, key: "E", mode: "major", meter: "4/4",
  moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 },
  levels: { chords: -5, bass: -3.5, ghost: 6 },
  swing: 0.56, dyn: [0.55, 0.7], tail: 1.4,
  chords: {
    E: { voicing: "[G#3 B3 E4]", bass: bass("E") }, "C#m": { voicing: "[G#3 C#4 E4]", bass: bass("C#m") }, A: { voicing: "[A3 C#4 E4]", bass: bass("A") },
    B7: { voicing: "[F#3 A3 D#4]", bass: bass("B7") }, "F#m": { voicing: "[F#3 A3 C#4]", bass: bass("F#m") }, "G#m": { voicing: "[G#3 B3 D#4]", bass: bass("G#m") },
  },
  grooves: { main: { family: "shuffle", density: 0.5, variation: 0.35 } },
  sections: [
    { kind: "intro", bars: 4, harmony: ["E C#m", "A B7", "E C#m", "F#m B7"], groove: null, chordVel: 0.7, energy: 0.4,
      lead: ["r:1 G#4:.5 B4:.5 E5:.5 G#5:.5 r:1", "r:2 F#5:.5 D#5:.5 B4:1", "r:1 B4:.5 E5:.5 G#5:.5 C#6:.5 r:1", "r:.5 C#5:.5 r:.5 F#5:.5 A5:1 F#5:1"],
      bass: ["E2:1 r:1 C#2:1 r:1", "A1:1 r:1 B1:1 F#2:1", "E2:1 r:1 C#2:1 r:1", "F#1:1 r:1 B1:1 F#2:1"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5"] },
    { kind: "verse", bars: 4, ...sec(["E C#m", "A B7"]), energy: 0.5, comp: STABS, loopLines: true,
      lead: ["E5:.5 G#5:.5 B5:.5 r:.5 C#6:1 G#5:1", "E5:.5 A5:.5 C#6:.5 r:.5 D#6:1 B5:1"] },
    { kind: "verse", bars: 3, ...sec(["C#m A", "F#m B7", "E B7"]), energy: 0.56, comp: STABS,
      lead: ["G#5:.5 C#6:.5 E6:.5 r:.5 E6:1 C#6:1", "F#5:.5 A5:.5 C#6:.5 r:.5 D#6:1 F#6:1", "E6:.5 B5:.5 G#5:.5 r:.5 F#5:1 D#5:1"] },
    { kind: "verse", bars: 3, ...sec(["E G#m", "A B7", "E B7"]), energy: 0.42, comp: "r:1 x:1 r:1 x:1",
      lead: ["B5:.5 G#5:.5 E5:.5 r:.5 D#5:1 B4:1", "C#6:.5 A5:.5 E5:.5 r:.5 D#5:1 F#5:1", "G#5:1 E5:1 F#5:1 A5:1"] },
    { kind: "verse", bars: 3, ...sec(["C#m A", "F#m B7", "E C#m"]), energy: 0.46, comp: "r:1 x:1 r:1 x:1",
      lead: ["E5:1 G#5:1 A5:1 C#6:1", "A5:1 F#5:1 F#5:1 D#5:1", "E5:1 B4:1 C#5:1 E5:1"] },
    { kind: "build", bars: 2, harmony: ["F#m G#m", "B7"], bass: ["F#1:1 C#2:1 G#1:1 D#2:1", "B1:.5 B1:.5 D#2:.5 F#2:.5 A2:1 r:1"], groove: "main", energy: 0.6,
      lead: ["r:.5 F#5:.5 r:.5 A5:.5 r:.5 B5:.5 r:.5 D#6:.5", "F#6:.5 D#6:.5 B5:.5 A5:.5 F#5:1 r:1"], comp: [STABS, "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 3, ...sec(["E A", "C#m B7", "A B7"]), energy: 0.8, comp: PUSH,
      lead: ["B5:.5 E6:1 D#6:.5 C#6:.5 A5:1.5", "G#5:.5 C#6:1 E6:.5 D#6:.5 F#6:1.5", "A5:.5 C#6:1 E6:.5 D#6:.5 B5:1.5"] },
    { kind: "hook", bars: 2, ...sec(["E C#m", "F#m B7"]), energy: 0.75, stretch: true, comp: PUSH,
      lead: ["G#6:.5 E6:.5 r:.5 B5:.5 C#6:.5 E6:.5 G#6:1", "F#6:.5 C#6:.5 r:.5 A5:.5 B5:.5 D#6:.5 F#6:1"] },
    { kind: "outro", bars: 2, harmony: ["E", "E"], groove: null, energy: 0.7,
      lead: ["G#5:.5 B5:.5 E6:1 r:2", "E6:1 r:3"], bass: ["E2:1 B2:1 E2:1 r:1", "E2:1 r:3"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:3"] },
  ],
});
