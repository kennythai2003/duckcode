// THE QUACK. A rubber duck's squeaky "wak!", built from nothing: a buzzy glottal source whose
// pitch scoops up then falls, through three nasal formants, with a fast attack and a short
// squeeze-tail. Seeded: every quack is a little different. Deterministic.
import { rng } from "../core";

// a biquad band-pass (RBJ cookbook), run in place over a buffer
const bandpass = (x: Float32Array, sr: number, f: number, q: number) => {
  const w = (2 * Math.PI * f) / sr, al = Math.sin(w) / (2 * q), a0 = 1 + al;
  const b0 = al / a0, b2 = -al / a0, a1 = (-2 * Math.cos(w)) / a0, a2 = (1 - al) / a0, y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
};

export const quack = (sr: number, semis = 0, seed = 1): Float32Array => {
  const r = rng(seed), dur = 0.17 + r() * 0.04, n = Math.round(dur * sr), src = new Float32Array(n);
  const f0 = 430 * Math.pow(2, semis / 12) * (0.96 + r() * 0.08);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, u = t / dur;
    // the scoop: up a fourth in the first 25 ms, then a long fall
    const pitch = f0 * (u < 0.15 ? 0.8 + 0.5 * (u / 0.15) : 1.3 - 0.45 * ((u - 0.15) / 0.85)) * (1 + 0.012 * Math.sin(t * 2 * Math.PI * 31));
    ph += pitch / sr; ph -= Math.floor(ph);
    // a narrow pulse: a reedy, buzzy source, rich in harmonics
    const pulse = ph < 0.18 ? 1 : -0.22, noise = (r() - 0.5) * 0.12;
    const env = Math.min(1, t / 0.008) * Math.pow(1 - u, 1.4) * (u > 0.75 ? 1 - (u - 0.75) * 2.4 : 1);
    src[i] = (pulse + noise) * Math.max(0, env);
  }
  const a = bandpass(src, sr, 1050, 3.2), b = bandpass(src, sr, 1750, 4), c = bandpass(src, sr, 2900, 5);
  const out = new Float32Array(n); let pk = 0;
  for (let i = 0; i < n; i++) { out[i] = a[i] * 1 + b[i] * 0.8 + c[i] * 0.45; pk = Math.max(pk, Math.abs(out[i])); }
  for (let i = 0; i < n; i++) out[i] /= pk || 1;
  return out;
};

// mix one quack into a stereo buffer at sample `at`, peak `level`, panned (-1..1)
export const quackInto = (L: Float32Array, R: Float32Array, sr: number, at: number, semis: number, seed: number, pan = 0, level = 0.34) => {
  const q = quack(sr, semis, seed), gl = level * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2, gr = level * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  for (let i = 0; i < q.length && at + i < L.length; i++) { if (at + i < 0) continue; L[at + i] += q[i] * gl; R[at + i] += q[i] * gr; }
};
