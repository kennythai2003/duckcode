---
name: duckcode-video
description: Make a new duckcode LeetCode visualization video (rubber ducks as the input, muted crayon style, a clean LeetCode-style code panel, a composed score with effects and quacks, 40-90 s) in this repo, quickly and cheaply. Use whenever the user asks for a new duck video, a new problem, pastes the PROMPT_TEMPLATE, or asks for a change to an existing one.
---

# duckcode video: the fast path

The style is **settled** and the user approved it: muted crayon, a clean dark code panel, Space
Grotesk and JetBrains Mono, a playful marimba score, kit effects plus our own quack. **Do not ask
style questions again, and do not re-explore anidoodle.** Everything you need is already in this
repo. Copy the closest existing film (see "Which film to copy").

## The user's standing rules (hard requirements)

1. **Length: 40-90 s** (1200-2700 frames; let the problem decide: a single loop lands near 45-55 s, nested loops, two phases or many passes can run to 90 s). Pace it so a viewer can follow every step: no code
   line highlighted for less than 1 s (30 frames), every reveal (a key forming, a hit, a regroup)
   held 1.5-2 s (45-60 frames). Faster than this was called "a bit fast".
2. **Code format, always LeetCode style:** the input line(s) first, then the user's `class
   Solution:` verbatim, then `print(Solution().<method>(<args>))`. No blank lines (they waste
   panel rows). Use the user's code exactly as pasted; only add the input line(s) and the print.
3. **Multiple rows are fine and preferred over cramming.** Ducks may sit in 2 rows. Long strips
   (the alphabet, a big array, a grid) may wrap into 2 rows. Never shrink text below ~20 px to fit one row.
4. **Readability beats cuteness.** Every pointer must be identifiable at phone size in under a second.
   - Pointers on a tape, array or cells use `drawMarker(ctx, env, x, tipY, "i")` from fx.ts: a big coloured tag with the name and an arrow tip, scale ≥ 0.9.
     - Fixed colours: i/l/lo rose, j/r/hi teal, mid/k gold.
     - Two pointers on one cell sit side by side (±27 px).
   - The small head pennant (`drawPointer`) is only for the duck being visited, never for indices on a structure.
   - Markers must keep moving: bob them ±4 px (`tipY + 4 * Math.sin(f * 0.16)`). Static markers made the gate fail its dead-air check during 45-frame holds.
   - No text under ~16 px. Leave ≥ 110 px between stacked rows so markers don't cover the row above.
5. The style, sound and fonts are fixed (crayon, muted, marimba + effects + quacks). Don't ask.
6. **Every video ends with time and space complexity**: use `stageEnd(ctx, env, f, {print, party, title, value, time: ["O(n)", "why"], space: ["O(1)", "why"], y: 520})` from stage.ts. It shows the answer card at `print`, turns it into the complexity card 120 frames later, and adds the sparkles. Budget `DURATION = ceil((RET + 330) / 120) * 120` and hold from `party + 150`. Keep the card title short ("the function returns"); long method names overflow the 400 px card. Fill in an `m` the user leaves blank (e.g. m = distinct characters in s).
7. Results go to `videos/<kebab>.mp4` plus a poster, a README row, a commit and a push to the session branch.

The user may paste the template from `PROMPT_TEMPLATE.md`. Its fields map 1:1 onto `PROBLEM`, `CODE`, the inputs and the story.

## THE FASTEST PATH (use this unless the problem forces otherwise)

Start from **`src/canvas-core/findMax.ts`**, the template film. It is data plus the visuals unique to the problem; the rest comes from shared helpers:

| Need | Helper (don't rewrite it) |
|---|---|
| pond background, glints, title, input pills, code panel with running line / watch chips / console / scrolling window | `duck/stage.ts`: `stageBegin`, `stageTitle`, `stagePanel`, `checkBeats` |
| music, effects, per-duck quacks, limiter | `duck/sound.ts`: `duckSound({fps, frames, theme, cues, quacks, voices, seed})` |
| **the theme song: do NOT compose a new score** | `duck/themes.ts`: `themeFor(leetcodeNumber, title)` rotates four channel themes (Lily Pad Skip, Pond Shuffle, Sunny Bounce, Reed Skip); they stretch to the film's length and end on the answer |
| hop / drop, ducks, markers, bubbles, cards, ✓/✗, sprites | `duck/motion.ts`, `duck/duck.ts`, `duck/fx.ts`, `duck/crayon.ts` |

Steps (the whole job):
1. Run the user's Python once on a small input; note the output (and a set/dict's iteration order if iterated).
2. `cp findMax.ts <name>.ts`; set `LC`, `TITLE`, `SUB`, `NUMS`/data, `EXPECTED`, `CODE` (LeetCode style), and rewrite `STEPS`/simulation so every value comes from the user's algorithm (throw if it disagrees).
3. Edit `CUE`/`RUN`/`WATCH` frames (multiples of 15; **the length must be a multiple of 120 frames**). Put `CUE.ret` exactly **300 frames before the end** (hook = 3 bars, outro = 2 bars) so the theme's climax lands on the return and the card sits on the outro.
4. Edit `draw` for the problem's own visuals; copy its structure from the nearest older film (see "Which film to copy").
5. Write `cues` (effects) and `QUACKS`; add `src/hosts/page-<name>.ts` (3 lines).
6. `tsc` → one look sheet (3-4 frames) → background render → gate → verify → commit. **No music check is needed** (the themes are pre-checked); skip `music.mjs` entirely.

Old films (twoSum … longestConsecutive) have their own bespoke scores and cue code; leave them as they are. New films use themes. Add a fifth/sixth variant to `themes.ts` only if the user asks.

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
- **Length: 40-90 s.** Budget in frames (30 fps):
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

## Score recipe (only for the old bespoke films; new films use `themeFor`)

Copy `twoSumScore.ts`. Keep these settings:
- `style: "playful"`, 120 bpm, 4/4
- `levels: { chords: -5, bass: -3.5 }`
- `moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 }`
- `swing: 0.54`, `tail: 1.2`

Bars = frames / 60, so a 40-90 s film is **20-45 bars**. Make the form longer with sections, not with tempo:
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
node tools/render.mjs <film> 2>&1 | grep -E "audio:|draw median|output|determinism|rror|  #"  # ~2.5 min per 900 frames; 1800 frames ≈ 5-6 min, 2700 ≈ 8-9 min: always use run_in_background for long films
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

- Contains Duplicate (48 s, the first video at the slower pace): 1 music check, 1 look sheet (one fix: clamp the verdict bubble's cx to ≤ 740), 1 background render (~4 min for 1440 frames), passed first time. `containsDuplicateScore.ts` has a `bass("G Em")` root-fifth helper plus `sec(harmony)`; copy those, since they make long forms cheap to write. If the user pastes only the method body, wrap it in `class Solution:` with the LeetCode signature.

- Top K Frequent (72 s, three phases): 2 music checks, 1 look sheet with no fixes, 1 background render (~8 min for 2160 frames), passed first time.
  - **Vibes chords must stay in F3-F6**: voicings starting on E3 fail craft's range check. Start voicings on F#3 or higher.
  - 17 code lines fit at `size 22, lh 31`, with the panel at y 1186.
  - Patterns in topKFrequent.ts:
    - a multi-phase cue table (`P1`/`P2`/`P3`)
    - a second pointer walking a row of cells (`iPointer`)
    - a generic `fly(text, a, b, t0, dur, arc)` helper
    - the `res` bubble in the sky
    - `watch.delete()` to retire a chip when the watch strip gets crowded
  - `loopLines: true` with 2-bar motifs keeps a 36-bar score short to write.

- Encode and Decode Strings (72 s): 1 music check, 1 look sheet (one fix: long titles clipped; `titleSprite` now auto-fits the width), 1 background render, passed first time.
  - **Correctness rule (after a false alarm on Top K): simulate the user's algorithm in the film file and drive every on-screen value from the simulation** (`DEC: Snap[]` in encodeDecode.ts records `{f, line, i, j, length, res, note}` per executed line).
  - Throw at module load if the result differs from what's expected.
  - Before rendering, run the user's Python once on the input (`python3 -I` in the scratchpad) and compare. This costs ~1k tokens and makes a wrong answer impossible.
  - **Long code (more than 17 lines):** show a 15-line window and scroll it between phases: `CODE.slice(off, off + 15)`, `line - off`, `lineNo0: off`.
  - A one-line "what this line just did" note (e.g. `j = i + length = 6`) at y ~912 between the ducks and the data teaches more than a bubble, and is cheap.
  - Duck labels up to 4 chars now fit (20 px). `drawCard` shrinks long values automatically.

- Product of Array Except Self (52 s): Python check first, 1 music check, 1 look sheet (one fix: a label sat on a lily pad), 1 background render, passed first time.
  - Pattern: a **carried value as a travelling pill** (`prefix`/`postfix`) that rides under the current cell.
  - A two-line note: what the line did, plus what the carried value *means* ("prefix = product of everything left of i").

- Longest Consecutive Sequence (52 s): 2 renders.
  - **Iterating a Python set or dict? Print its actual iteration order with `python3 -I` and hard-code it** (`ORDER` in longestConsecutive.ts); JS can't reproduce CPython's set order. Assert that it's a permutation of the set.
  - Pattern: show a set as a **number line** (neighbours side by side), with ghost cells for the `num - 1` / `num + length` probes and a big ✓/✗ at the cell's top-right corner, never on the number.
  - **The second render was avoidable:** on a two-row structure, the marker on the lower row covered a cell in the upper row. Keep ≥ 175 px between row centres when markers point at the lower row (rows at y 972 and 1150 here). Check one still with the marker on the lower row before the full render.

- Valid Palindrome (80 s, first video on the shared helpers + themes): 3 renders; no music check needed. Lessons:
  - **A long string (30 chars) does not become 30 ducks.** Use 2 ducks (the two ends) plus a tape of cells in 2 rows of 15 (cell 58 px, pitch 68, rows at y 950 and 1125), and `l`/`r` markers.
  - **Budget the length before rendering**: 11 loop iterations came out at 96 s (over the cap). Run the simulation, print `DURATION`, and speed up the middle iterations (halve durations, min 15 frames) so it lands at ≤ 85 s. `DURATION = ceil((SIM_END + 330) / 120) * 120`.
  - **Dead-air gate**: a mostly static scene fails the gate on every long hold. Give structures a built-in ripple (`y + 4.5 * sin(f * 0.1 + c * 0.45)` per cell) and start them appearing early (frame 30), so no window is still. Do this up front for any tape or row.

- **Never cut off code the viewer needs (Valid Palindrome shipped with its helper function hidden below a 15-line window).** Before rendering, count `CODE.length`: ≤ 15 lines → `size 23, lh 34`; 16-18 lines → **`size 21, lh 30`, all visible, no window**; more than 18 → a scrolling window is allowed ONLY if the highlight actually visits every line in the file (scroll to a helper before it runs). Helper functions called by the main code must always be visible, and the note should show their result (`isAlphanumeric(',') → False`).

- **No gap between the intro and the first step (Valid Palindrome had 5 s of nothing at 0:04-0:09).** Start the simulation 30 frames after the last intro line (`def` at 120 → first step at 150). Compute `RET = ceil(SIM_END / 15) * 15`, `DURATION = ceil((RET + 300) / 120) * 120`, `print = RET + 60`, `party = RET + 90`: any spare frames go to the held answer card at the end, never to a pause. Before rendering, check that no two consecutive `RUN` frames are more than ~60 frames apart (outside the final hold).

## Quality bar (unchanged)

- A gate of 15/15, a music `CHECK PASS`, and `VERIFY-EXPORT PASS`.
- Something moves every second.
- Text never cut by the frame edge.
- The code panel's running line always matches what the ducks are doing.
- Say plainly that you can't hear the audio.

- 3Sum (80 s, 22 code lines): 1 look sheet + 1 crop check, 1 render.
  - **22 lines fit, all visible**: panel at `y 1086, size 20, lh 28` (panel height = 198 + lines × lh); the structures then live in y 600-1060.
  - **Three pointers**: pass explicit colours to `drawMarker`: i gold, l rose, r teal (l and i would both be rose by default). Rings under the ducks use the same colours.
  - **`nums.sort()` on screen**: the ducks are the array; they land in input order and swim to `SLOT[d]` (a stable sort, as Python). Keep the swim hop low (≤ 50 px) or the ducks cover the note.
  - **The note needs a paper plate** (`#efe6d3`, alpha 0.82, behind the text at NOTE_Y): over the shoreline the sub-line was unreadable.
  - `drawCard` now shrinks values over 20 chars to 30 px (nested lists).

- Best Time to Buy and Sell Stock (48 s), Longest Substring (64 s), Character Replacement (52 s): made in one batch, 1-2 look sheets each, 1 render each.
  - **Price chart pattern** (maxProfit.ts): bars under the ducks, `barH = 40 + p * 32` (a minimum height so small values stay readable), `buy`/`sell` markers on the bar tops, and a dashed profit line plus an arrow drawn with plain ctx strokes.
  - **Sliding-window pattern** (longestSubstring.ts, charReplacement.ts): a translucent teal rounded band behind the ducks from l to r (plain ctx, not crayon, so it can glide), l/r markers on the index tags, a dict as a row of key cards that glow when read or written, and rose rings on the ducks a replacement would change.
  - Put a ✓/✗ verdict into the note text ("… ?  No"), not at (540, 620): there it lands on a duck's head.
