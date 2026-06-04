<?php
if (!defined('ABSPATH')) exit;

require_once __DIR__ . '/class-registry.php';

class PAP_Admin {
    public static function init() {
        add_action('admin_menu', [self::class, 'add_admin_menu']);
        add_action('admin_init', [self::class, 'settings_init']);
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_admin_assets']);
    }

    public static function add_admin_menu() {
        add_options_page('页面环境粒子', '环境粒子', 'manage_options', 'page-ambient-particles', [self::class, 'options_page']);
    }

    public static function settings_init() {
        register_setting('pap_plugin', 'pap_settings');

        add_settings_section('pap_plugin_section', '粒子配置', function() {
            echo '为您的站点选择粒子效果及其强度。';
        }, 'pap_plugin');

        add_settings_field('pap_particle_type', '粒子类型', [self::class, 'particle_type_render'], 'pap_plugin', 'pap_plugin_section');
        add_settings_field('pap_intensity', '强度', [self::class, 'intensity_render'], 'pap_plugin', 'pap_plugin_section');
        add_settings_field('pap_blacklist', '黑名单选择器', [self::class, 'blacklist_render'], 'pap_plugin', 'pap_plugin_section');
        add_settings_field('pap_scan_interval', '障碍物扫描间隔（毫秒）', [self::class, 'scan_interval_render'], 'pap_plugin', 'pap_plugin_section');
        add_settings_field('pap_custom_image', '自定义图片', [self::class, 'custom_image_render'], 'pap_plugin', 'pap_plugin_section');
    }

    public static function particle_type_render() {
        $options = get_option('pap_settings');
        $current = isset($options['pap_particle_type']) ? $options['pap_particle_type'] : 'none';
        $types = PAP_Registry::get_types();
        ?>
        <select name="pap_settings[pap_particle_type]">
            <option value="none" <?php selected($current, 'none'); ?>>无</option>
            <?php foreach ($types as $slug => $type): ?>
                <option value="<?php echo esc_attr($slug); ?>" <?php selected($current, $slug); ?>><?php echo esc_html($type['label']); ?></option>
            <?php endforeach; ?>
        </select>
        <?php
    }

    public static function intensity_render() {
        $options = get_option('pap_settings');
        $intensity = isset($options['pap_intensity']) ? $options['pap_intensity'] : 'medium';
        ?>
        <select name="pap_settings[pap_intensity]">
            <option value="low" <?php selected($intensity, 'low'); ?>>低</option>
            <option value="medium" <?php selected($intensity, 'medium'); ?>>中</option>
            <option value="high" <?php selected($intensity, 'high'); ?>>高</option>
        </select>
        <?php
    }

    public static function blacklist_render() {
        $options = get_option('pap_settings');
        $blacklist = isset($options['pap_blacklist']) ? $options['pap_blacklist'] : '';
        ?>
        <textarea name="pap_settings[pap_blacklist]" rows="4" cols="50"><?php echo esc_textarea($blacklist); ?></textarea>
        <p class="description">输入要排除粒子效果的 CSS 选择器（逗号分隔）。例如 <code>.footer, #sidebar, .no-particles</code></p>
        <?php
    }

    public static function scan_interval_render() {
        $options = get_option('pap_settings');
        $interval = isset($options['pap_scan_interval']) ? (int) $options['pap_scan_interval'] : 2000;
        ?>
        <input type="number" name="pap_settings[pap_scan_interval]" value="<?php echo esc_attr($interval); ?>" min="500" step="100" />
        <p class="description">障碍物扫描间隔，单位毫秒。推荐 1000–5000，最低 500。</p>
        <?php
    }

    public static function custom_image_render() {
        $options = get_option('pap_settings');
        $image_url = isset($options['pap_custom_image']) ? $options['pap_custom_image'] : '';
        ?>
        <div style="display:flex;align-items:center;gap:8px;">
            <input type="text" id="pap_custom_image" name="pap_settings[pap_custom_image]"
                   value="<?php echo esc_attr($image_url); ?>" class="regular-text" />
            <button type="button" class="button" id="pap_upload_image_btn">选择图片</button>
        </div>
        <p class="description">选择「自定义图片」粒子类型后，此图片将作为下落粒子使用。建议使用小尺寸 PNG（如 64×64）。</p>
        <?php
    }

    public static function enqueue_admin_assets($hook) {
        if ($hook !== 'settings_page_page-ambient-particles') return;
        wp_enqueue_style(
            'pap-admin-settings',
            plugins_url('assets/css/admin-settings.css', PAP_PLUGIN_FILE),
            [],
            PAP_VERSION
        );
        wp_enqueue_media();
        wp_enqueue_script(
            'pap-admin-media',
            plugins_url('assets/js/admin-media.js', PAP_PLUGIN_FILE),
            ['jquery'],
            PAP_VERSION,
            true
        );
    }

    public static function options_page() {
        ?>
        <div class="wrap pap-admin-wrap">
            <h2>页面环境粒子</h2>
            <form action="options.php" method="post">
                <?php
                settings_fields('pap_plugin');
                do_settings_sections('pap_plugin');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}

PAP_Admin::init();