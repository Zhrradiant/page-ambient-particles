/**
 * @typedef {Object} ParticleStrategy
 * @property {string} slug                       - 粒子类型标识
 * @property {Object<string, number>} defaultConfig - { low, medium, high } → 粒子数量
 * @property {(width: number, height: number) => Object} create  - 创建单个粒子
 * @property {(p: Object, obstacles: Object[], width: number, height: number, dt: number) => void} update - 更新粒子状态（dt 为归一化帧时间，1 = 60fps 基准帧）
 * @property {(ctx: CanvasRenderingContext2D, p: Object) => void} draw                     - 绘制粒子
 * @property {(p: Object, width: number, height: number) => void} [onResize]               - 可选：视口变化时调整粒子
 */

const REQUIRED = ['slug', 'defaultConfig', 'create', 'update', 'draw'];

/**
 * 校验动态加载的模块是否满足 ParticleStrategy 契约。
 * 支持 mod.default（ES module default export）和裸对象两种形式。
 *
 * @param {*} mod - import() 返回的模块对象
 * @returns {ParticleStrategy}
 * @throws {Error} 契约不满足时抛出带 [PAP] 前缀的详细错误
 */
export function assertStrategy(mod) {
  const s = (mod && mod.default) ? mod.default : mod;

  if (!s || typeof s !== 'object') {
    throw new Error('[PAP] 粒子策略模块必须 default export 一个对象');
  }

  for (const key of REQUIRED) {
    if (!(key in s)) {
      throw new Error(`[PAP] 粒子策略缺少必需属性: "${key}"`);
    }
  }

  if (typeof s.create !== 'function') {
    throw new Error(`[PAP] 粒子策略 "create" 必须是函数，实际类型: ${typeof s.create}`);
  }
  if (typeof s.update !== 'function') {
    throw new Error(`[PAP] 粒子策略 "update" 必须是函数，实际类型: ${typeof s.update}`);
  }
  if (typeof s.draw !== 'function') {
    throw new Error(`[PAP] 粒子策略 "draw" 必须是函数，实际类型: ${typeof s.draw}`);
  }

  return s;
}