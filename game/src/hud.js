// HUD: wanted stars, cash, health/armor bars, clock, district, speedometer,
// ammo, message feed and the mission banner — all DOM, big and readable.
import { formatCash, formatClock } from './utils.js';
import { districtAt } from './city.js';

export const HUD_REFRESH_MS = 100;

export function createHud() {
  const $ = (id) => document.getElementById(id);
  const hud = {
    el: $('hud'),
    stars: $('wanted-stars'),
    cash: $('cash'),
    rep: $('rep'),
    healthFill: $('health-fill'),
    healthNum: $('health-num'),
    armorFill: $('armor-fill'),
    armorNum: $('armor-num'),
    clock: $('clock'),
    district: $('district-label'),
    objectiveTitle: $('objective-title'),
    objectiveText: $('objective-text'),
    objectiveDistance: $('objective-distance'),
    banner: $('banner'),
    speedo: $('speedo'),
    speedNum: $('speed-num'),
    carName: $('car-name'),
    ammoLine: $('ammo-line'),
    ammoNum: $('ammo-num'),
    feed: $('message-feed'),
    bannerTimer: null,
    show() { this.el.classList.remove('hidden'); },
    hide() { this.el.classList.add('hidden'); },
    setObjective(title, text, distanceM) {
      this.objectiveTitle.textContent = title;
      this.objectiveText.textContent = text;
      this.objectiveDistance.textContent = distanceM > 0 ? distanceM + ' m' : '';
    },
    showBanner(text) {
      this.banner.textContent = text;
      this.banner.classList.remove('hidden');
      clearTimeout(this.bannerTimer);
      this.bannerTimer = setTimeout(() => this.banner.classList.add('hidden'), 4200);
    },
    pushMessage(text) {
      const div = document.createElement('div');
      div.textContent = text;
      this.feed.prepend(div);
      while (this.feed.children.length > 4) this.feed.removeChild(this.feed.lastChild);
      setTimeout(() => { if (div.parentNode) div.style.opacity = '0.35'; }, 6000);
    },
    update(state, ctx) {
      let stars = '';
      for (let i = 0; i < 5; i++) stars += i < state.wanted ? '★' : '<span class="star-off">★</span>';
      this.stars.innerHTML = stars;
      this.cash.textContent = formatCash(state.cash);
      this.rep.textContent = String(state.rep);
      this.healthFill.style.width = Math.max(0, state.health) + '%';
      this.healthNum.textContent = String(Math.round(state.health));
      this.armorFill.style.width = Math.min(100, state.armor) + '%';
      this.armorNum.textContent = String(Math.round(state.armor));
      this.clock.textContent = formatClock(state.hour);
      const px = state.inCar && ctx.playerCar ? ctx.playerCar.x : ctx.player.x;
      const pz = state.inCar && ctx.playerCar ? ctx.playerCar.z : ctx.player.z;
      this.district.textContent = districtAt(px, pz);
      if (state.inCar && ctx.playerCar) {
        this.speedo.classList.remove('hidden');
        this.speedNum.textContent = String(Math.round(Math.abs(ctx.playerCar.speed) * 3.6));
        this.carName.textContent = ctx.playerCar.model.name;
        this.ammoLine.classList.add('hidden');
      } else {
        this.speedo.classList.add('hidden');
        this.ammoLine.classList.remove('hidden');
        this.ammoNum.textContent = String(state.ammo);
      }
    },
  };
  return hud;
}
