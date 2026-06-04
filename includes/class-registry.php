<?php
if (!defined('ABSPATH')) exit;

/**
 * 粒子类型注册表
 */
class PAP_Registry {
    private static $types = [];

    /**
     * @param string $slug   粒子类型标识
     * @param array  $config {
     *   @type string $label  显示名称
     *   @type string $js_url 策略 JS 文件的 URL
     *   @type string $file   策略 JS 文件的实际路径（可选，用于存在性校验）
     * }
     */
    public static function register($slug, $config) {
        $defaults = [
            'label'  => $slug,
            'js_url' => '',
            'file'   => '',
        ];
        $merged = wp_parse_args($config, $defaults);

        // 如果提供了 file 参数，校验文件是否存在
        if (!empty($merged['file']) && !file_exists($merged['file'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log("[PAP] 粒子类型 \"{$slug}\" 的策略文件不存在: {$merged['file']}");
            }
            return;
        }

        self::$types[$slug] = $merged;
    }

    public static function get_types() {
        return apply_filters('pap_registered_types', self::$types);
    }

    public static function get_type($slug) {
        $types = self::get_types();
        return isset($types[$slug]) ? $types[$slug] : null;
    }

    public static function register_builtin() {
        $base = plugin_dir_path(PAP_PLUGIN_FILE) . 'assets/js/types/';

        self::register('rain', [
            'label'  => '雨',
            'js_url' => plugins_url('assets/js/types/rain.js', PAP_PLUGIN_FILE),
            'file'   => $base . 'rain.js',
        ]);
        self::register('snow', [
            'label'  => '雪',
            'js_url' => plugins_url('assets/js/types/snow.js', PAP_PLUGIN_FILE),
            'file'   => $base . 'snow.js',
        ]);
        self::register('custom-image', [
            'label'  => '自定义图片',
            'js_url' => plugins_url('assets/js/types/custom-image.js', PAP_PLUGIN_FILE),
            'file'   => $base . 'custom-image.js',
        ]);
    }
}