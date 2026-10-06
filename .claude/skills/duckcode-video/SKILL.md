---
name: duckcode-video
description: Make a new duckcode LeetCode visualization video (rubber ducks as the input, muted crayon style, a clean code panel, a composed score with effects and quacks) in this repo, quickly and cheaply. Use whenever the user asks for a new duck video, a new problem, or a change to an existing one.
---

# duckcode video: the fast path

The style is **settled** and the user approved it: muted crayon, a clean dark code panel, Space
Grotesk and JetBrains Mono, a playful marimba score, kit effects plus our own quack. **Do not ask
style questions again, and do not re-explore anidoodle.** Everything you need is already in this
repo. Two Sum (`src/canvas-core/twoSum.ts`) is the template.

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
| Code panel | `{x: 46, y: 1196, w: 988, size: 29, lh: 40, pad: 18}`. It holds **12 code lines** plus the watch strip and the console. For 13-14 lines use `lh 36, size 27`. For more, trim blank lines and the `print` call before shrinking further. |
| Watch strip | Fits about 900 px of chips (~50 mono characters in total). Keep the values short. |

## Timeline recipe (copy from twoSum.ts)

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
- Length: about 24 s with 2 iterations, 30 s with 3. The user liked 30 s. Pick the input so the loop runs about 3 times.
- Pick an input whose story has a **miss before the hit**, ideally one with a surprising value (like need = −2).

## Score recipe

Copy `twoSumScore.ts`. Keep these settings:
- `style: "playful"`, 120 bpm, 4/4
- `levels: { chords: -5, bass: -3.5 }`
- `moodControls: { energy: 0.5, warmth: 0.6, brightness: 0.45, tension: 0.4, space: 0.5 }`
- `swing: 0.54`, `tail: 1.2`

Bars = frames / 60. Map the sections onto the picture:
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
node tools/render.mjs <film> 2>&1 | grep -E "audio:|draw median|output|determinism|rror"     # ~2-3 min for 900 frames
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
- **Extract the shared film skeleton.** The title, target pill, ducks, rings, tags and panel wiring could become `duck/film.ts` (`duckFilm({ title, code, nums, iters, draw extras })`). Do this when making the 2nd new problem, not before. Then each new video is mostly data, which saves ~15k tokens a video.
- **Don't download the sound pack** (recorded marimba and vibes). The user is happy with the modeled sound.

## Track record

- Valid Anagram, the first video made with this skill: 1 music check, 1 look sheet (with one fix: the panel tab name), 1 render, 1 gate, 1 verify. The only advisory was the ghost snare being too quiet with the `shuffle` groove; `levels.ghost: 6` fixes it.

## Quality bar (unchanged)

- A gate of 15/15, a music `CHECK PASS`, and `VERIFY-EXPORT PASS`.
- Something moves every second.
- Text never cut by the frame edge.
- The code panel's running line always matches what the ducks are doing.
- Say plainly that you can't hear the audio.
