/**
 * @typedef {Object} EngineConfig  —— PHP 端注入配置时的权威字段定义
 * @property {string}      type                 - 粒子类型 slug（"rain"|"snow"|"none"）
 * @property {string}      intensity            - 强度等级（"low"|"medium"|"high"）
 * @property {string}      blacklist            - CSS 选择器黑名单（逗号分隔）
 * @property {string}      typeUrl              - 策略 JS 文件的 URL
 * @property {number}      [obstacleScanInterval] - 障碍物扫描间隔（ms），默认 2000
 * @property {string}      [imageUrl]           - 自定义图片 URL（仅 custom-image 类型使用）
 *
 * @property {string}      [snowColor=#fff]     - 雪花颜色
 * @property {number}      [wind=0]             - 风速影响
 * @property {boolean}     [groundAccum=false]  - 是否堆积
 */

/**
 * 配置抽象层。从来源读取配置，统一校验后输出。
 * 当前默认来源为 window.papParams（由 WordPress wp_localize_script 注入）。
 * 如需替换来源（测试 / localStorage / API），只需换一个 resolver 即可。
 *
 * @param {{ resolve?: () => EngineConfig }} [opts]
 * @returns {{ get: () => EngineConfig, validate: () => boolean }}
 */
export function createConfig(opts = {}) {
  const resolve = opts.resolve || (() => (typeof window !== 'undefined' ? window.papParams : null));

  const SCHEMA = ['type', 'typeUrl'];

  function get() {
    const raw = resolve();
    if (!raw) return null;
    const { type, intensity, blacklist, typeUrl, obstacleScanInterval, ...extra } = raw;
    return {
      type,
      intensity,
      blacklist,
      typeUrl,
      obstacleScanInterval: Number(obstacleScanInterval) || 2000,
      ...extra,
    };
  }

  function validate() {
    const cfg = get();
    if (!cfg) return false;
    for (const key of SCHEMA) {
      if (!cfg[key]) {
        console.warn(`[PAP] 配置缺少必需字段: "${key}"`);
        return false;
      }
    }
    return cfg.type !== 'none';
  }

  return { get, validate };
}