<?php
/**
 * Plugin Name:       Per Page CSS
 * Description:       Lightening Fast, Safe, In-editor CSS Optimization and Minification Tool
 * Requires at least: 6.0
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Kevin Batdorf
 * Author URI:        https://twitter.com/kevinbatdorf
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       per-page-css
 *
 * @package           kevinbatdorf
 */


add_action('init', function () {
    wp_set_script_translations('kevinbatdorf/per-page-css', 'per-page-css');
});

add_action('enqueue_block_editor_assets', function () {
    $assets = require plugin_dir_path(__FILE__) . 'build/index.asset.php';
    wp_enqueue_script(
        'kevinbatdorf/per-page-css',
        plugins_url('build/index.js', __FILE__),
        $assets['dependencies'],
        $assets['version'],
        true
    );
    wp_add_inline_script(
        'kevinbatdorf/per-page-css',
        'window.perPageCss = ' . wp_json_encode([
            'canEditCss' => current_user_can('edit_css'),
            'pluginUrl' => esc_url_raw(plugin_dir_url(__FILE__)),
        ]) . ';',
        'before'
    );
    wp_enqueue_style('kevinbatdorf/per-page-css', plugins_url('build/index.css', __FILE__));
});

include_once(__DIR__ . '/php/post.php');
include_once(__DIR__ . '/php/block.php');
