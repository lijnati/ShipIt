// Synthesizes public/music.wav: a 120 BPM beat whose hits are placed on the
// video's scene cuts (at 120 BPM every cut lands on a beat). No dependencies;
// `pnpm music` then encodes it to public/music.mp3.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const BEAT = 0.5; // 120 BPM
const DURATION = 24;
const FPS = 30;
const out = new Float32Array(Math.ceil(SR * DURATION));

// Scene timings in seconds, mirroring src/theme.ts and the scene files.
const T = {
  strike: 42 / FPS, // Hook: orange strike-through
  headline: 3,
  promise: 6,
  share: 10,
  outcome: 14,
  stamp: 14 + 8 / FPS, // SHIPPED stamp impact
  failStart: 14 + 56 / FPS,
  failEnd: 14 + 74 / FPS, // "Permanently."
  publicly: 14 + 84 / FPS,
  outro: 18,
  end: DURATION,
};

// Deterministic noise so every run renders the same file.
let seed = 0x5eed;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 0xffffffff) * 2 - 1;
};

const lowpassCoef = (hz) => 1 - Math.exp((-2 * Math.PI * hz) / SR);

/** Adds `fn(t, i)` (t = seconds since start) into the mix for `length` seconds. */
function place(start, length, fn) {
  const from = Math.max(0, Math.round(start * SR));
  const to = Math.min(out.length, Math.round((start + length) * SR));
  for (let i = from; i < to; i++) out[i] += fn((i - from) / SR, i - from);
}

// --- Instruments -----------------------------------------------------------

function kick(at, gain = 0.9) {
  let phase = 0;
  place(at, 0.45, (t) => {
    phase += (45 + 110 * Math.exp(-t * 32)) / SR;
    const click = t < 0.004 ? noise() * 0.3 : 0;
    return (Math.sin(2 * Math.PI * phase) * Math.exp(-t * 8) + click) * gain;
  });
}

function clap(at, gain = 0.32) {
  let low = 0;
  const a = lowpassCoef(1200);
  place(at, 0.22, (t) => {
    const n = noise();
    low += a * (n - low);
    const bursts = t < 0.03 ? (Math.floor(t / 0.01) % 2 === 0 ? 1 : 0.3) : 1;
    return (n - low) * bursts * Math.exp(-t * 22) * gain;
  });
}

function hat(at, gain = 0.12, decay = 70) {
  let low = 0;
  const a = lowpassCoef(7000);
  place(at, 0.12, (t) => {
    const n = noise();
    low += a * (n - low);
    return (n - low) * Math.exp(-t * decay) * gain;
  });
}

function tick(at, gain = 0.18) {
  place(at, 0.03, (t) => Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 180) * gain);
}

function saw(phase) {
  return 2 * (phase % 1) - 1;
}

function bass(at, length, hz, gain = 0.34) {
  let y = 0;
  const a = lowpassCoef(420);
  place(at, length, (t) => {
    y += a * (saw(hz * t) - y);
    const env = Math.min(1, t / 0.005) * Math.min(1, (length - t) / 0.03);
    return (y + 0.6 * Math.sin(2 * Math.PI * hz * t)) * env * gain;
  });
}

function pad(at, length, freqs, gain = 0.09, cutoff = 1400) {
  let y = 0;
  const a = lowpassCoef(cutoff);
  place(at, length, (t) => {
    let x = 0;
    for (const f of freqs) x += saw(f * 0.997 * t) + saw(f * 1.003 * t + 0.3);
    y += a * (x / freqs.length - y);
    const env = Math.min(1, t / 0.25) * Math.min(1, (length - t) / 0.2);
    return y * env * gain;
  });
}

function riser(at, length, gain = 0.3) {
  let y = 0;
  let phase = 0;
  place(at, length, (t) => {
    const p = t / length;
    y += lowpassCoef(300 + 7000 * p * p) * (noise() - y);
    phase += (180 + 1400 * p * p) / SR;
    return (y * 0.8 + Math.sin(2 * Math.PI * phase) * 0.25) * p * p * gain;
  });
}

function impact(at, gain = 1) {
  kick(at, 1.1 * gain);
  let y = 0;
  const a = lowpassCoef(5000);
  place(at, 1.4, (t) => {
    y += a * (noise() - y);
    return (y * 0.5 * Math.exp(-t * 3.2) + Math.sin(2 * Math.PI * 38 * t) * Math.exp(-t * 2.5) * 0.6) * gain;
  });
}

function swoosh(at, length, gain = 0.25) {
  let y = 0;
  place(at, length, (t) => {
    const p = t / length;
    y += lowpassCoef(8000 - 6500 * p) * (noise() - y);
    return y * Math.sin(Math.PI * p) * gain;
  });
}

/** Bit-crushed square stutter for the FAILED flash. */
function glitch(at, length, gain = 0.28) {
  place(at, length, (t) => {
    const gate = Math.floor(t / (BEAT / 6)) % 2 === 0 ? 1 : 0;
    const sq = Math.sign(Math.sin(2 * Math.PI * (t < length / 2 ? 110 : 82) * t));
    const crushed = Math.round((sq * 0.7 + noise() * 0.3) * 4) / 4;
    return crushed * gate * gain;
  });
}

// --- Arrangement -----------------------------------------------------------

const hz = { A1: 55, F1: 43.65, C2: 65.41, G1: 49 };
const chords = [
  { root: hz.A1, pad: [220, 261.63, 329.63] }, // Am
  { root: hz.F1, pad: [174.61, 220, 261.63] }, // F
  { root: hz.C2, pad: [261.63, 329.63, 392] }, // C
  { root: hz.G1, pad: [196, 246.94, 293.66] }, // G
];
const chordAt = (time) => chords[Math.floor((time - T.headline) / (4 * BEAT)) % chords.length];

/** Four-on-the-floor groove from `start` to `end`; `busy` adds 16th hats and 8th bass. */
function groove(start, end, { busy = false, padOn = true } = {}) {
  for (let t = start; t < end - 1e-6; t += BEAT) {
    const beatIndex = Math.round(t / BEAT);
    const chord = chordAt(t);
    kick(t);
    if (beatIndex % 2 === 1) clap(t);
    hat(t + BEAT / 2);
    if (busy) {
      hat(t + BEAT / 4, 0.07);
      hat(t + (3 * BEAT) / 4, 0.07);
    }
    const note = Math.min(BEAT / 2, end - t) - 0.02;
    bass(t, note, chord.root);
    if (t + BEAT / 2 < end) bass(t + BEAT / 2, note, chord.root * (busy ? 2 : 1), busy ? 0.3 : 0.22);
    if (padOn && beatIndex % 4 === 2) pad(t, Math.min(4 * BEAT, end - t), chord.pad);
  }
}

// 0–3s Hook: dark drone, a clock ticking, a swoosh on the strike-through, riser into the cut.
pad(0, T.headline, [110, 164.81], 0.07, 500);
for (let t = 0; t < T.headline - 1e-6; t += BEAT) tick(t);
swoosh(T.strike - 0.05, 0.3);
riser(1.6, T.headline - 1.6);

// 3–10s Headline + Make the promise.
impact(T.headline, 0.8);
groove(T.headline, T.promise, { padOn: false });
groove(T.promise, T.share);

// 10–14s Share the page: busier, riser into the stamp; a beat of silence before impact.
groove(T.share, T.outcome, { busy: true });
riser(12, T.stamp - 12, 0.35);

// 14–15.9s SHIPPED.
impact(T.stamp);
pad(T.stamp, T.failStart - T.stamp, chords[0].pad, 0.1, 2200);
groove(T.stamp + BEAT / 2, T.failStart, { padOn: false });

// 15.9–16.5s FAILED TO SHIP: everything drops out for a glitch.
glitch(T.failStart, T.failEnd - T.failStart);

// 16.5–18s "Permanently. Publicly." — one hit per word over a low drone.
impact(T.failEnd, 0.8);
impact(T.publicly, 0.9);
pad(T.failEnd, T.outro - T.failEnd, [55, 82.41], 0.12, 300);
riser(17, T.outro - 17, 0.25);

// 18–24s Outro: groove, then a final chord that rings out.
impact(T.outro);
groove(T.outro, 22);
kick(22, 1);
bass(22, 2, hz.A1, 0.3);
pad(22, 2, [220, 261.63, 329.63, 440], 0.12, 2000);

// --- Master: soft clip, normalize, write 16-bit mono WAV -------------------

let peak = 0;
for (let i = 0; i < out.length; i++) {
  out[i] = Math.tanh(out[i] * 1.3);
  peak = Math.max(peak, Math.abs(out[i]));
}
const scale = 0.89 / peak;

const data = Buffer.alloc(out.length * 2);
for (let i = 0; i < out.length; i++) data.writeInt16LE(Math.round(out[i] * scale * 32767), i * 2);

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const target = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "music.wav");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, Buffer.concat([header, data]));
console.log(`[make-music] wrote ${target} (${DURATION}s, 120 BPM)`);
