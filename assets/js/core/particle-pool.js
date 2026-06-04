/**
 * 粒子池。纯数据容器，负责粒子的创建和批量遍历。
 * 不涉及绘制、碰撞或任何策略逻辑。
 *
 * @param {(width: number, height: number) => Object} createParticle - 策略的 create 函数
 * @param {number} count  - 初始粒子数量
 * @param {number} width  - 视口宽度
 * @param {number} height - 视口高度
 */
export function createParticlePool(createParticle, count, width, height) {
  /** @type {Object[]} */
  let _particles = [];

  function init(n, w, h) {
    _particles = [];
    for (let i = 0; i < n; i++) {
      _particles.push(createParticle(w, h));
    }
  }

  function forEach(fn) {
    for (const p of _particles) {
      fn(p);
    }
  }

  init(count, width, height);

  return {
    init,
    forEach,
    get particles() { return _particles; },
  };
}