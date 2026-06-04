<?php
/**
 * Plugin Name: 页面环境粒子
 * Plugin URI: https://github.com/Zhrradiant/page-ambient-particles
 * Description: 为网页添加布局感知的环境粒子效果（雨/雪/自定义图片）。
 * Version: 1.0
 * Author: Zhrradiant LemonTea
 * Author URI: https://github.com/Zhrradiant
 */

if (!defined('ABSPATH')) exit;

define('PAP_PLUGIN_FILE', __FILE__);
define('PAP_VERSION', '1.0');

require_once __DIR__ . '/includes/class-registry.php';
require_once __DIR__ . '/includes/admin-settings.php';
require_once __DIR__ . '/includes/frontend-loader.php';

PAP_Registry::register_builtin();