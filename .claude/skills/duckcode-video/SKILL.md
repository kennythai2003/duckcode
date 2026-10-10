---
name: duckcode-video
description: Make a new duckcode LeetCode visualization video (rubber ducks as the input, muted crayon style, a clean LeetCode-style code panel, a composed score with effects and quacks, 40-70 s) in this repo, quickly and cheaply. Use whenever the user asks for a new duck video, a new problem, pastes the PROMPT_TEMPLATE, or asks for a change to an existing one.
---

# duckcode video: the fast path

The style is **settled** and the user approved it: muted crayon, a clean dark code panel, Space
Grotesk and JetBrains Mono, a playful marimba score, kit effects plus our own quack. **Do not ask
style questions again, and do not re-explore anidoodle.** Everything you need is already in this
repo. Copy the closest existing film (see "Which film to copy").

## The user's standing rules (hard requirements)

1. **Length: 40-70 s** (1200-2100 frames). Pace it so a viewer can follow every step: no code
   line highlighted for less than 1 s (30 frames), every reveal (a key forming, a hit, a regroup)
   held 1.5-2 s (45-60 frames). Faster than this was called "a bit fast".
2. **Code format, always LeetCode style:** the input line(s) first, then the user's `class
   Solution:` verbatim, then `print(Solution().<method>(<args>))`. No blank lines (they waste
   panel rows). Use the user's code exactly as pasted; only add the input line(s) and the print.
3. **Multiple rows are fine and preferred over cramming.** Ducks may sit in 2 rows. Long strips
   (the alphabet, a big array, a grid) may wrap into 2 rows. Never shrink text below ~20 px to fit one row.
4. The style, sound and fonts are fixed (crayon, muted, marimba + effects + quacks). Don't ask.
5. Results go to `videos/<kebab>.mp4` plus a poster, a README row, a commit and a push to the session branch.

The user may paste the template from `PROMPT_TEMPLATE.md`. Its fields map 1:1 onto `PROBLEM`, `CODE`, the inputs and the story.

## What NOT to do (the waste in the first two videos)

| Waste | Cost | Do this instead |
|---|---|---|
| Reading the anidoodle skill docs, `README`s, `compose.md`, `sound-design.md`, `koi.ts`, `balloon.ts`, `core.ts`, `gallery.ts` | ~60k tokens | Don't. The APIs you need are summarised below; the kit wraps them. |
| `cat`-ing whole big files (core.ts + koi.ts + film.ts in one dump came to 64 KB) | ~25k | `grep -n` for the symbol you need, or `sed -n` a range. |
| Re-scaffolding, `npm install` exploration, `scaffold.mjs --help` | ~5k | The project is scaffolded. Run `npm install` only if `node_modules/` is missing. |
| Fetching fonts from jsDelivr or Google Fonts (blocked, 403) | 1 round trip | The fonts are in `assets/fonts/`. If you ever need another: `npm pack @fontsource/<name>` works through the proxy. |
| Building a whole style (marker comic), then restyling it | The entire first pass | The style is fixed. Reuse `duck/*`. |
| Re-solving the font plumbing and the gate's "embedded binary" failure | ~8k | Already patched (`page.ts`, `build-page.mjs`, `adapters/html-player.mjs`). Declare fonts as `assets: { fonts: FONTS }`. |
| `still.mjs --sheet --out x.png` (the flag parsing breaks: it writes to a file named `--out`) | 1 failed call | Render `--frames a,b,c` (no `--out`), then hstack with ffmpeg (command below). |
| Several layout passes (the panel spilling off the bottom, bubbles over tags, the card over ducks, magnifier tails crossing the screen) | ~4 renders | Use the layout constants below. They are proven. |
| 2-3 `music.mjs check` runs to find the stem levels | ~3 runs | Start with `levels: { chords: -5, bass: -3.5 }` and the mood controls below. One check. |
| Looking at five full-size stills one by one | ~5 images | One stitched sheet of 3-4 frames, cropped to the action band (y 300-1200) if only the pond matters. |
| Re-reading files right after writing them, or re-reading big tool output | small, but it adds up | Trust the write. Pipe long tool output through `grep -E` for the lines that matter. |

Target budget for a new problem: **~1 look sheet, 1 full render, 1 music check, 1 gate.**

## The kit (what exists; use it, don't re-read it)

`src/canvas-core/duck/`

- **`crayon.ts`**
  - The palette `C`: `ink`, `inkSoft`, `duck`, `rose`, `teal`, `gold`, `pad`, `deep`, `deepest`, `glint`, `wood`, …
  - `PAPER`, `CRAYON_M`.
  - Drawing: `scribble`, `cline` (a contour drawn twice), `closed(pts)`, `crayonShape(g, pts, {col, shade, seed, ...})` (the whole crayon recipe), `wax(g, fn)` (a group with paper tooth).
  - **Sprites:** `sprite(env, key, w, h, ox, oy, g => ...)`, which is cached per key, and `blit(ctx, env, s, x, y, sx, sy, rot, alpha)`. ANYTHING that moves or pops must be a sprite. Crayon scribbles drawn per frame at moving coordinates swim and cost ~100 ms each.
- **`duck.ts`**
  - `drawDuck(ctx, env, g, pose, f)`, with `pose = {x, y, k, lift, sx, sy, tilt, eye, look, label, seed, mouth}`.
  - Eyes: `"open" | "happy" | "blink" | "wide" | "worried"`.
  - Placement helpers: `headTop(pose)`, `chest(pose)`.
  - `drawPointer(ctx, env, at, k, tilt, "i")` draws the pennant. Other pointer names (`j`, `lo`, `hi`, `l`, `r`) are just a different letter, and each gets its own cached sprite.
  - Labels of up to 3 characters fit the roundel.
- **`pond.ts`**
  - `pondPlate(env)`: the static background, cached. Draw it with `drawImage` first.
  - `waterGlints(g, f, W, H)`.
  - `drawPad`, `padShapeP`, `POND.HORIZON = 560`.
- **`fx.ts`**
  - `drawBubble(ctx, env, cx, cy, parts, tailTo, q, seed, size?)`, where `parts = [text, colour][]`.
  - `drawSign`, `drawMagnifier`, `drawEntry(ctx, env, x, y, "2 : 0", q, glow)`.
  - `drawSparkle`, `drawCheck`, `drawCross`.
  - `splash(g, x, y, t01, seed, k)`.
  - `drawTag` (the index tags).
  - `waterRing(g, x, y, k, colour, q, seed)`: rose = being asked, teal = visited, gold = answer.
  - `drawCard(ctx, env, x, y, title, value, q)`: the answer card.
- **`codePanel.ts`**: `drawPanel(g, lines, layout, {line, alpha, pulse, watch, watchFresh, flash, output, outQ})`.
  - `line` is fractional while the highlight bar slides.
  - The Python tokenizer handles keywords, builtins, numbers and def names.
- **`kit.ts`**
  - `ease.out/inOut/back/spring`, `prog(f, f0, dur)`.
  - `text(g, s, x, y, {size, weight, fill, stroke, sw, align})`, which must be called inside a group or a sprite.
  - `roundRect`, `ellipse`, `FONTS`.
- **`quack.ts`**: `quackInto(L, R, sr, sample, semis, seed, pan, level)`.
- **`motion.ts`**: `hop(f, f0, h, dur)` and `drop(f, land)`. Use these; don't copy them into the film.
- **`chrome.ts`**: `titleSprite(env, title, sub)` and `pillSprite(env, parts)` (the parameters pill, sized to its text).
- The code panel tokenizer colours strings. `PanelLayout.file` sets the tab name (default `two_sum.py`). **Always set it.**

**Sprite keys must change when the content changes** (the label, the text, the tail offset). `drawBubble` keys on its text and on the rounded tail offset. Keep the tail offset constant relative to the bubble (`[mx + 60, my + 6]` from `cx = mx + 250, cy = my + 12`). That stops the cache growing every frame.

## Screen zones (1080×1920)

| Zone | y range | Holds |
|---|---|---|
| Title | 180-470 | title sprite (540, 270), input pill (540, 432) |
| Duck rows | 600-940 | 1 row at `DUCK_Y 820-830`, or 2 rows at **y 740 and 900, k 0.6**, 6 per row, x from 110 every 172 |
| Data structures | 950-1180 | one strip or row of cards; or **two rows at y 985 and 1060**, with cards at 1130 |
| Code panel | 1196-1900 | up to 15 code lines at `size 23, lh 34` |

If both the ducks and the structures need 2 rows, move the panel down to `y 1240` with `lh 32`
(14 lines max), or drop the index tags (state is already shown by rings).

## Proven layout (1080×1920, 30 fps, 120 bpm: a beat is 15 frames, a bar 60)

| Thing | Value |
|---|---|
| Title sprite | (540, 270): "Problem name", gold crayon underline, "LeetCode N · Python" |
| Target / params pill | (540, 432). Fade it out at `print - 6` (the answer card takes its place). |
| Ducks | `DUCK_Y = 830`, `k = 0.95`, x = `[195, 425, 655, 885]` for 4 ducks. Two groups of 3 (e.g. s and t): `k 0.68`, x `[100, 262, 424, 656, 818, 980]`, group labels at y 952-980 (validAnagram.ts). Up to 5 ducks: k 0.8, x spaced 200 from 140. Past 6, use 2 rows or a smaller k. |
| Index tags | y 915 |
| Data-structure row (seen pond, stack, queue…) | sign at (150, 1080), items at y 1082, x from 380 every 260 |
| Speech bubble over a duck | cy 600, cx clamped to [260, 820], tail to (headTop.x + 40, 680) |
| Verdict bubble near the magnifier | `cx = mx + 250..260, cy = my + 12`, magnifier at `my = PAD_Y - 96` |
| Answer card | (540, 540) |
| Code panel | `{x: 46, y: 1196, w: 988, size: 29, lh: 40, pad: 18}` holds 12 lines; `size 27, lh 36` holds 14; **`size 23, lh 34` holds 15 and fits a typed LeetCode signature (~64 chars)**. With `class Solution:` you are almost always at 10-15 lines, so start at `size 23, lh 34`. |
| Alphabet / count strip | one row of 26 at cell 38 is cramped. Prefer **2 rows of 13 at cell 64** (x0 = 540 - 6.5*64), rows at y 985 and 1060, letters under each cell. |
| Watch strip | Fits about 900 px of chips (~50 mono characters in total). Keep the values short. |

## Which film to copy

| Problem shape | Copy |
|---|---|
| one array plus a lookup table (hash map / set) | `twoSum.ts` |
| two inputs plus a counter | `validAnagram.ts` |
| a list of words or strings, grouping or bucketing, counting letters | `groupAnagrams.ts` |
| anything else | the nearest of the three; add the new visual to `fx.ts` (see Speed-ups) |

## Timeline recipe

The pattern is data-driven:
- `IT[]` holds one entry per loop iteration: `{start, need, look, store?, found?}`.
- `CUE` holds the intro and ending frames.
- `RUN` (code line per frame) and `WATCH` (variable chips) are **derived** from `IT`.
- Every cue frame is a multiple of 15.
- Intro (always the same):
  - The ducks land at 15, 23, 30 and 38.
  - Then come `nums` 45, `target` 60, `call` 75 and the data structure 90.
  - The first iteration starts at 120.
- An iteration takes 4 bars (240 frames) for the first one, then 3 bars (180) for misses, then 3 bars for the hit.
- Ending: `ret`, then `print` 60 frames later, then `party` 30 frames after that, then 90 frames of hold. Declare it in `meta.holds`.
- **Length: 40-70 s.** Budget in frames (30 fps):
  - intro 180: the ducks land, the input pill, the call line
  - setup 60-90 per setup line (e.g. `res = ...`, `count = ...`)
  - **first pass 240-300**: walk every inner line at ≥ 30 frames each and hold the reveal 45-60
  - later passes 150-210 each
  - ending ~330: return 60, regroup or answer 90, print card 60, party 30, hold 90+

  Example: intro 180 + setup 90 + passes (270 + 4×180) + ending 330 = 1590 frames ≈ 53 s.
- If there are many passes (more than 6), show the first two at full speed, compress the middle
  ones (90 frames, with a small "⏩" badge on the pennant), then slow down again for the decisive pass.
- With the old 30 s pacing every iteration was squeezed (90 frames for 3 letters plus an append);
  at the new pacing give each flying item ≥ 15 frames of air time and ≥ 10 frames between items.
- Pick an input whose story has a **miss before the hit**, ideally one with a surprising value (like need = −2).

## Score recipe

Copy `twoSumScore.ts`. Keep these settings:
- `style: "playful"`, 120 bpm, 4/4
- `levels: { chords: -5, bass: -3.5 }`
- `moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 }`
- `swing: 0.54`, `tail: 1.2`

Bars = frames / 60, so a 40-70 s film is **20-35 bars**. Make the form longer with sections, not with tempo:
- a `verse` per pass group (4-6 bars each)
- `repeat: 2` on a verse whose lines you also vary with `loopLines`
- or a second `verse` with new motif variations, so the motif develops instead of looping verbatim

Map the sections onto the picture:
- intro, 2 bars, no groove
- a verse per iteration
- a quieter verse for misses (energy 0.42)
- a 2-bar build ending in a stop
- a 3-bar hook starting on the hit's `look` frame
- a 1-bar outro: tonic chord, `lead "F6:1 r:3"`, `bass "F2:1 r:3"`

**Write NEW motifs and change the key or mode for each problem**: `novelty` fails on reuse, and that includes our own earlier scores. Rules of thumb:
- Lead range C4-C7.
- Chord tones on the beats.
- Two chords per bar.
- Bass root-fifth.
- Every notation bar must add up to 4 beats; the check throws otherwise.
- One `stretch: true` section.

Effects (`twoSumSound.ts`):
- Copy it and swap the iteration-specific labels; it builds the cues from `CUE`.
- Exactly one riser (ending on the hit's `look` frame) and one `impact` (soft, at `print`).
- The quacks come from the `QUACKS` list in the film, so the picture (an open bill) and the sound stay in sync.

## Commands, in order (and only these)

```bash
cd /home/user/duckcode
npx tsc --noEmit -p . 2>&1 | grep -E "<film>|duck/"            # silent = good
node tools/still.mjs <film> --frames A,B,C,D 2>&1 | tail -2     # pick: mid-iteration-1, a miss verdict, the hit, the answer card
cd out && ffmpeg -v error -y -i still-<film>-A.png -i still-<film>-B.png -i still-<film>-C.png -i still-<film>-D.png \
  -filter_complex "[0]scale=540:-1[a];[1]scale=540:-1[b];[2]scale=540:-1[c];[3]scale=540:-1[d];[a][b][c][d]hstack=4" sheet.png   # look at ONE image
node tools/music.mjs check src/canvas-core/<film>Score.ts#<export> 2>&1 | grep -E "FLAG|CRAFT|CHECK|master|cadences"
node tools/render.mjs <film> 2>&1 | grep -E "audio:|draw median|output|determinism|rror|  #"  # ~2.5 min per 900 frames; 1800 frames ≈ 5-6 min: use run_in_background (or timeout 600000)
node tools/gate.mjs <film> 2>&1 | grep -E "FAIL|GATE:"
node tools/verify-export.mjs out/<film>.mp4 --film <film> 2>&1 | grep -E "VERIFY-EXPORT:|FAIL"
ffmpeg -v error -y -i out/<film>.mp4 -vf "select='not(mod(n\,56))',scale=216:-1,tile=8x2" -frames:v 1 out/vsheet.png   # one look at the motion
cp out/<film>.mp4 videos/<kebab-name>.mp4   # + a poster still, update the README table, commit, push
```

Every new film also needs a host page: `src/hosts/page-<film>.ts`, three lines: import the film, then `mountFilm(film)`.

Add `--frames` stills only for the moments you changed. Never re-render the full film just to check one frame.

## Speed-ups worth doing when the next problem asks for them

- **Generic structures.** If the next problem is not "loop and look up in a hash map", add one reusable visual to `fx.ts` rather than inline code in the film:
  - two pointers: two pennants `l` and `r`
  - a stack: entries stacked on the sign
  - a sliding window: a rope ring around a range of ducks
  - a linked list: ducks in a column with arrows

  Then the film file stays a cue table plus `draw`.
- **Extract the shared film skeleton** (now overdue: three films repeat it). The title, input pill, duck rows, rings, tags, the `RUN`/`WATCH` wiring and the panel could become `duck/film.ts` (`duckFilm({ title, sub, code, labels, rows, passes, draw extras })`). Do it at the start of the next video. After that each new video is mostly data, which saves ~15k tokens a video.
- **Don't download the sound pack** (recorded marimba and vibes). The user is happy with the modeled sound.

## Track record

- Valid Anagram, the first video made with this skill: 1 music check, 1 look sheet (with one fix: the panel tab name), 1 render, 1 gate, 1 verify. The only advisory was the ghost snare being too quiet with the `shuffle` groove; `levels.ghost: 6` fixes it.

- Group Anagrams: 1 music check, 1 look sheet, 2 renders. The first render failed because two soft `tick` cues were buried under the score (filmSfx throws). **Start `tick:soft` cues at `gainDb: 3`-`5`.** The `bounce` groove also wants `levels: { ghost: 6, hat: -3 }`. New reusable patterns are in groupAnagrams.ts:
  - a 26-cell count strip made of cell sprites (one sprite per count value)
  - bucket cards for dictionary entries with list values
  - a final "regroup" where the ducks swim to new x positions (`duckX(i, f)`)
  - long signatures (`def f(self, x: List[str]) -> ...`) fit at `size 23, lh 34`

## Quality bar (unchanged)

- A gate of 15/15, a music `CHECK PASS`, and `VERIFY-EXPORT PASS`.
- Something moves every second.
- Text never cut by the frame edge.
- The code panel's running line always matches what the ducks are doing.
- Say plainly that you can't hear the audio.
