import { CANVAS_ID, CANVAS_LANDED_ID, ERROR_PREFIX } from './core/constants.js';
import { createConfig } from './core/config.js';
import { assertStrategy } from './core/strategy-interface.js';
import { createObstacleDetector } from './core/obstacles.js';
import { createCanvasLayer, removeSharedStyles } from './core/canvas-layer.js';
import { createParticlePool } from './core/particle-pool.js';

/**
 * 引擎实例（含完整生命周期）。
 *
 * 使用方式：
 *   const engine = createEngine();
 *   await engine.boot();
 *   // ... 路由切换时
 *   engine.destroy();
 *
 * @returns {{
 *   boot: () => Promise<void>,
 *   destroy: () => void,
 *   isRunning: () => boolean
 * }}
 */
export function createEngine() {
  const config = createConfig();

  let layer = null;
  let landedLayer = null;
  let detector = null;
  let pool = null;
  let strategy = null;
  let rafId = null;

  // ── 生命周期 ──────────────────────────────────────

  function _handleBootError(err) {
    console.error(`${ERROR_PREFIX} 引擎启动失败:`, err);
    destroy();
  }

  async function boot() {
    if (rafId) return;

    try {
      if (!config.validate()) {
        console.warn(`${ERROR_PREFIX} 配置无效或粒子类型为 none，跳过启动`);
        return;
      }

      const cfg = config.get();

      layer = createCanvasLayer(CANVAS_ID);
      layer.mount();

      landedLayer = createCanvasLayer(CANVAS_LANDED_ID);
      landedLayer.mount();

      detector = createObstacleDetector({ blacklist: cfg.blacklist });
      detector.start(cfg.obstacleScanInterval);

      const mod = await import(cfg.typeUrl);
      strategy = assertStrategy(mod);

      const count = (strategy.defaultConfig && strategy.defaultConfig[cfg.intensity]) || 100;
      pool = createParticlePool(strategy.create, count, layer.width, layer.height);

      layer.onResize((w, h) => {
        landedLayer.resize();
        if (pool && strategy.onResize) {
          pool.forEach(p => strategy.onResize(p, w, h));
        }
        detector.scan();
      });

      document.addEventListener('visibilitychange', _onVisibilityChange);
      _startLoop();
    } catch (err) {
      _handleBootError(err);
    }
  }

  function destroy() {
    document.removeEventListener('visibilitychange', _onVisibilityChange);
    _stopLoop();
    if (detector) detector.stop();
    if (layer) layer.destroy();
    if (landedLayer) landedLayer.destroy();
    removeSharedStyles();
    pool = null;
    strategy = null;
    detector = null;
    layer = null;
    landedLayer = null;
  }

  function isRunning() {
    return rafId !== null;
  }

  // ── 可见性 ────────────────────────────────────────

  function _onVisibilityChange() {
    if (document.hidden) {
      _stopLoop();
      if (detector) detector.stop();
    } else if (strategy && pool) {
      if (detector) detector.start(config.get().obstacleScanInterval);
      _startLoop();
    }
  }

  // ── 主循环 ────────────────────────────────────────

  const BASE_FRAME_MS = 16.667;
  let _lastTime = 0;
  let _frameCount = 0;
  const LANDED_REFRESH_INTERVAL = 60; // 每 60 帧刷新一次 landed 层

  function _startLoop() {
    if (rafId) return;
    _lastTime = 0;

    const _loop = (now) => {
      if (!_lastTime) { _lastTime = now; }
      const elapsed = now - _lastTime;
      _lastTime = now;
      const dt = Math.min(elapsed / BASE_FRAME_MS, 3);

      layer.ctx.clearRect(0, 0, layer.width, layer.height);

      _frameCount++;
      const refreshLanded = _frameCount >= LANDED_REFRESH_INTERVAL;
      if (refreshLanded) {
        _frameCount = 0;
        landedLayer.ctx.clearRect(0, 0, landedLayer.width, landedLayer.height);
      }

      pool.forEach(p => {
        const wasLanded = p.state === 'landed';
        strategy.update(p, detector.obstacles, layer.width, layer.height, dt);

        if (p.state === 'landed') {
          if (!wasLanded || refreshLanded) {
            strategy.draw(landedLayer.ctx, p);
          }
        } else {
          strategy.draw(layer.ctx, p);
        }
      });

      rafId = requestAnimationFrame(_loop);
    };
    rafId = requestAnimationFrame(_loop);
  }

  function _stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return { boot, destroy, isRunning };
}