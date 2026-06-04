/**
 * @typedef {import('../core/strategy-interface.js').ParticleStrategy} ParticleStrategy
 */

import { checkObstacleCollision } from '../core/collision.js';
import { ERROR_PREFIX } from '../core/constants.js';

const imageUrl = (typeof window !== 'undefined' && window.papParams && window.papParams.imageUrl) || '';

const img = new Image();
let imageReady = false;
if (imageUrl) {
  img.src = imageUrl;
  img.onload = () => { imageReady = true; };
  img.onerror = () => { console.warn(`${ERROR_PREFIX} 自定义图片加载失败: ${imageUrl}`); };
}

function reset(p, width, height) {
  p.x = Math.random() * width;
  p.y = Math.random() * -height;
  p.vy = 1 + Math.random() * 4;
  p.vx = (Math.random() - 0.5) * 1.5;
  p.rotation = Math.random() * Math.PI * 2;
  p.rotationSpeed = (Math.random() - 0.5) * 0.03;
  p.size = 20 + Math.random() * 20;
  p.opacity = 0.6 + Math.random() * 0.4;
  p.state = 'falling';
  p.landedLife = 100;
}

/** @type {ParticleStrategy} */
export default {
  slug: 'custom-image',
  defaultConfig: { low: 50, medium: 150, high: 400 },

  create(width, height) {
    return {
      x: Math.random() * width,
      y: Math.random() * -height,
      vy: 1 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      size: 20 + Math.random() * 20,
      opacity: 0.6 + Math.random() * 0.4,
      state: 'falling',
      landedLife: 100,
    };
  },

  onResize(p, width, height) {
    if (p.x > width) p.x = Math.random() * width;
  },

  update(p, obstacles, width, height, dt = 1) {
    if (p.state === 'landed') {
      p.landedLife -= dt;
      if (p.landedLife <= 0) reset(p, width, height);
      return;
    }
    p.prevY = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rotation += p.rotationSpeed * dt;
    if (checkObstacleCollision(p, obstacles)) return;
    if (p.y > height) reset(p, width, height);
  },

  draw(ctx, p) {
    if (!imageReady) return;
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const half = p.size / 2;
    ctx.drawImage(img, -half, -half, p.size, p.size);
    ctx.restore();
  },
};