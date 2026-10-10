# duckcode video request: copy, fill in, paste

Only the first three fields are required. Leave the rest blank and I'll choose.

````
duckcode video

Problem: LeetCode <number>. <name>

Solution:
```python
class Solution:
    def ...
```

Input (optional, as Python literals):
Expected output (optional):
Length (optional, 40-90 s; default: whatever the problem needs):
Show it as (optional, a metaphor or focus, e.g. "the window is a rope around the ducks",
  "the stack is a tower of lily pads", "spend the most time on the shrink step"):
Avoid (optional):
````

## Tips that save credits (and make better videos)

- **Paste the exact solution you want shown.** It goes on screen verbatim, LeetCode style: the
  input line(s), your `class Solution:`, then `print(Solution().method(...))`.
- **Pick a small input that hits the interesting case.** For example, a miss before the hit, a
  duplicate, a negative number, or an early exit. About 4-8 items is ideal. The ducks wrap into two
  rows if needed, but every extra item adds seconds.
- **One request per message.** Batch your notes after you've watched a cut: "slower on X, bigger
  Y, rename Z". Each round of changes costs a re-render (about 5 minutes for a 1-minute video).
- **Say so up front if a part needs a new kind of visual** (a grid, a tree, a linked list, two
  pointers). Building a new reusable piece once is cheaper than redesigning it after a render.

## Example

````
duckcode video

Problem: LeetCode 217. Contains Duplicate

Solution:
```python
class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()
        for n in nums:
            if n in seen:
                return True
            seen.add(n)
        return False
```

Input: nums = [3, 1, 4, 1, 5]
Show it as: seen is a row of lily pads; the second 1 bumps into its twin
````
