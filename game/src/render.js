// Drawing only: the world's state and the current screen in, pixels out. The 1280x720 playfield
// is scaled to fit the window and centred, the margin filled with the backdrop colour.
// Everything is drawn in code: a dusk sky, a moon, mountain silhouettes, a night river, a wooden
// boat with a paper lantern, lotus lanterns, rocks and golden koi. No images, no network.
import { FIELD, FONT, LIVES, PALETTE, TRIP_SECONDS } from './config.js';
import { KIND_KOI, KIND_LANTERN } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

/** The panel's width; its height grows with its lines: room for the title, the lines and the prompt. */
const PANEL = { width: 680, top: 148, line: 32, bottom: 76 };

function cachedLabel(prefix) {
  let value = -1;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const scoreLabel = cachedLabel('Score ');
  const bestLabel = cachedLabel('Best ');
  const comboLabel = cachedLabel('Combo x');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align) {
    if (!fonts.has(size)) fonts.set(size, `${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align;
    context.fillText(value, x, y);
  }

  function drawSky() {
    const sky = context.createLinearGradient(0, 0, 0, FIELD.waterY + 40);
    sky.addColorStop(0, PALETTE.skyTop);
    sky.addColorStop(0.6, PALETTE.skyMid);
    sky.addColorStop(1, PALETTE.horizon);
    context.fillStyle = sky;
    context.fillRect(0, 0, FIELD.width, FIELD.waterY + 40);
    // Stars.
    context.fillStyle = '#ffffffcc';
    const stars = [[80, 40], [210, 90], [330, 36], [470, 70], [620, 30], [760, 80], [900, 44], [1040, 96], [1160, 50], [150, 110], [560, 110], [980, 120]];
    for (const [x, y] of stars) context.fillRect(x, y, 2, 2);
    // Moon, with a soft glow.
    const glow = context.createRadialGradient(1060, 72, 8, 1060, 72, 90);
    glow.addColorStop(0, PALETTE.moonGlow);
    glow.addColorStop(1, 'rgba(246,232,200,0)');
    context.fillStyle = glow;
    context.fillRect(960, -20, 200, 190);
    context.fillStyle = PALETTE.moon;
    context.beginPath();
    context.arc(1060, 72, 42, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#e3d3ae';
    context.beginPath();
    context.arc(1046, 62, 8, 0, Math.PI * 2);
    context.arc(1072, 84, 6, 0, Math.PI * 2);
    context.fill();
    // Distant mountains.
    context.fillStyle = PALETTE.mountainFar;
    context.beginPath();
    context.moveTo(0, FIELD.waterY + 40);
    context.lineTo(180, 52); context.lineTo(340, FIELD.waterY + 40);
    context.lineTo(520, 30); context.lineTo(700, FIELD.waterY + 40);
    context.lineTo(880, 58); context.lineTo(1040, FIELD.waterY + 40);
    context.lineTo(1200, 44); context.lineTo(FIELD.width, FIELD.waterY + 40);
    context.closePath();
    context.fill();
    context.fillStyle = PALETTE.mountainNear;
    context.beginPath();
    context.moveTo(0, FIELD.waterY + 40);
    context.lineTo(240, 92); context.lineTo(480, FIELD.waterY + 40);
    context.lineTo(760, 78); context.lineTo(1020, FIELD.waterY + 40);
    context.lineTo(FIELD.width, 100); context.lineTo(FIELD.width, FIELD.waterY + 40);
    context.closePath();
    context.fill();
    // Far shore: a thin warm bank with tiny lights.
    context.fillStyle = '#3a2c22';
    context.fillRect(0, FIELD.waterY + 28, FIELD.width, 12);
    context.fillStyle = PALETTE.lanternGlow;
    for (const x of [120, 340, 560, 780, 1000, 1180]) {
      context.beginPath();
      context.arc(x, FIELD.waterY + 22, 3, 0, Math.PI * 2);
      context.fill();
    }
  }

  function drawRiver(state) {
    const water = context.createLinearGradient(0, FIELD.waterY, 0, FIELD.height);
    water.addColorStop(0, PALETTE.waterTop);
    water.addColorStop(1, PALETTE.waterDeep);
    context.fillStyle = water;
    context.fillRect(0, FIELD.waterY, FIELD.width, FIELD.height - FIELD.waterY);
    // Moonlight on the water, soft at the edges so it reads as light, not a pillar.
    const moonlight = context.createLinearGradient(990, 0, 1130, 0);
    moonlight.addColorStop(0, 'rgba(246,232,200,0)');
    moonlight.addColorStop(0.5, 'rgba(246,232,200,0.07)');
    moonlight.addColorStop(1, 'rgba(246,232,200,0)');
    context.fillStyle = moonlight;
    context.fillRect(990, FIELD.waterY, 140, FIELD.height - FIELD.waterY);
    // Drifting ripples, keyed to elapsed time so the river feels alive.
    context.strokeStyle = PALETTE.ripple;
    context.lineWidth = 2;
    for (let i = 0; i < 9; i += 1) {
      const y = FIELD.waterY + 60 + i * 62;
      const offset = ((state.elapsed * 24 + i * 137) % 220) - 110;
      context.beginPath();
      context.moveTo(60 + offset, y);
      context.lineTo(220 + offset, y);
      context.moveTo(760 - offset, y + 30);
      context.lineTo(920 - offset, y + 30);
      context.stroke();
    }
  }

  function drawBoat(player) {
    const cx = player.x + player.width / 2;
    const top = player.y;
    // Lantern glow on the pole.
    const glow = context.createRadialGradient(cx, top - 26, 4, cx, top - 26, 46);
    glow.addColorStop(0, 'rgba(255,179,71,0.55)');
    glow.addColorStop(1, 'rgba(255,179,71,0)');
    context.fillStyle = glow;
    context.fillRect(cx - 50, top - 76, 100, 100);
    // Pole and paper lantern.
    context.strokeStyle = PALETTE.boatDark;
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(cx, top);
    context.lineTo(cx, top - 44);
    context.stroke();
    context.fillStyle = PALETTE.lantern;
    context.beginPath();
    context.ellipse(cx, top - 30, 13, 16, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#c96f3f';
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(cx - 12, top - 34); context.lineTo(cx + 12, top - 34);
    context.moveTo(cx - 13, top - 26); context.lineTo(cx + 13, top - 26);
    context.stroke();
    // Wooden hull.
    context.fillStyle = PALETTE.boat;
    context.beginPath();
    context.moveTo(player.x + 4, top);
    context.lineTo(player.x + player.width - 4, top);
    context.lineTo(player.x + player.width - 16, top + player.height);
    context.lineTo(player.x + 16, top + player.height);
    context.closePath();
    context.fill();
    context.fillStyle = PALETTE.boatDark;
    context.fillRect(player.x + 8, top + 4, player.width - 16, 4);
    // A small figure with a straw hat, rowing.
    context.fillStyle = '#e8c9a0';
    context.beginPath();
    context.arc(cx - 18, top - 8, 7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#d9a441';
    context.beginPath();
    context.moveTo(cx - 30, top - 10);
    context.lineTo(cx - 6, top - 10);
    context.lineTo(cx - 18, top - 20);
    context.closePath();
    context.fill();
  }

  function drawItems(state) {
    for (const item of state.items) {
      if (!item.active) continue;
      const cx = item.x + item.width / 2;
      const cy = item.y + item.height / 2;
      if (item.kind === KIND_LANTERN) {
        const glow = context.createRadialGradient(cx, cy, 2, cx, cy, 34);
        glow.addColorStop(0, 'rgba(255,179,71,0.6)');
        glow.addColorStop(1, 'rgba(255,179,71,0)');
        context.fillStyle = glow;
        context.fillRect(cx - 36, cy - 36, 72, 72);
        // Lotus petals.
        context.fillStyle = PALETTE.lanternPink;
        for (let p = 0; p < 5; p += 1) {
          const a = -Math.PI / 2 + (p - 2) * 0.5;
          context.beginPath();
          context.ellipse(cx + Math.cos(a) * 10, cy + Math.sin(a) * 8 + 4, 7, 11, a, 0, Math.PI * 2);
          context.fill();
        }
        context.fillStyle = PALETTE.lantern;
        context.beginPath();
        context.arc(cx, cy - 2, 7, 0, Math.PI * 2);
        context.fill();
      } else if (item.kind === KIND_KOI) {
        const wiggle = Math.sin(item.phase) * 3;
        context.fillStyle = PALETTE.koi;
        context.beginPath();
        context.ellipse(cx, cy + wiggle, item.width / 2, item.height / 2, 0, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.moveTo(cx - item.width / 2, cy + wiggle);
        context.lineTo(cx - item.width / 2 - 14, cy - 8 + wiggle);
        context.lineTo(cx - item.width / 2 - 14, cy + 8 + wiggle);
        context.closePath();
        context.fill();
        context.fillStyle = '#7a4d12';
        context.beginPath();
        context.arc(cx + 12, cy - 3 + wiggle, 2.5, 0, Math.PI * 2);
        context.fill();
      } else {
        // Dark rock, just breaking the surface.
        context.fillStyle = PALETTE.rock;
        context.beginPath();
        context.moveTo(item.x, item.y + item.height);
        context.lineTo(item.x + item.width * 0.2, item.y + 4);
        context.lineTo(item.x + item.width * 0.55, item.y);
        context.lineTo(item.x + item.width * 0.85, item.y + 8);
        context.lineTo(item.x + item.width, item.y + item.height);
        context.closePath();
        context.fill();
        context.fillStyle = PALETTE.rockTop;
        context.fillRect(item.x + item.width * 0.3, item.y + 6, item.width * 0.3, 4);
      }
    }
  }

  function drawField(state) {
    drawSky();
    drawRiver(state);
    drawItems(state);
    const player = state.player;
    // Blink while invulnerable after a hit: hidden on every other tenth of a second.
    if (player.invulnerable === 0 || Math.floor(player.invulnerable * 10) % 2 === 1) drawBoat(player);
  }

  function drawHud(state) {
    context.textBaseline = 'top';
    text(scoreLabel(state.score), 24, 18, 28, PALETTE.text, 'left');
    const progress = Math.min(1, state.elapsed / TRIP_SECONDS);
    const barX = 420;
    const barW = 400;
    text(`Level ${state.level}`, FIELD.width / 2, 18, 24, PALETTE.text, 'center');
    context.fillStyle = '#0b0f1eaa';
    context.fillRect(barX - 4, 50, barW + 8, 16);
    context.fillStyle = PALETTE.lantern;
    context.fillRect(barX, 54, barW * progress, 8);
    text('到对岸', barX + barW + 12, 50, 18, PALETTE.muted, 'left');
    // Lives as small lanterns.
    for (let life = 0; life < LIVES; life += 1) {
      const x = FIELD.width - 24 - (LIVES - life) * 30;
      context.fillStyle = life < state.lives ? PALETTE.lantern : '#3a4152';
      context.beginPath();
      context.ellipse(x, 32, 8, 10, 0, 0, Math.PI * 2);
      context.fill();
    }
    if (state.combo >= 2) text(comboLabel(state.combo), 24, 52, 22, PALETTE.lanternGlow, 'left');
    const remain = Math.max(0, Math.ceil(TRIP_SECONDS - state.elapsed));
    text(`${remain}s`, FIELD.width - 24, 52, 22, PALETTE.muted, 'right');
  }

  function drawPanel(title, lines, prompt) {
    const height = PANEL.top + lines.length * PANEL.line + PANEL.bottom;
    const x = (FIELD.width - PANEL.width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = PALETTE.panel;
    context.fillRect(x, y, PANEL.width, height);
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 2;
    context.strokeRect(x, y, PANEL.width, height);
    context.textBaseline = 'alphabetic';
    text(title, FIELD.width / 2, y + 76, 46, PALETTE.text, 'center');
    for (let index = 0; index < lines.length; index += 1) {
      text(lines[index], FIELD.width / 2, y + PANEL.top + index * PANEL.line, 21, PALETTE.muted, 'center');
    }
    text(prompt, FIELD.width / 2, y + height - 38, 23, PALETTE.lanternGlow, 'center');
  }

  const TITLE_LINES = [
    'Lantern Ferry · 灯火渡',
    'Steer the boat. Gather lotus lanterns. Dodge the rocks.',
    'Collect 10 points a lantern, 25 for a golden koi.',
    'Reach the far shore in 90 seconds. 3 lives. M mutes sound.',
  ];
  const PAUSED_LINES = ['The river waits for you.'];
  const OVER_LINES = ['', '', ''];
  const WIN_LINES = ['', '', ''];

  /** Paint one frame: the field, then the HUD or a panel for the screen the game is on. */
  function draw(state, screen, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawField(state);
    if (screen === SCREEN_TITLE) {
      drawPanel('灯火渡', TITLE_LINES, '← → / A D 或鼠标移动 · 空格或点击开始');
      return;
    }
    drawHud(state);
    if (screen === SCREEN_PAUSED) drawPanel('Paused · 暂停', PAUSED_LINES, 'Press P to resume · 按 P 继续');
    else if (screen === SCREEN_OVER) {
      OVER_LINES[0] = `Score ${state.score} · ${bestLabel(best)}`;
      OVER_LINES[1] = `Best combo x${state.bestCombo} · Level ${state.level}`;
      OVER_LINES[2] = 'The lanterns drift on without you.';
      drawPanel('Game over · 灯灭了', OVER_LINES, 'Press Space or click to row again · 空格重来');
    } else if (screen === SCREEN_WIN) {
      WIN_LINES[0] = `Score ${state.score} · ${bestLabel(best)}`;
      WIN_LINES[1] = `Best combo x${state.bestCombo} · ${state.lives} ${state.lives === 1 ? 'life' : 'lives'} left: +${state.lives * 50}`;
      WIN_LINES[2] = 'You reached the far shore before dawn.';
      drawPanel('到岸了 · You made it', WIN_LINES, 'Press Space or click to row again · 空格再渡一次');
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
