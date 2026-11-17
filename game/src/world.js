// The game's rules and state, with no drawing and no browser in it: the boat, the pool of
// drifting rocks, lotus lanterns and golden koi, spawning, collisions, score, combo, lives,
// level and the trip to the far shore. step() advances one fixed step and returns what
// happened as bit flags, so the caller can react without the world knowing about screens
// or sound. Nothing here allocates after createWorld returns.
import { FIELD, KOI, LANTERN, LEVEL, LIVES, PLAYER, POOL_SIZE, ROCK, TRIP_SECONDS } from './config.js';

export const KIND_ROCK = 0;
export const KIND_LANTERN = 1;
export const KIND_KOI = 2;

export const EVENT_HIT = 1;
export const EVENT_LANTERN = 2;
export const EVENT_KOI = 4;
export const EVENT_OVER = 8;
export const EVENT_WIN = 16;

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function createWorld(random) {
  const player = { x: 0, y: FIELD.boatY, width: PLAYER.width, height: PLAYER.height, invulnerable: 0 };
  const items = [];
  for (let index = 0; index < POOL_SIZE; index += 1) {
    items.push({ active: false, kind: KIND_ROCK, x: 0, y: 0, width: 0, height: 0, speed: 0, phase: 0 });
  }
  const state = {
    player, items, score: 0, lives: LIVES, level: 1, elapsed: 0,
    combo: 0, bestCombo: 0, rockTimer: 0, lanternTimer: 0, koiTimer: 0, won: false,
  };

  function reset() {
    player.x = (FIELD.width - player.width) / 2;
    player.invulnerable = 0;
    for (const item of items) item.active = false;
    state.score = 0;
    state.lives = LIVES;
    state.level = 1;
    state.elapsed = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.won = false;
    state.rockTimer = ROCK.interval;
    state.lanternTimer = LANTERN.interval;
    state.koiTimer = KOI.interval;
  }

  function freeItem() {
    for (let index = 0; index < items.length; index += 1) if (!items[index].active) return items[index];
    return null;
  }

  function spawnRock() {
    const item = freeItem();
    if (item === null) return;
    item.active = true;
    item.kind = KIND_ROCK;
    item.width = ROCK.minWidth + random() * (ROCK.maxWidth - ROCK.minWidth);
    item.height = ROCK.height;
    item.x = random() * (FIELD.width - item.width);
    item.y = FIELD.waterY - item.height;
    item.speed = ROCK.speed + ROCK.speedPerLevel * (state.level - 1) + random() * ROCK.speedJitter;
    item.phase = random() * Math.PI * 2;
  }

  function spawnLantern() {
    const item = freeItem();
    if (item === null) return;
    item.active = true;
    item.kind = KIND_LANTERN;
    item.width = LANTERN.size;
    item.height = LANTERN.size;
    item.x = random() * (FIELD.width - item.width);
    item.y = FIELD.waterY - item.height;
    item.speed = LANTERN.speed + LANTERN.speedPerLevel * (state.level - 1);
    item.phase = random() * Math.PI * 2;
  }

  function spawnKoi() {
    const item = freeItem();
    if (item === null) return;
    item.active = true;
    item.kind = KIND_KOI;
    item.width = KOI.width;
    item.height = KOI.height;
    item.x = random() * (FIELD.width - item.width);
    item.y = FIELD.waterY + 40 + random() * 380;
    item.speed = KOI.speed + KOI.speedPerLevel * (state.level - 1);
    item.phase = random() * Math.PI * 2;
  }

  function rockInterval() {
    return Math.max(ROCK.minInterval, ROCK.interval * ROCK.intervalScale ** (state.level - 1));
  }

  /**
   * One fixed step. `direction` is -1, 0 or 1 (left, still, right). With `harmless` set (the title
   * screen's backdrop) things drift but nothing touches the boat and nothing scores.
   */
  function step(dt, direction, harmless) {
    let events = 0;
    state.elapsed += dt;
    state.level = Math.min(LEVEL.max, 1 + Math.floor(state.elapsed / LEVEL.seconds));

    player.x = Math.min(FIELD.width - player.width, Math.max(0, player.x + direction * PLAYER.speed * dt));
    if (player.invulnerable > 0) player.invulnerable = Math.max(0, player.invulnerable - dt);

    state.rockTimer -= dt;
    if (state.rockTimer <= 0) {
      spawnRock();
      state.rockTimer += rockInterval();
    }
    state.lanternTimer -= dt;
    if (state.lanternTimer <= 0) {
      spawnLantern();
      state.lanternTimer += LANTERN.interval + random() * LANTERN.intervalJitter;
    }
    state.koiTimer -= dt;
    if (state.koiTimer <= 0) {
      spawnKoi();
      state.koiTimer += KOI.interval + random() * KOI.intervalJitter;
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item.active) continue;
      item.y += item.speed * dt;
      item.phase += dt * 2;
      if (item.y > FIELD.height + 40) {
        item.active = false;
        if (item.kind === KIND_ROCK && !harmless) state.score += ROCK.dodgePoints;
        continue;
      }
      if (harmless || !overlaps(item, player)) continue;
      if (item.kind === KIND_LANTERN) {
        item.active = false;
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.score += LANTERN.points + Math.min(state.combo - 1, 5);
        events |= EVENT_LANTERN;
      } else if (item.kind === KIND_KOI) {
        item.active = false;
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.score += KOI.points;
        events |= EVENT_KOI;
      } else if (player.invulnerable === 0) {
        item.active = false;
        state.lives -= 1;
        state.combo = 0;
        player.invulnerable = PLAYER.invulnerable;
        events |= EVENT_HIT;
        if (state.lives === 0) {
          events |= EVENT_OVER;
          break;
        }
      }
    }

    // The win fires once: reaching the far shore ends the trip, it does not pay per step.
    if (!harmless && !state.won && state.elapsed >= TRIP_SECONDS && state.lives > 0) {
      state.won = true;
      state.score += state.lives * 50;
      events |= EVENT_WIN;
    }
    return events;
  }

  reset();
  return { state, reset, step };
}
