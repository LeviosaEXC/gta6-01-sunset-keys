// Effects: screen shake that decays, and the camera kick on impacts.
export const SHAKE_MAX_PX = 12;
export const SHAKE_DECAY_PER_SECOND = 22;

export function createEffects() {
  return {
    trauma: 0,
    shake(amount) { this.trauma = Math.min(1, this.trauma + amount / SHAKE_MAX_PX); },
    update(dt, cameraRig) {
      this.trauma = Math.max(0, this.trauma - (SHAKE_DECAY_PER_SECOND / SHAKE_MAX_PX) * dt);
      const s = this.trauma * this.trauma;
      cameraRig.shakeX = s * SHAKE_MAX_PX * 0.12 * (Math.random() * 2 - 1);
      cameraRig.shakeY = s * SHAKE_MAX_PX * 0.12 * (Math.random() * 2 - 1);
    },
  };
}
