/**
 * WordPress 环境启动入口。
 *
 * 从 window.papParams（wp_localize_script 注入）读取配置，
 * 创建引擎实例并自动启动。
 *
 * engine.js 本身不依赖 WordPress，仅暴露 createEngine。
 * 如需在其他环境（测试、Storybook、非 WP 集成）使用，
 * 直接 import { createEngine } from './engine.js' 并传入自定义配置即可。
 */
import { createEngine } from './engine.js';

const engine = createEngine();
engine.boot().catch(err => {
  console.error('[PAP] 引擎启动失败:', err);
});