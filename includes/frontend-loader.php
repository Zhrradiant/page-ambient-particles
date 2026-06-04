<?php
if (!defined('ABSPATH')) exit;

require_once __DIR__ . '/class-registry.php';

class PAP_Frontend {
    public static function init() {
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_scripts']);
        add_filter('script_loader_tag', [self::class, 'add_module_type'], 10, 2);
    }

    public static function enqueue_scripts() {
        $options = get_option('pap_settings');
        $type = isset($options['pap_particle_type']) ? $options['pap_particle_type'] : 'none';

        if ($type === 'none') return;

        $type_info = PAP_Registry::get_type($type);
        if (!$type_info) return;

        // JS — bootstrap-wordpress.js 作为 ES module 入口
        wp_enqueue_script(
            'pap-engine',
            plugins_url('assets/js/bootstrap-wordpress.js', PAP_PLUGIN_FILE),
            [],
            PAP_VERSION,
            true
        );

        // 通过 wp_localize_script 将配置注入为全局 window.papParams
        // 字段结构以 assets/js/core/config.js 中 EngineConfig JSDoc 为准：
        //   type, intensity, blacklist, typeUrl, obstacleScanInterval, imageUrl
        $params = apply_filters('pap_engine_config', [
            'type'                 => $type,
            'intensity'            => isset($options['pap_intensity']) ? $options['pap_intensity'] : 'medium',
            'blacklist'            => isset($options['pap_blacklist']) ? $options['pap_blacklist'] : '',
            'typeUrl'              => $type_info['js_url'],
            'obstacleScanInterval' => isset($options['pap_scan_interval']) ? max(500, (int) $options['pap_scan_interval']) : 2000,
            'imageUrl'             => isset($options['pap_custom_image']) ? $options['pap_custom_image'] : '',
        ]);

        wp_localize_script('pap-engine', 'papParams', $params);
    }

    public static function add_module_type($tag, $handle) {
        if ($handle !== 'pap-engine') return $tag;
        return str_replace('<script ', '<script type="module" ', $tag);
    }
}

PAP_Frontend::init();