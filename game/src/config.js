// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical area;
// the renderer scales it to the window, so no rule below depends on the screen size.
// Lantern Ferry: a small wooden boat carries paper lanterns down a night river to the far shore.

export const FIELD = { width: 1280, height: 720, waterY: 120, boatY: 600 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

export const PLAYER = {
  width: 110,
  height: 34,
  speed: 700,
  invulnerable: 1.5,
};

export const LIVES = 3;

/** Seconds of river to cross: reach the far shore and you win. */
export const TRIP_SECONDS = 90;

export const ROCK = {
  minWidth: 44,
  maxWidth: 110,
  height: 34,
  speed: 215,
  speedPerLevel: 16,
  speedJitter: 80,
  interval: 0.78,
  intervalScale: 0.92,
  minInterval: 0.22,
  dodgePoints: 1,
};

export const LANTERN = {
  size: 30,
  speed: 185,
  speedPerLevel: 13,
  interval: 1.15,
  intervalJitter: 0.7,
  points: 10,
};

export const KOI = {
  width: 52,
  height: 22,
  speed: 300,
  speedPerLevel: 10,
  interval: 7,
  intervalJitter: 3,
  points: 25,
};

/** Seconds of play per level, and the last level: speeds and spawn rates stop growing there. */
export const LEVEL = { seconds: 12, max: 12 };

/** How many drifting things can exist at once; the pool is allocated once, at boot. */
export const POOL_SIZE = 64;

export const PALETTE = {
  backdrop: '#0b0f1e',
  skyTop: '#141a38',
  skyMid: '#2c2a55',
  horizon: '#c96f3f',
  moon: '#f6e8c8',
  moonGlow: '#f6e8c866',
  mountainFar: '#232a4a',
  mountainNear: '#1a2140',
  waterTop: '#1d3a4d',
  waterDeep: '#0e2233',
  ripple: '#7fb3c833',
  boat: '#6b4a2f',
  boatDark: '#4a3220',
  lanternGlow: '#ffb347',
  lantern: '#ff9e3d',
  lanternPink: '#ff7d9c',
  koi: '#f2b234',
  rock: '#3a4152',
  rockTop: '#565f75',
  panel: '#141a2ee6',
  panelEdge: '#ffb347',
  text: '#f4ead8',
  muted: '#b9b3a4',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'lantern-ferry.best';
