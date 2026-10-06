# duckcode

Cutesy LeetCode visualizations where the input is ducks. Each array element is a rubber duck with its value on its chest. The videos are drawn and scored entirely in code with [anidoodle](https://github.com/alexgreensh/anidoodle), in its **crayon** style, with a muted palette.

| Problem | Video |
|---|---|
| 1. Two Sum (Python), `nums = [2, 11, 7, 15]`, `target = 9`, 30 s | [`videos/two-sum.mp4`](videos/two-sum.mp4) |

## Look

- **Format:** 9:16 (1080×1920), 30 fps, 120 bpm. A beat is 15 frames and a bar is 60.
- **Style:** crayon (anidoodle's `balloon` plate). Wax scribble fills that skip the paper's tooth, a darker crayon on the shade side, a pale burnish toward the light (light comes from the upper left), and a fat contour gone over twice. The colours are muted: dusty blues, sage, mustard and warm paper. Anything that moves is drawn once into a sprite and moved as a whole, so its texture doesn't shimmer.
- **Code panel:** a clean dark editor card, deliberately not hand-drawn. It shows the running line, a strip of live variables, and a console line.
- **State markers:** a rose ring is the duck being asked, a teal ring is a duck already visited, and a gold ring is the answer. A pennant on the duck's head shows the pointer (`i`).
- **Type:** Space Grotesk for titles and labels, JetBrains Mono for code.
- **Sound:** a composed score (playful style, marimba, F major), anidoodle's code-built effects, and our own synthesized quack (`src/canvas-core/duck/quack.ts`).

## Layout

```
src/canvas-core/duck/      reusable duck kit
  kit.ts                   easing, lettering, geometry
  crayon.ts                the crayon hand: scribble fills, contours, palette, sprites
  duck.ts                  the duck (poses, eyes, hop/squash) + pointer hat
  pond.ts                  the background plate (cached) + moving water glints
  codePanel.ts             the editor card (syntax colours, running line, watch, console)
  fx.ts                    bubbles, seen-signpost, magnifier, sparkles, hearts, burst, splash, rings
  quack.ts                 the quack synth
src/canvas-core/twoSum.ts       the Two Sum film: problem, cue table, choreography
src/canvas-core/twoSumScore.ts  its score
src/canvas-core/twoSumSound.ts  score + effect cues + quacks
assets/fonts/              Space Grotesk (titles) and JetBrains Mono (code), SIL OFL 1.1
```

`src/` and `tools/` were scaffolded from the anidoodle engine. There are two small local changes, so that a film can declare fonts in `assets.fonts`:
- `src/hosts/page.ts` and `tools/build-page.mjs` load and inline the fonts.
- `tools/adapters/html-player.mjs` treats the font manifest like the image manifest.

## Commands

```bash
npm install
node tools/still.mjs twoSum --frames 0,450,660     # stills, with hashes
node tools/render.mjs twoSum                       # -> out/twoSum.mp4
node tools/gate.mjs twoSum                         # determinism, contract, dead air
node tools/music.mjs check src/canvas-core/twoSumScore.ts#twoSumScore
```

## Adding a problem

Copy `twoSum.ts` and change three things:
- the problem (`NUMS` and `CODE`)
- the loop's iterations (`IT`) and the cue table (`CUE`); `RUN` and `WATCH` are derived from them
- the story beats in `draw`

Then write a new score; never reuse an old one (anidoodle's novelty check enforces this).
