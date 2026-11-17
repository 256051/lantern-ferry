// Sound only, through Web Audio: every note is synthesised, no audio files and no
// network request. The context is created lazily on the first user gesture, so the game
// stays silent (and error-free) in screenshot mode and before the first press.
export function createSound() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        context = new AudioContext();
      } catch {
        return null;
      }
    }
    if (context && context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function tone(frequency, start, duration, type, gainValue) {
    const ctx = ensure();
    if (ctx === null || muted) return;
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(ctx.currentTime + start);
      oscillator.stop(ctx.currentTime + start + duration + 0.05);
    } catch {
      // Sound is decoration: never let it break the game.
    }
  }

  // A pentatonic pluck, climbing a little with the combo, for a collected lantern.
  function pluck(combo) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const note = scale[Math.min(combo, scale.length - 1)];
    tone(note, 0, 0.5, 'triangle', 0.16);
    tone(note * 2, 0, 0.3, 'sine', 0.05);
  }

  function koi() {
    tone(659.25, 0, 0.4, 'triangle', 0.16);
    tone(987.77, 0.07, 0.5, 'triangle', 0.14);
  }

  function hit() {
    tone(110, 0, 0.35, 'sine', 0.28);
    tone(55, 0, 0.4, 'triangle', 0.18);
  }

  function win() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((note, i) => tone(note, i * 0.12, 0.7, 'triangle', 0.15));
  }

  function click() {
    tone(880, 0, 0.12, 'sine', 0.08);
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
    pluck, koi, hit, win, click,
  };
}
