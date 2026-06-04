<h1 align="center">Page Ambient Particles</h1>

<p align="center">
  <strong>PAP</strong> — WordPress 布局感知粒子效果插件
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0-orange" alt="version" />
  <img src="https://img.shields.io/badge/platform-WordPress-21759B" alt="platform" />
</p>

---

## 这是什么

页面环境粒子（Page Ambient Particles）是一个 WordPress 插件，为你的网站添加全屏覆盖的环境粒子动画。支持雨、雪、自定义图片三种粒子类型。

和普通粒子效果不同，PAP 是**布局感知**的——它会扫描页面中的视觉障碍物（标题、卡片、图片等有背景/边框/阴影的元素），粒子碰到这些元素后会"堆积"在上面（会消融），而不是直接穿透掉到底部。

核心思路很简单：**选类型 → 调强度 → 粒子自动适配你的页面布局**。

---

## 功能一览

### 粒子类型

内置三种粒子效果，后台一键切换：

- **雨** — 白色半透明线段，快速下落，落地即消失。默认 100–800 条
- **雪** — 白色半透明圆形，缓慢飘落，落地后有 100 帧的融化堆积效果。默认 50–400 片
- **自定义图片** — 上传你自己的 PNG 图片作为粒子，带旋转和透明度变化。默认 50–400 个

通过 WordPress filter `pap_registered_types` 可注册自定义粒子类型（策略模式）。

### 布局感知

插件会定时扫描页面 DOM，检测以下元素并标记为"障碍物"：

- 有可见背景色（非透明）的元素
- 有边框的元素
- 有 box-shadow 的元素
- 宽度 ≥ 100px 且高度 ≥ 50px 的块级/媒体元素

粒子下落碰到障碍物顶部时，状态变为 `landed`，停止下落。这使得粒子能自然地堆积在页面标题、卡片、图片等元素上方。

### 双 Canvas 渲染

采用两个独立 Canvas 层，避免频繁重绘影响性能：

- **主层** (`pap-canvas`) — 每帧重绘，负责下落中的粒子
- **堆积层** (`pap-canvas-landed`) — 每 60 帧刷新一次，渲染已落地的粒子

### 强度控制

三种强度级别，对应不同的粒子数量：

| 类型 | 低 | 中 | 高 |
|:---|:---:|:---:|:---:|
| 雨 | 100 | 300 | 800 |
| 雪 | 50 | 150 | 400 |
| 自定义图片 | 50 | 150 | 400 |

### 黑名单

支持 CSS 选择器黑名单，排除不想被粒子覆盖的区域。例如 `.footer, #sidebar, .no-particles`，这些元素不会被识别为障碍物，粒子也不会落在上面。

### 障碍物扫描间隔

可配置扫描间隔（500–5000ms），控制障碍物检测器的刷新频率。推荐 1000–5000ms，平衡实时性与性能。

### 页面可见性感知

当用户切换标签页（`visibilitychange`）时，插件自动暂停粒子动画和障碍物扫描，切回时恢复，避免不必要的资源消耗。

---

## 架构

```
WordPress 后台设置
  ↓ 保存 pap_settings option
frontend-loader.php → wp_localize_script → window.papParams
  ↓
bootstrap-wordpress.js → createEngine()
  ↓
engine.js boot()
  ├── config.js         配置校验
  ├── canvas-layer.js   双 Canvas 层挂载
  ├── obstacles.js      障碍物定时扫描
  ├── 动态 import(策略 JS)
  │   ├── rain.js
  │   ├── snow.js
  │   └── custom-image.js
  ├── particle-pool.js  粒子池初始化
  └── rAF 主循环
      ├── collision.js  碰撞检测
      └── strategy.draw()  渲染
```

无外部 JS 依赖，纯原生 ES modules。

---

## 安装与使用

### 安装

1. WordPress 后台 → 插件 → 安装插件 → 上传插件
2. 上传 `page-ambient-particles.zip`，点击"现在安装"
3. 激活插件

### 配置

1. 进入 WordPress 后台 → 设置 → 环境粒子
2. 选择粒子类型（雨 / 雪 / 自定义图片）
3. 调整强度（低 / 中 / 高）
4. （可选）填写黑名单选择器，排除不需要粒子的区域
5. （可选）调整障碍物扫描间隔
6. 选择"自定义图片"类型时，上传一张小尺寸 PNG
7. 点击"保存更改"

### 系统要求

- WordPress 5.0 及以上
- 浏览器需支持 ES modules 和 Canvas API

---

## 许可

本项目基于 MIT 协议开源，你可以自由使用、修改、分发。

如果你觉得这个工具曾经帮到过你，留个 Star 就行。
