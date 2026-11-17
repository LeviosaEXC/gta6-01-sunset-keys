// Input: keyboard state plus mouse aim, with edge-triggered actions
// (E, F, C, P, M) the game polls once per frame.
export const KEY_FORWARD = 'KeyW';
export const KEY_BACK = 'KeyS';
export const KEY_LEFT = 'KeyA';
export const KEY_RIGHT = 'KeyD';
export const KEY_RUN = 'ShiftLeft';
export const KEY_JUMP = 'Space';
export const KEY_ACTION = 'KeyE';
export const KEY_PUNCH = 'KeyF';
export const KEY_CAMERA = 'KeyC';
export const KEY_PAUSE = 'KeyP';
export const KEY_MUTE = 'KeyM';

export function createInput() {
  const input = {
    keys: {},
    pressed: {},
    mouseX: 0, mouseY: 0, mouseDown: false, mouseClicked: false,
    attach() {
      window.addEventListener('keydown', (e) => {
        if (!this.keys[e.code]) this.pressed[e.code] = true;
        this.keys[e.code] = true;
        if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
      });
      window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
      window.addEventListener('mousemove', (e) => { this.mouseX = e.clientX; this.mouseY = e.clientY; });
      window.addEventListener('mousedown', (e) => { if (e.button === 0) { this.mouseDown = true; this.mouseClicked = true; } });
      window.addEventListener('mouseup', (e) => { if (e.button === 0) this.mouseDown = false; });
      window.addEventListener('blur', () => { this.keys = {}; });
    },
    down(code) { return !!this.keys[code]; },
    wasPressed(code) { return !!this.pressed[code]; },
    endFrame() { this.pressed = {}; this.mouseClicked = false; },
    moveVector() {
      let x = 0, z = 0;
      if (this.down(KEY_FORWARD) || this.down('ArrowUp')) z -= 1;
      if (this.down(KEY_BACK) || this.down('ArrowDown')) z += 1;
      if (this.down(KEY_LEFT) || this.down('ArrowLeft')) x -= 1;
      if (this.down(KEY_RIGHT) || this.down('ArrowRight')) x += 1;
      const len = Math.hypot(x, z) || 1;
      return { x: x / len, z: z / len, active: x !== 0 || z !== 0 };
    },
    driveInput() {
      return {
        forward: this.down(KEY_FORWARD) || this.down('ArrowUp'),
        back: this.down(KEY_BACK) || this.down('ArrowDown'),
        steer: (this.down(KEY_LEFT) || this.down('ArrowLeft') ? -1 : 0) + (this.down(KEY_RIGHT) || this.down('ArrowRight') ? 1 : 0),
        handbrake: this.down(KEY_JUMP),
      };
    },
  };
  return input;
}
