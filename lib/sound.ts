"use client";

type SoundType =
  | "click"
  | "hover"
  | "alarm"
  | "alarm-loop"
  | "success"
  | "fail"
  | "boot"
  | "promotion"
  | "tick"
  | "page"
  | "achievement"
  | "investigate"
  | "cost-up";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let alarmInterval: number | null = null;
let ambientNode: { stop: () => void } | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.45;
      masterGain.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function envelope(
  c: AudioContext,
  gainNode: GainNode,
  attack: number,
  peak: number,
  decay: number,
  duration: number
) {
  const t = c.currentTime;
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(peak, t + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.001, t + attack + decay);
  return t + duration;
}

function tone(freq: number, duration = 0.1, type: OscillatorType = "sine", volume = 0.3) {
  if (!enabled) return;
  const c = getCtx();
  if (!c || !masterGain) return;

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(masterGain);
  envelope(c, g, 0.005, volume, duration, duration + 0.05);
  osc.start();
  osc.stop(c.currentTime + duration + 0.1);
}

function chord(freqs: number[], duration = 0.4, type: OscillatorType = "triangle", volume = 0.2) {
  freqs.forEach((f) => tone(f, duration, type, volume));
}

function noiseBurst(duration = 0.06, volume = 0.15, filterFreq = 2000) {
  if (!enabled) return;
  const c = getCtx();
  if (!c || !masterGain) return;

  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = c.createBufferSource();
  source.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = filterFreq;

  const g = c.createGain();
  source.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  envelope(c, g, 0.001, volume, duration, duration);
  source.start();
  source.stop(c.currentTime + duration + 0.05);
}

export function playSound(type: SoundType) {
  if (!enabled) return;
  switch (type) {
    case "click":
      tone(620, 0.04, "square", 0.12);
      break;
    case "hover":
      tone(880, 0.025, "sine", 0.06);
      break;
    case "tick":
      tone(1200, 0.015, "square", 0.04);
      break;
    case "page":
      chord([523, 659], 0.18, "sine", 0.1);
      break;
    case "investigate":
      tone(440, 0.08, "triangle", 0.15);
      setTimeout(() => tone(660, 0.08, "triangle", 0.15), 80);
      break;
    case "alarm":
      tone(880, 0.18, "square", 0.18);
      setTimeout(() => tone(660, 0.18, "square", 0.18), 200);
      break;
    case "boot":
      tone(220, 0.1, "sawtooth", 0.12);
      setTimeout(() => tone(330, 0.1, "sawtooth", 0.1), 110);
      setTimeout(() => tone(440, 0.18, "sawtooth", 0.08), 220);
      break;
    case "success":
      chord([523.25, 659.25, 783.99], 0.4, "triangle", 0.2);
      setTimeout(() => chord([659.25, 783.99, 987.77], 0.45, "triangle", 0.18), 200);
      break;
    case "fail":
      tone(220, 0.18, "sawtooth", 0.22);
      setTimeout(() => tone(110, 0.4, "sawtooth", 0.25), 180);
      noiseBurst(0.12, 0.1, 200);
      break;
    case "promotion":
      chord([523.25, 659.25, 783.99], 0.35, "triangle", 0.2);
      setTimeout(() => chord([587.33, 739.99, 880], 0.35, "triangle", 0.2), 260);
      setTimeout(() => chord([659.25, 830.61, 987.77], 0.55, "triangle", 0.22), 520);
      break;
    case "achievement":
      tone(1320, 0.08, "square", 0.15);
      setTimeout(() => tone(1760, 0.08, "square", 0.15), 90);
      setTimeout(() => chord([1320, 1760, 2093], 0.3, "triangle", 0.15), 200);
      break;
    case "cost-up":
      tone(180, 0.06, "sawtooth", 0.1);
      break;
  }
}

export function startAlarmLoop() {
  if (!enabled) return;
  if (alarmInterval !== null) return;
  playSound("alarm");
  alarmInterval = window.setInterval(() => playSound("alarm"), 3500);
}

export function stopAlarmLoop() {
  if (alarmInterval !== null) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

export function startAmbient() {
  if (!enabled) return;
  const c = getCtx();
  if (!c || !masterGain) return;
  if (ambientNode) return;

  // low rumble + faint hum
  const osc1 = c.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 55;
  const osc2 = c.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 60;
  osc2.detune.value = 7;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.13;
  const lfoG = c.createGain();
  lfoG.gain.value = 0.02;
  const g = c.createGain();
  g.gain.value = 0.025;
  osc1.connect(g);
  osc2.connect(g);
  lfo.connect(lfoG);
  lfoG.connect(g.gain);
  g.connect(masterGain);
  osc1.start();
  osc2.start();
  lfo.start();

  ambientNode = {
    stop: () => {
      try {
        osc1.stop();
        osc2.stop();
        lfo.stop();
      } catch {}
      ambientNode = null;
    },
  };
}

export function stopAmbient() {
  ambientNode?.stop();
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (!on) {
    stopAlarmLoop();
    stopAmbient();
  }
}

export function isSoundEnabled() {
  return enabled;
}
