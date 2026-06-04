import { CANVAS_ID, ERROR_PREFIX } from './constants.js';

const PAP_CANVAS_CLASS = 'pap-canvas-layer';
const STYLE_ID = 'pap-canvas-style';

function _ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `.${PAP_CANVAS_CLASS} {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999999;
    pointer-events: none;
    display: block;
  }`;
  document.head.appendChild(style);
}

/**
 * Canvas 渲染层。
 * 负责创建全屏覆盖的 <canvas>、管理绘制缓冲区和视口尺寸。
 * 自管 resize 监听、DOM 清理以及 CSS 注入——外部无需额外 CSS 文件。
 * 不负责任何粒子逻辑。
 *
 * @param {string} [id=CANVAS_ID] - canvas 元素的 id
 */
export function createCanvasLayer(id = CANVAS_ID) {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  canvas.classList.add(PAP_CANVAS_CLASS);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error(`${ERROR_PREFIX} Canvas 2D 上下文不可用`);
  }

  /** @type {Array<(w: number, h: number) => void>} */
  const _resizeListeners = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const fn of _resizeListeners) fn(w, h);
  }

  function _onWindowResize() { resize(); }

  function mount() {
    _ensureStyles();
    document.body.appendChild(canvas);
    resize();
    window.addEventListener('resize', _onWindowResize);
  }

  function destroy() {
    window.removeEventListener('resize', _onWindowResize);
    canvas.remove();
    _resizeListeners.length = 0;
  }

  function onResize(fn) {
    _resizeListeners.push(fn);
  }

  return {
    canvas,
    ctx,
    get width() { return window.innerWidth; },
    get height() { return window.innerHeight; },
    resize,
    mount,
    destroy,
    onResize,
  };
}

/** 移除共享样式（仅当所有 layer 都已 destroy 时调用） */
export function removeSharedStyles() {
  const styleEl = document.getElementById(STYLE_ID);
  if (styleEl) styleEl.remove();
}