<?php

// This works by looking for blocks with the compiled CSS and
// during the render phase, and inlines the css if found.
// That keeps the inline styles ONLY loaded on pages that have the block.
add_filter('pre_render_block', function($pre_render, $parsed_block) {
    // $pre_render is null by default
    if (!isset($parsed_block['attrs']['ppcAdditionalCssCompiled'])) return $pre_render;
    if (empty($parsed_block['attrs']['ppcAdditionalCssCompiled'])) return $pre_render;

    $ppc_additional_css = $parsed_block['attrs']['ppcAdditionalCssCompiled'];
    $ppc_block_id = $parsed_block['attrs']['ppcClassId'];

    // Should this error if the css is found but not the id?
    if (empty($ppc_block_id) || empty($ppc_additional_css)) return $pre_render;

    wp_register_style("ppc-block-{$ppc_block_id}", false, [], null);
    wp_enqueue_style("ppc-block-{$ppc_block_id}");

    // WP style of safe echoing inline styles
    // See: https://github.com/WordPress/WordPress/blob/9ecfdd8e5a42ed4b66ffecb88321242717c89831/wp-includes/theme.php#L1920
    wp_add_inline_style("ppc-block-{$ppc_block_id}", wp_strip_all_tags($ppc_additional_css));
    return $pre_render;
}, 10, 2);
