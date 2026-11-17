// The screenshot scenes behind ?shot=start|play|end|win. Each one plays the real rules forward
// from a fresh world for a fixed number of steps, steered by a simple autopilot (look ahead each
// way the boat could move, keep clear of rocks, chase the lowest lantern or koi when that is
// safe), so the frame is what a short game really looks like and the same seed always gives
// the same frame.
//
// The win and end scenes are real runs, never staged: the win scene's pilot collects lanterns
// and koi while dodging (horizon 0.7 s) and must reach the far shore; the end scene's pilot
// is the same collecting pilot with a much shorter look-ahead (horizon 0.15 s), the way a
// hurried player reacts late, and must lose all three lives to the rocks. Nothing here ever
// writes a score, a life count, an elapsed time or a screen by hand: if a scene does not
// reach its real outcome, stageShot throws instead of faking one.
import { FIELD, PLAYER, STEP, TRIP_SECONDS } from './config.js';
import { EVENT_OVER, EVENT_WIN, KIND_ROCK } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 26;
/** A scene that has not reached its real outcome by this long is a bug, not a screenshot. */
const SCENE_LIMIT_SECONDS = 300;
/**
 * How far ahead, in seconds, the autopilot checks each way it could move: the play and win
 * scenes' pilot looks well ahead and keeps all its lives; the end scene's looks only a
 * moment ahead, so it is caught out once the rocks speed up, as a hurried player is.
 */
const HORIZON_PLAY = 0.7;
const HORIZON_END = 0.15;
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

/**
 * Play until `wanted` (EVENT_OVER or EVENT_WIN) fires, or throw: a scene that never reaches
 * its outcome is a bug in the pilot, and staging the outcome would fake the screenshot.
 */
function playUntil(world, wanted, horizon, scene) {
  for (let index = 0; index < SCENE_LIMIT_SECONDS / STEP; index += 1) {
    const events = world.step(STEP, autopilot(world.state, horizon), false);
    if (events & wanted) return events;
  }
  throw new Error(`shot "${scene}" never reached its outcome in ${SCENE_LIMIT_SECONDS}s`);
}

/**
 * Set `world` to the named scene (start, play, end or win; any other name is start) and return
 * the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'win') {
    // A collecting pilot plays the full 90-second trip and must win it for real.
    playUntil(world, EVENT_WIN, HORIZON_PLAY, 'win');
    return { screen: SCREEN_WIN, best: world.state.score };
  }
  if (name === 'end') {
    // A hurried pilot plays until it genuinely loses all three lives to the rocks.
    playUntil(world, EVENT_OVER, HORIZON_END, 'end');
    return { screen: SCREEN_OVER, best: world.state.score };
  }
  if (name === 'play') {
    for (let index = 0; index < PLAY_SECONDS / STEP; index += 1) {
      if (world.step(STEP, autopilot(world.state, HORIZON_PLAY), false) & (EVENT_OVER | EVENT_WIN)) break;
    }
    return { screen: SCREEN_PLAY, best: world.state.score };
  }
  for (let index = 0; index < START_SECONDS / STEP; index += 1) world.step(STEP, 0, true);
  return { screen: SCREEN_TITLE, best: 0 };
}
