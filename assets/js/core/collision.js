/**
 * 障碍物碰撞——公共辅助函数。
 * rain/snow 等策略共享同一套碰撞检测逻辑，避免重复。
 */

/**
 * 扫频碰撞检测：检测粒子从 prevY 到当前 y 是否穿越了障碍物顶面。
 * 相比点检测，可防止高速粒子隧穿。
 *
 * 调用前策略应将移动前的 y 存入 p.prevY。
 *
 * @param {Object} p          - 粒子对象（会被原地修改 state 和 y）
 * @param {Object[]} obstacles - 障碍物数组 [{y, left, right}]（应已按 y 升序排列）
 * @returns {boolean} 是否命中障碍物
 */
export function checkObstacleCollision(p, obstacles) {
  const prevY = p.prevY ?? p.y;
  for (const obs of obstacles) {
    if (obs.y > p.y) break; // 障碍物已按 y 升序，后续不可能命中
    if (
      prevY <= obs.y &&
      p.y >= obs.y &&
      p.x >= obs.left &&
      p.x <= obs.right
    ) {
      p.y = obs.y;
      p.state = 'landed';
      return true;
    }
  }
  return false;
}