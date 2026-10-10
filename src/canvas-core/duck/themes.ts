// THEMES: the channel's rotating theme songs. Two tunes, each in two keys with a different groove = 4 variants.
// Form (always): intro 3 bars, a 2-bar verse that STRETCHES to fill the film, build 2, hook 3, outro 2.
// The last 5 bars (hook + outro) are the ending: start the picture's `ret` frame about 10 s before the end
// (hook at ret, answer card on the outro). Length must be a multiple of 120 frames (4 s = 2 bars).
// themeFor(n) picks by LeetCode number so a channel's videos rotate through them; pass a variant to override.
import type { Material } from "../music";

const STABS = "r:.5 x:.5 r:.5 x:.5 r:.5 x:.5 r:.5 x:.5", PUSH = "x:.5 r:.5 x:.5 x:.5 r:.5 x:.5 r:.5 x:.5";
const ROOT: Record<string, [string, string]> = { F: ["F2", "C3"], Dm: ["D2", "A2"], Bb: ["Bb1", "F2"], C7: ["C2", "G2"], Gm: ["G1", "D2"], C: ["C2", "G2"], Am: ["A1", "E2"], G7: ["G1", "D2"], Em: ["E2", "B2"] };
const bar = (c: string) => { const [a, b = a] = c.split(" "); return `${ROOT[a][0]}:1 ${ROOT[a][1]}:1 ${ROOT[b][0]}:1 ${ROOT[b][1]}:1`; };
const VOICING: Record<string, string> = { F: "[A3 C4 F4]", Dm: "[A3 D4 F4]", Bb: "[Bb3 D4 F4]", C7: "[G3 Bb3 E4]", Gm: "[Bb3 D4 G4]", C: "[G3 C4 E4]", Am: "[A3 C4 E4]", G7: "[G3 B3 F4]", Em: "[G3 B3 E4]" };
const sec = (harmony: string[]) => ({ harmony, bass: harmony.map(bar) });

type Tune = Pick<Material, "sections" | "chords" | "key" | "swing">;
const chords = (names: string[]) => Object.fromEntries(names.map((n) => [n, { voicing: VOICING[n], bass: bar(n) }]));
const TUNES: Tune[] = [
  { key: "F", swing: 0.54, chords: chords(["F", "Dm", "Bb", "C7", "Gm"]), sections: [
    { kind: "intro", bars: 3, ...sec(["F Dm", "Bb C7", "F"]), groove: null, chordVel: 0.7, energy: 0.4, comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5", "x:1 r:3"],
      lead: ["r:1 A4:.5 C5:.5 F5:.5 A5:.5 r:1", "r:2 G5:.5 E5:.5 C5:1", "r:.5 C5:.5 r:.5 C5:.5 F5:1 r:1"] },
    { kind: "verse", bars: 2, ...sec(["F Dm", "Bb C7"]), energy: 0.5, comp: STABS, stretch: true, lead: ["A4:.5 C5:.5 r:.5 F5:.5 F5:.5 D5:.5 A4:1", "Bb4:.5 D5:.5 r:.5 F5:.5 E5:.5 G5:.5 C5:1"] },
    { kind: "build", bars: 2, harmony: ["Dm Gm", "C7"], bass: ["D2:1 A2:1 G1:1 D2:1", "C2:.5 C2:.5 E2:.5 G2:.5 Bb2:1 r:1"], groove: "main", energy: 0.6,
      lead: ["r:.5 D5:.5 r:.5 F5:.5 r:.5 A5:.5 r:.5 D6:.5", "C6:.5 Bb5:.5 G5:.5 E5:.5 C5:1 r:1"], comp: [STABS, "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 3, ...sec(["F Bb", "Dm C7", "Bb C7"]), energy: 0.8, comp: PUSH, lead: ["C6:.5 F6:1 E6:.5 F6:.5 A6:1.5", "D6:.5 F6:1 A5:.5 Bb5:.5 D6:1.5", "D6:.5 G6:1 F6:.5 E6:.5 C6:1.5"] },
    { kind: "outro", bars: 2, harmony: ["F", "F"], bass: ["F2:1 C3:1 F2:1 r:1", "F2:1 r:3"], groove: null, energy: 0.7, comp: ["x:1 r:1 x:1 r:1", "x:1 r:3"], lead: ["C6:.5 F6:.5 A6:1 r:2", "F6:1 r:3"] },
  ] },
  { key: "C", swing: 0.56, chords: chords(["C", "Am", "F", "G7", "Dm", "Em"]), sections: [
    { kind: "intro", bars: 3, ...sec(["C Am", "F G7", "C"]), groove: null, chordVel: 0.7, energy: 0.4, comp: ["x:1 r:1 x:1 r:1", "x:1 r:1 x:1 x:.5 r:.5", "x:1 r:3"],
      lead: ["r:1 E5:.5 G5:.5 C6:.5 E6:.5 r:1", "r:2 D6:.5 B5:.5 G5:1", "r:.5 G5:.5 r:.5 G5:.5 C6:1 r:1"] },
    { kind: "verse", bars: 2, ...sec(["C Em", "F G7"]), energy: 0.5, comp: STABS, stretch: true, lead: ["G5:.5 E5:.5 C5:.5 r:.5 D5:1 E5:1", "A5:.5 F5:.5 C5:.5 r:.5 B4:1 D5:1"] },
    { kind: "build", bars: 2, harmony: ["Am Dm", "G7"], bass: ["A1:1 E2:1 D2:1 A2:1", "G1:.5 G1:.5 B1:.5 D2:.5 F2:1 r:1"], groove: "main", energy: 0.6,
      lead: ["r:.5 A4:.5 r:.5 C5:.5 r:.5 E5:.5 r:.5 A5:.5", "G5:.5 F5:.5 D5:.5 B4:.5 G4:1 r:1"], comp: [STABS, "x:.5 r:.5 x:.5 r:.5 x:1 r:1"] },
    { kind: "hook", bars: 3, ...sec(["C F", "Am G7", "F G7"]), energy: 0.8, comp: PUSH, lead: ["G5:.5 C6:1 B5:.5 C6:.5 E6:1.5", "E5:.5 A5:1 C6:.5 B5:.5 G5:1.5", "A5:.5 C6:1 F6:.5 E6:.5 C6:1.5"] },
    { kind: "outro", bars: 2, harmony: ["C", "C"], bass: ["C2:1 G2:1 C2:1 r:1", "C2:1 r:3"], groove: null, energy: 0.7, comp: ["x:1 r:1 x:1 r:1", "x:1 r:3"], lead: ["C6:.5 E6:.5 G6:1 r:2", "C6:1 r:3"] },
  ] },
];
// shift every note name up by `s` semitones (flats for flat keys); chord labels are left alone
const NOTE = /\b([A-G])([#b]?)(-?\d)\b/g, PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const up = (v: unknown, s: number, flats: boolean): unknown => {
  if (typeof v === "string") return v.replace(NOTE, (_m, l: string, a: string, o: string) => { const n = Number(o) * 12 + PC[l] + (a === "#" ? 1 : a === "b" ? -1 : 0) + s; return (flats ? FLAT : SHARP)[((n % 12) + 12) % 12] + Math.floor(n / 12); });
  if (Array.isArray(v)) return v.map((x) => up(x, s, flats));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "kind" || k === "groove" || k === "harmony" ? x : up(x, s, flats)]));
  return v;
};
export type Variant = { name: string; tune: 0 | 1; shift: number; key: string; groove: "skip" | "shuffle" | "bounce"; flats: boolean; seed: number };
export const VARIANTS: Variant[] = [
  { name: "Lily Pad Skip", tune: 0, shift: 0, key: "F", groove: "skip", flats: true, seed: 1101 },
  { name: "Pond Shuffle", tune: 1, shift: 0, key: "C", groove: "shuffle", flats: false, seed: 1102 },
  { name: "Sunny Bounce", tune: 0, shift: 2, key: "G", groove: "bounce", flats: false, seed: 1103 },
  { name: "Reed Skip", tune: 1, shift: 2, key: "D", groove: "skip", flats: false, seed: 1104 },
];
export const themeFor = (n: number, title: string, variant: Variant = VARIANTS[((n % 4) + 4) % 4]): Material => {
  const t = TUNES[variant.tune], moved = up({ sections: t.sections, chords: t.chords }, variant.shift, variant.flats) as Pick<Material, "sections" | "chords">;
  return {
    style: "playful", title: `${title} (${variant.name})`, seed: variant.seed, mood: "playful", bpm: 120, key: variant.key, mode: "major", meter: "4/4",
    moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 },
    levels: variant.groove === "skip" ? { chords: -5, bass: -3.5 } : { chords: -5, bass: -3.5, ghost: 6, hat: variant.groove === "bounce" ? -3 : 0 },
    swing: variant.groove === "skip" ? t.swing : 0.56, dyn: [0.55, 0.7], tail: 1.4, ...moved,
    grooves: { main: { family: variant.groove, density: 0.5, variation: 0.35 } },
  };
};
