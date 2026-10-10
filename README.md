# duckcode

LeetCode visualizations where the input is ducks. Each array element is a rubber duck with its value on its chest. The videos are drawn and scored entirely in code with [anidoodle](https://github.com/alexgreensh/anidoodle), in its **crayon** style, with a muted palette.

| Problem | Video |
|---|---|
| 1. Two Sum (Python), `nums = [2, 11, 7, 15]`, `target = 9`, 30 s | [`videos/two-sum.mp4`](videos/two-sum.mp4) |
| 242. Valid Anagram (Python), `s = "cat"`, `t = "act"`, 30 s | [`videos/valid-anagram.mp4`](videos/valid-anagram.mp4) |
| 49. Group Anagrams (Python), `strs = ["eat","tea","tan","ate","nat","bat"]`, 30 s | [`videos/group-anagrams.mp4`](videos/group-anagrams.mp4) |
| 217. Contains Duplicate (Python), `nums = [3, 1, 4, 1, 5]`, 48 s | [`videos/contains-duplicate.mp4`](videos/contains-duplicate.mp4) |
| 347. Top K Frequent Elements (Python), `nums = [1, 1, 1, 2, 2, 3]`, `k = 2`, 72 s | [`videos/top-k-frequent.mp4`](videos/top-k-frequent.mp4) |
| 271. Encode and Decode Strings (Python), `strs = ["neet", "code", "you"]`, 72 s | [`videos/encode-decode-strings.mp4`](videos/encode-decode-strings.mp4) |
| 238. Product of Array Except Self (Python), `nums = [1, 2, 3, 4]`, 52 s | [`videos/product-except-self.mp4`](videos/product-except-self.mp4) |
| 128. Longest Consecutive Sequence (Python), `nums = [100, 4, 200, 1, 3, 2]`, 52 s | [`videos/longest-consecutive.mp4`](videos/longest-consecutive.mp4) |
| 125. Valid Palindrome (Python), `s = "A man, a plan, a canal: Panama"`, 76 s | [`videos/valid-palindrome.mp4`](videos/valid-palindrome.mp4) |
| 15. 3Sum (Python), `nums = [-1, 0, 1, 2, -1, -4]`, 80 s | [`videos/three-sum.mp4`](videos/three-sum.mp4) |
| 121. Best Time to Buy and Sell Stock (Python), `prices = [7, 1, 5, 3, 6, 4]`, 48 s | [`videos/best-time-to-buy-and-sell-stock.mp4`](videos/best-time-to-buy-and-sell-stock.mp4) |
| 3. Longest Substring Without Repeating Characters (Python), `s = "abcabcbb"`, 64 s | [`videos/longest-substring-without-repeating.mp4`](videos/longest-substring-without-repeating.mp4) |
| 424. Longest Repeating Character Replacement (Python), `s = "ABAB"`, `k = 2`, 52 s | [`videos/longest-repeating-character-replacement.mp4`](videos/longest-repeating-character-replacement.mp4) |
| 20. Valid Parentheses (Python), `s = "()[]{}"`, 48 s | [`videos/valid-parentheses.mp4`](videos/valid-parentheses.mp4) |
| 153. Find Minimum in Rotated Sorted Array (Python), `nums = [4, 5, 6, 7, 0, 1, 2]`, 44 s | [`videos/find-minimum-in-rotated-sorted-array.mp4`](videos/find-minimum-in-rotated-sorted-array.mp4) |
| 33. Search in Rotated Sorted Array (Python), `nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`, 48 s | [`videos/search-in-rotated-sorted-array.mp4`](videos/search-in-rotated-sorted-array.mp4) |
| 206. Reverse Linked List (Python), `head = [1, 2, 3, 4, 5]`, 60 s | [`videos/reverse-linked-list.mp4`](videos/reverse-linked-list.mp4) |
| 21. Merge Two Sorted Lists (Python), `list1 = [1, 2, 4]`, `list2 = [1, 3, 4]`, 64 s | [`videos/merge-two-sorted-lists.mp4`](videos/merge-two-sorted-lists.mp4) |
| 141. Linked List Cycle (Python), `head = [3, 2, 0, -4]`, `pos = 1`, 44 s | [`videos/linked-list-cycle.mp4`](videos/linked-list-cycle.mp4) |
| 143. Reorder List (Python), `head = [1, 2, 3, 4, 5]`, 68 s | [`videos/reorder-list.mp4`](videos/reorder-list.mp4) |
| 19. Remove Nth Node From End of List (Python), `head = [1, 2, 3, 4, 5]`, `n = 2`, 44 s | [`videos/remove-nth-node-from-end.mp4`](videos/remove-nth-node-from-end.mp4) |

## Look

- **Format:** 9:16 (1080×1920), 30 fps, 120 bpm. A beat is 15 frames and a bar is 60.
- **Style:** crayon (anidoodle's `balloon` plate). Wax scribble fills that skip the paper's tooth, a darker crayon on the shade side, a pale burnish toward the light (light comes from the upper left), and a fat contour gone over twice. The colours are muted: dusty blues, sage, mustard and warm paper. Anything that moves is drawn once into a sprite and moved as a whole, so its texture doesn't shimmer.
- **Code panel:** a clean dark editor card, deliberately not hand-drawn. It shows the running line, a strip of live variables, and a console line.
- **State markers:** a rose ring is the duck being asked, a teal ring is a duck already visited, and a gold ring is the answer. A pennant on the duck's head marks the duck being visited. Index pointers on tapes and arrays are big coloured markers (`i` rose, `j` teal).
- **Type:** Space Grotesk for titles and labels, JetBrains Mono for code.
- **Sound:** a composed score (playful style, marimba, F major), anidoodle's code-built effects, and our own synthesized quack (`src/canvas-core/duck/quack.ts`).

## Layout

```
src/canvas-core/duck/      reusable duck kit
  kit.ts                   easing, lettering, geometry
  crayon.ts                the crayon hand: scribble fills, contours, palette, sprites
  duck.ts                  the duck (poses, eyes, hop/squash) + pointer pennant
  pond.ts                  the background plate (cached) + moving water glints
  codePanel.ts             the editor card (syntax colours, running line, watch, console)
  fx.ts                    bubbles, seen-signpost, magnifier, entries, sparkles, check/cross, splash, rings, answer card
  quack.ts                 the quack synth
  motion.ts                hop + drop
  chrome.ts                title block + parameters pill
  stage.ts                 pond + title + code-panel wiring shared by every film
  sound.ts                 score + effects + quacks mixer (duckSound)
  themes.ts                four rotating channel theme songs (themeFor)
  list.ts                  linked lists: next arrows, None plaque, upward pointer markers
src/canvas-core/findMax.ts     the template film: copy it for a new problem
src/canvas-core/twoSum.ts       the Two Sum film: problem, cue table, choreography
src/canvas-core/twoSumScore.ts  its score
src/canvas-core/twoSumSound.ts  score + effect cues + quacks
src/canvas-core/validAnagram*.ts the Valid Anagram film, score, sound
src/canvas-core/groupAnagrams*.ts the Group Anagrams film, score, sound
src/canvas-core/containsDuplicate*.ts the Contains Duplicate film, score, sound
src/canvas-core/topKFrequent*.ts the Top K Frequent film, score, sound
src/canvas-core/encodeDecode*.ts the Encode and Decode Strings film, score, sound
src/canvas-core/productExceptSelf*.ts the Product of Array Except Self film, score, sound
src/canvas-core/longestConsecutive*.ts the Longest Consecutive Sequence film, score, sound
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

To request a video, fill in [`PROMPT_TEMPLATE.md`](PROMPT_TEMPLATE.md) and paste it. The `duckcode-video` skill (`.claude/skills/duckcode-video/SKILL.md`) holds the standing rules: 40-90 s, LeetCode-style code, and multiple rows where they help.

By hand:

Copy `twoSum.ts` and change three things:
- the problem (`NUMS` and `CODE`)
- the loop's iterations (`IT`) and the cue table (`CUE`); `RUN` and `WATCH` are derived from them
- the story beats in `draw`

Then write a new score; never reuse an old one (anidoodle's novelty check enforces this).
