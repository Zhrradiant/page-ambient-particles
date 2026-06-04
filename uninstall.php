<?php
/**
 * 卸载时清理数据库残留
 */
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('pap_settings');