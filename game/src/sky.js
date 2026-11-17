// Sunset sky: a big gradient dome plus a low sun disc that slides from
// peach afternoon into violet dusk and then a starry night.
import { SUNSET_TOP_COLOR, SUNSET_HORIZON_COLOR, NIGHT_TOP_COLOR, NIGHT_HORIZON_COLOR, DAY_TOP_COLOR, DAY_HORIZON_COLOR } from './config.js';
import { clamp, lerp } from './utils.js';

export const SKY_DOME_RADIUS_M = 900;
const THREE = window.THREE;

function skyVertexShader() {
  return 'varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
}
function skyFragmentShader() {
  return 'uniform vec3 topColor; uniform vec3 horizonColor; varying vec3 vPos; void main(){ float h = clamp(vPos.y / 900.0, 0.0, 1.0); vec3 c = mix(horizonColor, topColor, pow(h, 0.65)); gl_FragColor = vec4(c, 1.0); }';
}

export function createSky(scene) {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(SUNSET_TOP_COLOR) },
      horizonColor: { value: new THREE.Color(SUNSET_HORIZON_COLOR) },
    },
    vertexShader: skyVertexShader(),
    fragmentShader: skyFragmentShader(),
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(SKY_DOME_RADIUS_M, 24, 12), material);
  scene.add(dome);
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(46, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd9a0, fog: false, transparent: true, opacity: 0.95 }),
  );
  sun.position.set(-420, 150, -620);
  scene.add(sun);
  const stars = [];
  for (let i = 0; i < 220; i++) {
    const a = Math.random() * Math.PI * 2;
    const e = 0.25 + Math.random() * 1.1;
    stars.push(new THREE.Vector3(Math.cos(a) * 850 * Math.cos(e), Math.sin(e) * 850, Math.sin(a) * 850 * Math.cos(e)));
  }
  const starGeo = new THREE.BufferGeometry().setFromPoints(stars);
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0 });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);
  return { dome, sun, stars: starField, material };
}

export function updateSky(sky, hour, scene) {
  const top = new THREE.Color();
  const horizon = new THREE.Color();
  if (hour >= 16 && hour < 19) {
    const t = clamp((hour - 16) / 3, 0, 1);
    top.setHex(SUNSET_TOP_COLOR).lerp(new THREE.Color(NIGHT_TOP_COLOR), t * 0.55);
    horizon.setHex(SUNSET_HORIZON_COLOR).lerp(new THREE.Color(NIGHT_HORIZON_COLOR), t * 0.55);
  } else if (hour >= 19 || hour < 6) {
    top.setHex(NIGHT_TOP_COLOR);
    horizon.setHex(NIGHT_HORIZON_COLOR);
  } else {
    top.setHex(DAY_TOP_COLOR);
    horizon.setHex(DAY_HORIZON_COLOR);
  }
  sky.material.uniforms.topColor.value.copy(top);
  sky.material.uniforms.horizonColor.value.copy(horizon);
  const nightness = (hour >= 19 || hour < 6) ? 1 : clamp((hour - 18) / 1, 0, 1);
  sky.stars.material.opacity = nightness * 0.9;
  sky.sun.material.opacity = 0.95 * (1 - nightness);
  const sunAngle = lerp(-0.5, 0.35, clamp((hour - 16) / 5, 0, 1));
  sky.sun.position.set(-420, 60 + sunAngle * 260, -620);
  scene.fog = new THREE.Fog(horizon.getHex(), 260, 880);
  scene.background = null;
  return { nightness, top, horizon };
}
