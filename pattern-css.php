<?php
/**
 * Plugin Name:       Pattern CSS
 * Description:       Lightening Fast, Safe, In-editor CSS Optimization and Minification Tool
 * Requires at least: 6.0
 * Requires PHP:      7.0
 * Version:           1.2.1
 * Author:            Kevin Batdorf
 * Author URI:        https://twitter.com/kevinbatdorf
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       pattern-css
 *
 * @package           kevinbatdorf
 */


if (!defined('ABSPATH')) {
    exit;
}

add_action('init', function () {
    wp_set_script_translations('kevinbatdorf/pattern-css', 'pattern-css');
});

add_action('enqueue_block_editor_assets', function () {
    $assets = require plugin_dir_path(__FILE__) . 'build/index.asset.php';
    wp_enqueue_script(
        'kevinbatdorf/pattern-css',
        plugins_url('build/index.js', __FILE__),
        $assets['dependencies'],
        $assets['version'],
        true
    );
    wp_add_inline_script(
        'kevinbatdorf/pattern-css',
        'window.patternCss = ' . wp_json_encode([
            'canEditCss' => current_user_can('edit_css'),
            'pluginUrl' => esc_url_raw(plugin_dir_url(__FILE__)),
			'selectorOverride' => defined('PATTERN_CSS_SELECTOR_OVERRIDE') ?
				PATTERN_CSS_SELECTOR_OVERRIDE : null,
        ]) . ';',
        'before'
    );
    wp_enqueue_style('kevinbatdorf/pattern-css', plugins_url('build/index.css', __FILE__));
});


// This works by looking for blocks with the compiled CSS attribute
// during the render phase, and inlines the css if found.
// That keeps the inline styles ONLY loaded on pages that have the block.
add_filter('pre_render_block', function($pre_render, $parsed_block) {
    // $pre_render is null by default
    if (!isset($parsed_block['attrs']['pcssAdditionalCssCompiled'])) return $pre_render;
    if (empty($parsed_block['attrs']['pcssAdditionalCssCompiled'])) return $pre_render;

    $pcss_additional_css = $parsed_block['attrs']['pcssAdditionalCssCompiled'];
    $pcss_block_id = $parsed_block['attrs']['pcssClassId'];

    if (empty($pcss_block_id) || empty($pcss_additional_css)) return $pre_render;

    wp_register_style("pcss-block-{$pcss_block_id}", false, [], null);
    wp_enqueue_style("pcss-block-{$pcss_block_id}");

    // WP style of safe echoing inline styles
    // See: https://github.com/WordPress/WordPress/blob/9ecfdd8e5a42ed4b66ffecb88321242717c89831/wp-includes/theme.php#L1920
    wp_add_inline_style("pcss-block-{$pcss_block_id}", wp_strip_all_tags($pcss_additional_css));
    return $pre_render;
}, 10, 2);
