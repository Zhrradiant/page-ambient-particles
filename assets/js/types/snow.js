/**
 * @typedef {import('../core/strategy-interface.js').ParticleStrategy} ParticleStrategy
 */

import { checkObstacleCollision } from '../core/collision.js';

function reset(p, width, height) {
  p.x = Math.random() * width;
  p.y = Math.random() * -height;
  p.vx = (Math.random() - 0.5) * 1;
  p.vy = (Math.random() * 2) + 1;
  p.radius = (Math.random() * 2) + 1;
  p.state = 'falling';
  p.landedLife = 100;
}

/** @type {ParticleStrategy} */
export default {
  slug: 'snow',
  defaultConfig: { low: 50, medium: 150, high: 400 },

  create(width, height) {
    return {
      x: Math.random() * width,
      y: Math.random() * -height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() * 2) + 1,
      radius: (Math.random() * 2) + 1,
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
    if (checkObstacleCollision(p, obstacles)) return;
    if (p.y > height) reset(p, width, height);
  },

  draw(ctx, p) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  },
};