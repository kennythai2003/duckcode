// PRODUCT OF ARRAY EXCEPT SELF · the score. Playful, Eb major, 120 bpm, bounce groove, 26 bars = the 52 s film.
// Brief as numbers: bars 0-3 the ducks drop in, res and prefix appear; bars 4-11 the prefix pass
// (a climbing "multiplying" motif, then higher); bars 12-15 the postfix pass (the motif turned to
// walk back down, quieter); bars 16-18 a build that stops; bars 19-21 every cell done, return (the
// climax); bars 22-23 the answer card; bars 24-25 a button.
import type { Material } from "./music";

const R: Record<string, [string, string]> = { Eb: ["Eb2", "Bb2"], Cm: ["C2", "G2"], Ab: ["Ab1", "Eb2"], Bb7: ["Bb1", "F2"], Fm: ["F1", "C2"], Gm: ["G1", "D2"] };
const bass = (bar: string) => { const [a, b = a] = bar.split(" "); return `${R[a][0]}:1 ${R[a][1]}:1 ${R[b][0]}:1 ${R[b][1]}:1`; };
const sec = (harmony: string[]) => ({ harmony, bass: harmony.map(bass) });
const STABS = "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", PUSH = "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5";

export const productExceptSelfScore = (): Material => ({
  style: "playful", title: "Product of Array Except Self (duckcode)", seed: 2380, mood: "playful",
  bpm: 120, key: "Eb", mode: "major", meter: "4/4",
  moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 },
  levels: { chords: -5, bass: -3.5, ghost: 6, hat: -3 },
  swing: 0.55, dyn: [0.55, 0.7], tail: 1.4,
  chords: {
    Eb: { voicing: "[G3 Bb3 Eb4]", bass: bass("Eb") }, Cm: { voicing: "[G3 C4 Eb4]", bass: bass("Cm") }, Ab: { voicing: "[Ab3 C4 Eb4]", bass: bass("Ab") },
    Bb7: { voicing: "[F3 Ab3 D4]", bass: bass("Bb7") }, Fm: { voicing: "[F3 Ab3 C4]", bass: bass("Fm") }, Gm: { voicing: "[G3 Bb3 D4]", bass: bass("Gm") },
  },
  grooves: { main: { family: "bounce", density: 0.5, variation: 0.35 } },
  sections: [
    { kind: "intro", bars: 4, harmony: ["Eb Cm", "Ab Bb7", "Eb Cm", "Fm Bb7"], groove: null, chordVel: 0.7, energy: 0.4,
      lead: ["r:1 G4:.5 Bb4:.5 Eb5:.5 G5:.5 r:1", "r:2 F5:.5 D5:.5 Bb4:1", "r:1 Bb4:.5 Eb5:.5 G5:.5 C6:.5 r:1", "r:.5 C5:.5 r:.5 F5:.5 Ab5:1 F5:1"],
      bass: ["Eb2:1 r:1 C2:1 r:1", "Ab1:1 r:1 Bb1:1 F2:1", "Eb2:1 r:1 C2:1 r:1", "F1:1 r:1 Bb1:1 F2:1"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5"] },
    { kind: "verse", bars: 4, ...sec(["Eb Cm", "Ab Bb7"]), energy: 0.5, comp: STABS, loopLines: true,
      lead: ["Eb5:.5 G5:.5 Bb5:.5 r:.5 C6:1 G5:1", "Eb5:.5 Ab5:.5 C6:.5 r:.5 D6:1 Bb5:1"] },
    { kind: "verse", bars: 4, ...sec(["Cm Ab", "Fm Bb7"]), energy: 0.54, comp: STABS, loopLines: true,
      lead: ["G5:.5 C6:.5 Eb6:.5 r:.5 Eb6:1 C6:1", "F5:.5 Ab5:.5 C6:.5 r:.5 D6:1 F6:1"] },
    { kind: "verse", bars: 4, ...sec(["Eb Gm", "Ab Bb7"]), energy: 0.44, comp: "r:1 x:1 r:1 x:1", loopLines: true,
      lead: ["Bb5:.5 G5:.5 Eb5:.5 r:.5 D5:1 Bb4:1", "C6:.5 Ab5:.5 Eb5:.5 r:.5 D5:1 F5:1"] },
    { kind: "build", bars: 3, harmony: ["Cm Ab", "Fm", "Bb7"], bass: ["C2:1 G2:1 Ab1:1 Eb2:1", "F1:1 C2:1 F1:1 C2:1", "Bb1:.5 Bb1:.5 D2:.5 F2:.5 Ab2:1 r:1"], groove: "main", energy: 0.6,
      lead: ["r:.5 C5:.5 r:.5 Eb5:.5 r:.5 Ab5:.5 r:.5 C6:.5", "r:.5 F5:.5 r:.5 Ab5:.5 r:.5 C6:.5 r:.5 F6:.5", "D6:.5 C6:.5 Ab5:.5 F5:.5 D5:1 r:1"],
      comp: [STABS, STABS, "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 3, ...sec(["Eb Ab", "Cm Bb7", "Ab Bb7"]), energy: 0.8, comp: PUSH,
      lead: ["Bb5:.5 Eb6:1 D6:.5 C6:.5 Ab5:1.5", "G5:.5 C6:1 Eb6:.5 D6:.5 F6:1.5", "Ab5:.5 C6:1 Eb6:.5 D6:.5 Bb5:1.5"] },
    { kind: "hook", bars: 2, ...sec(["Eb Cm", "Fm Bb7"]), energy: 0.75, stretch: true, comp: PUSH,
      lead: ["G6:.5 Eb6:.5 r:.5 Bb5:.5 C6:.5 Eb6:.5 G6:1", "F6:.5 C6:.5 r:.5 Ab5:.5 Bb5:.5 D6:.5 F6:1"] },
    { kind: "outro", bars: 2, harmony: ["Eb", "Eb"], groove: null, energy: 0.7,
      lead: ["G5:.5 Bb5:.5 Eb6:1 r:2", "Eb6:1 r:3"], bass: ["Eb2:1 Bb2:1 Eb2:1 r:1", "Eb2:1 r:3"], comp: ["x:1 r:1 x:1 r:1", "x:1 r:3"] },
  ],
});
