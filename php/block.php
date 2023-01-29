<?php

$ppcSchema = [
    'single'       => true,
    'type'         => 'string',
    'auth_callback' => function () {
        return current_user_can('edit_css');
    },
    'show_in_rest' => [
        'schema' => [
            'type'  => 'string',
            'default' => '',
        ],
    ],
];

register_meta('post', 'ppc_additional_css_block_compiled', $ppcSchema);

add_action(
    'wp_enqueue_scripts',
    function () {
        $ppc_additional_css = get_post_meta(get_the_ID(), 'ppc_additional_css_block_compiled', true);
        if (empty($ppc_additional_css)) {
            return;
        }
        wp_register_style('ppc-inline-styles-block', false, [], 123);
        wp_enqueue_style('ppc-inline-styles-block');
        // See: https://github.com/WordPress/WordPress/blob/master/wp-includes/theme.php#L1880-L1893
        wp_add_inline_style('ppc-inline-styles-block', wp_strip_all_tags($ppc_additional_css));
    }
);
