// Camera: a chase camera that swings behind the player or the car, a
// hood view on C, and fixed cinematic framing for staged screenshots.
import { clamp, angleLerp } from './utils.js';

export const CAMERA_FOLLOW_DISTANCE_M = 9;
export const CAMERA_FOLLOW_HEIGHT_M = 4.2;
export const CAMERA_FOV_DEG = 62;
const THREE = window.THREE;

export function createCamera() {
  return { mode: 'follow', hood: false, yaw: 0, pitch: 0.32, shakeX: 0, shakeY: 0 };
}

export function updateCamera(ctx, dt) {
  const cam = ctx.cameraRig;
  const camera = ctx.camera;
  const target = ctx.state.inCar && ctx.playerCar
    ? { x: ctx.playerCar.x, z: ctx.playerCar.z, heading: ctx.playerCar.heading }
    : { x: ctx.player.x, z: ctx.player.z, heading: ctx.player.heading };
  if (ctx.shotMode && ctx.shotCamera) {
    camera.position.set(ctx.shotCamera.pos.x, ctx.shotCamera.pos.y, ctx.shotCamera.pos.z);
    camera.lookAt(ctx.shotCamera.look.x, ctx.shotCamera.look.y, ctx.shotCamera.look.z);
    camera.fov = ctx.shotCamera.fov || CAMERA_FOV_DEG;
    camera.updateProjectionMatrix();
    return;
  }
  const desiredYaw = target.heading + Math.PI;
  cam.yaw = angleLerp(cam.yaw, desiredYaw, dt * 3.2);
  const dist = ctx.state.inCar ? CAMERA_FOLLOW_DISTANCE_M + 3.5 : CAMERA_FOLLOW_DISTANCE_M;
  const height = ctx.state.inCar ? CAMERA_FOLLOW_HEIGHT_M + 1.2 : CAMERA_FOLLOW_HEIGHT_M;
  if (cam.hood && ctx.state.inCar) {
    camera.position.set(
      target.x - Math.sin(target.heading) * 0.4,
      1.9,
      target.z - Math.cos(target.heading) * 0.4,
    );
    camera.lookAt(target.x + Math.sin(target.heading) * 30, 1.2, target.z + Math.cos(target.heading) * 30);
  } else {
    const cx = target.x + Math.sin(cam.yaw) * dist;
    const cz = target.z + Math.cos(cam.yaw) * dist;
    camera.position.set(cx + cam.shakeX, height + cam.shakeY, cz);
    camera.lookAt(target.x, 1.6, target.z);
  }
  camera.fov = CAMERA_FOV_DEG;
  camera.updateProjectionMatrix();
}
