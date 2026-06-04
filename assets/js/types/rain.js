/**
 * @typedef {import('../core/strategy-interface.js').ParticleStrategy} ParticleStrategy
 */

import { checkObstacleCollision } from '../core/collision.js';

function reset(p, width, height) {
  p.x = Math.random() * width;
  p.y = Math.random() * -height;
  p.vx = (Math.random() - 0.5) * 1;
  p.vy = (Math.random() * 5) + 10;
  p.len = (Math.random() * 10) + 10;
  p.state = 'falling';
}

/** @type {ParticleStrategy} */
export default {
  slug: 'rain',
  defaultConfig: { low: 100, medium: 300, high: 800 },

  create(width, height) {
    return {
      x: Math.random() * width,
      y: Math.random() * -height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() * 5) + 10,
      len: (Math.random() * 10) + 10,
      state: 'falling',
    };
  },

  onResize(p, width, height) {
    if (p.x > width) p.x = Math.random() * width;
  },

  update(p, obstacles, width, height, dt = 1) {
    if (p.state === 'landed') {
      reset(p, width, height);
      return;
    }
    p.prevY = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (checkObstacleCollision(p, obstacles)) return;
    if (p.y > height) reset(p, width, height);
  },

  draw(ctx, p) {
    if (p.state === 'falling') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.len);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};