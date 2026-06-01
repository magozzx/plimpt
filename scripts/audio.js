let audioContext;
let enabled = true;

export function setSoundEnabled(value) {
  enabled = Boolean(value);
}

export function isSoundEnabled() {
  return enabled;
}

function getContext() {
  if (!enabled) return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function beep(frequency, duration = 0.06, type = "square", gainValue = 0.035, delay = 0) {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = 0.0001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const start = ctx.currentTime + delay;
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function play(name) {
  if (!enabled) return;
  if (name === "copy") {
    beep(720, 0.07, "square", 0.035, 0);
    beep(960, 0.09, "square", 0.035, 0.08);
    return;
  }
  if (name === "error") {
    beep(140, 0.18, "sawtooth", 0.045);
    return;
  }
  if (name === "generate") {
    beep(220, 0.05, "sawtooth", 0.025, 0);
    beep(330, 0.05, "sawtooth", 0.025, 0.06);
    beep(440, 0.08, "sawtooth", 0.025, 0.12);
    return;
  }
  if (name === "boot") {
    beep(392, 0.08, "square", 0.025, 0);
    beep(523, 0.08, "square", 0.025, 0.09);
    beep(784, 0.12, "square", 0.025, 0.18);
    return;
  }
  beep(520, 0.045, "square", 0.025);
}
