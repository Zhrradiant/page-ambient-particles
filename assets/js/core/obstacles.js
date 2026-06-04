import { ERROR_PREFIX } from './constants.js';

/**
 * 障碍物检测器。
 * 扫描页面中具有视觉占位的元素（有背景/边框/阴影的块级元素），
 * 将这些元素的顶部 Y 坐标和水平范围记录下来，供粒子策略做碰撞判断。
 * 自带定时扫描能力，外部只需 start/stop。
 *
 * 注意：不负责粒子越界重置（如屏幕底部兜底）——那是策略自身的职责。
 *
 * @param {Object} config
 * @param {string} config.blacklist - CSS 选择器，匹配的元素会被跳过
 * @param {string} [config.selector] - 扫描的元素选择器，默认覆盖常见块级/媒体元素
 * @param {number} [config.minWidth] - 最小元素宽度（px），低于此值跳过，默认 100
 * @param {number} [config.minHeight] - 最小元素高度（px），低于此值跳过，默认 50
 * @returns {{ scan: () => void, start: (interval: number) => void, stop: () => void, obstacles: Object[] }}
 */
export function createObstacleDetector({ blacklist, selector, minWidth, minHeight } = {}) {
  /** @type {Object[]} */
  let _obstacles = [];

  const SELECTOR = selector || 'div, section, article, header, footer, nav, aside, main, figure, img, video';
  const MIN_W = minWidth ?? 100;
  const MIN_H = minHeight ?? 50;

  let _intervalId = null;

  function scan() {
    _obstacles = [];
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    document.querySelectorAll(SELECTOR).forEach(el => {
      if (blacklist && el.matches(blacklist)) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < MIN_W || rect.height < MIN_H) return;
      if (rect.bottom < 0 || rect.top > vh) return;

      const style = window.getComputedStyle(el);
      const hasBg = style.backgroundColor !== 'rgba(0, 0, 0, 0)'
        && style.backgroundColor !== 'transparent';
      const hasBorder = parseInt(style.borderTopWidth) > 0;
      const hasShadow = style.boxShadow !== 'none';

      if (hasBg || hasBorder || hasShadow) {
        _obstacles.push({
          y: rect.top,
          left: rect.left,
          right: rect.right,
          width: rect.width,
        });
      }
    });

    _obstacles.sort((a, b) => a.y - b.y);
  }

  function start(interval) {
    stop();
    scan();
    _intervalId = setInterval(() => scan(), interval);
  }

  function stop() {
    if (_intervalId) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
  }

  return {
    scan,
    start,
    stop,
    get obstacles() { return _obstacles; },
  };
}