// MOTION: the duck films' shared moves. A hop (anticipation, stretched rise, landing squash that
// springs back) and a drop into the pond from above the frame.
export type Move = { lift: number; sx: number; sy: number };
export const hop = (f: number, f0: number, h = 70, dur = 16): Move => {
  const t = (f - f0) / dur;
  if (f < f0 - 4) return { lift: 0, sx: 1, sy: 1 };
  if (f < f0) { const a = (f - (f0 - 4)) / 4; return { lift: 0, sx: 1 + 0.06 * a, sy: 1 - 0.08 * a }; }
  if (t <= 1) return { lift: h * 4 * t * (1 - t), sx: t < 0.35 ? 0.95 : 1, sy: t < 0.35 ? 1.07 : 1 };
  const a = (f - f0 - dur) / 10; if (a > 1.6) return { lift: 0, sx: 1, sy: 1 };
  const d = Math.exp(-4 * a) * Math.cos(9 * a); return { lift: 0, sx: 1 + 0.08 * d, sy: 1 - 0.1 * d };
};
export const drop = (f: number, land: number): Move | null => {
  const fall = 14, t = (f - (land - fall)) / fall;
  if (t < 0) return null;
  if (t < 1) return { lift: 1000 * (1 - t * t), sx: 0.95, sy: 1.08 };
  return hop(f, land - 16, 0, 16);
};
