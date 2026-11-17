// Keyboard and pointer input. Held keys give a steering direction; the mouse steers too:
// move the pointer left or right of the boat and it follows. One-shot presses (start or
// restart, pause, mute) are queued as bit flags and taken once by the loop, so a press
// between two frames is never lost and never counted twice.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_MUTE = 4;

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const MUTE = new Set(['KeyM']);

export function createInput(target) {
  let left = false;
  let right = false;
  let actions = 0;
  let mouseX = null;
  let mouseActive = false;

  window.addEventListener('keydown', (event) => {
    if (LEFT.has(event.code)) left = true;
    else if (RIGHT.has(event.code)) right = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (MUTE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (LEFT.has(event.code)) left = false;
    else if (RIGHT.has(event.code)) right = false;
  });
  // A key released while the tab is hidden never sends keyup: let go of everything on blur.
  window.addEventListener('blur', () => {
    left = false;
    right = false;
  });
  target.addEventListener('pointerdown', () => {
    actions |= ACTION_CONFIRM;
  });
  target.addEventListener('pointermove', (event) => {
    const rect = target.getBoundingClientRect();
    if (rect.width > 0) {
      mouseX = ((event.clientX - rect.left) / rect.width) * 1280;
      mouseActive = true;
    }
  });
  target.addEventListener('pointerleave', () => {
    mouseActive = false;
  });

  return {
    /** -1 for left, 1 for right, 0 for neither or both. Keys win; the mouse steers otherwise. */
    direction(playerCentreX) {
      if (left && !right) return -1;
      if (right && !left) return 1;
      if (mouseActive && mouseX !== null) {
        if (mouseX > playerCentreX + 14) return 1;
        if (mouseX < playerCentreX - 14) return -1;
      }
      return 0;
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
