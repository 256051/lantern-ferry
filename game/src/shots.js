// The screenshot scenes behind ?shot=start|play|end|win. Each one plays the real rules forward
// from a fresh world for a fixed number of steps, steered by a simple autopilot (look ahead each
// way the boat could move, keep clear of rocks, chase the lowest lantern or koi when that is
// safe), so the frame is what a short game really looks like and the same seed always gives
// the same frame. The win scene plays a full 90-second trip with a careful pilot; if that
// pilot is caught out, it stages a win from a healthy mid-trip state instead.
import { FIELD, PLAYER, STEP, TRIP_SECONDS } from './config.js';
import { EVENT_OVER, EVENT_WIN, KIND_ROCK } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 26;
const END_LIMIT_SECONDS = 600;
/**
 * How far ahead, in seconds, the autopilot checks each way it could move: the play scene's pilot
 * looks well ahead and keeps all its lives; the end scene's looks only a moment ahead, so it is
 * caught out once the rocks speed up, as a hurried player is.
 */
const HORIZON_PLAY = 0.7;
const HORIZON_END = 0.25;
const SAMPLE = 1 / 30;
const DIRECTIONS = [0, -1, 1];
/** Extra room, each side, it keeps between the boat and a rock. */
const MARGIN = 12;

/** Seconds until moving in `direction` (-1, 0, 1) runs the boat into a rock; Infinity when it never does. */
function timeToHit(state, direction, horizon) {
  const player = state.player;
  for (let t = SAMPLE; t <= horizon; t += SAMPLE) {
    const x = Math.min(FIELD.width - player.width, Math.max(0, player.x + direction * PLAYER.speed * t));
    for (let index = 0; index < state.items.length; index += 1) {
      const item = state.items[index];
      if (!item.active || item.kind !== KIND_ROCK) continue;
      const y = item.y + item.speed * t;
      if (y + item.height > player.y && y < player.y + player.height && item.x < x + player.width + MARGIN && item.x + item.width > x - MARGIN) return t;
    }
  }
  return Infinity;
}

/** Of the safe ways to move, the one toward the lowest lantern or koi (or the centre); else the one that is hit last. */
function autopilot(state, horizon) {
  const player = state.player;
  let target = null;
  for (let index = 0; index < state.items.length; index += 1) {
    const item = state.items[index];
    if (item.active && item.kind !== KIND_ROCK && (target === null || item.y > target.y)) target = item;
  }
  const aim = target === null ? FIELD.width / 2 : target.x + target.width / 2;
  const centre = player.x + player.width / 2;
  const wanted = aim > centre + 8 ? 1 : aim < centre - 8 ? -1 : 0;
  let best = wanted;
  let bestTime = timeToHit(state, wanted, horizon);
  for (let index = 0; index < DIRECTIONS.length && bestTime !== Infinity; index += 1) {
    const time = timeToHit(state, DIRECTIONS[index], horizon);
    if (time > bestTime) {
      bestTime = time;
      best = DIRECTIONS[index];
    }
  }
  return best;
}

function playFor(world, seconds, horizon) {
  let events = 0;
  for (let index = 0; index < seconds / STEP; index += 1) {
    events = world.step(STEP, autopilot(world.state, horizon), false);
    if (events & (EVENT_OVER | EVENT_WIN)) break;
  }
  return events;
}

/** A dodge-only pilot: it never chases a lantern, it only keeps clear of rocks. A player
 * who rows like this survives the whole trip with lives to spare, which is what makes the
 * win scene a real 90-second run instead of a staged one. */
function dodgeOnly(state, horizon) {
  let best = 0;
  let bestTime = timeToHit(state, 0, horizon);
  for (const direction of [-1, 1]) {
    const time = timeToHit(state, direction, horizon);
    if (time > bestTime) {
      bestTime = time;
      best = direction;
    }
  }
  return best;
}

function playWin(world) {
  let events = 0;
  for (let index = 0; index < (TRIP_SECONDS + 1) / STEP; index += 1) {
    events = world.step(STEP, dodgeOnly(world.state, 1.2), false);
    if (events & (EVENT_OVER | EVENT_WIN)) break;
  }
  return events;
}

/**
 * Set `world` to the named scene (start, play, end or win; any other name is start) and return
 * the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end' && name !== 'win') {
    for (let index = 0; index < START_SECONDS / STEP; index += 1) world.step(STEP, 0, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'win') {
    const events = playWin(world);
    if (events & EVENT_WIN) return { screen: SCREEN_WIN, best: world.state.score };
    // The careful pilot was caught out: stage a win from a healthy state instead.
    world.reset();
    playFor(world, 30, 0.9);
    world.state.elapsed = TRIP_SECONDS;
    world.state.score = Math.max(world.state.score, 320);
    world.state.lives = 2;
    return { screen: SCREEN_WIN, best: world.state.score };
  }
  // The end scene is a loss, not a win: cap it before the 90-second trip ends, so the
  // hurried pilot is caught out (or is staged as caught out) instead of reaching the shore.
  const limit = name === 'end' ? 80 : PLAY_SECONDS;
  const horizon = name === 'end' ? HORIZON_END : HORIZON_PLAY;
  for (let index = 0; index < limit / STEP; index += 1) {
    if (world.step(STEP, autopilot(world.state, horizon), false) & EVENT_OVER) break;
  }
  if (name === 'end' && world.state.lives > 0) world.state.lives = 0;
  const over = world.state.lives === 0;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.score };
}
