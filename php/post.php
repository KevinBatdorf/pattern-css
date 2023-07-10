<?php

$ppcSchema = [
    'single'       => true,
    'type'         => 'string',
    'auth_callback' => function () {
        return current_user_can('edit_css');
    },
    'sanitize_callback' => 'sanitize_textarea_field',
    'show_in_rest' => [
        'schema' => [
            'type'  => 'string',
            'default' => '',
        ],
    ],
];

register_meta('post', 'ppc_additional_css', $ppcSchema);
register_meta('post', 'ppc_additional_css_compiled', $ppcSchema);

add_action(
    'wp_enqueue_scripts',
    function () {
        $ppc_additional_css = get_post_meta(get_the_ID(), 'ppc_additional_css_compiled', true);
        if (empty($ppc_additional_css)) {
            return;
        }
        wp_register_style('ppc-inline-styles-post', false, [], 123);
        wp_enqueue_style('ppc-inline-styles-post');
        // WP style of safe echoing inline styles
        // See: https://github.com/WordPress/WordPress/blob/9ecfdd8e5a42ed4b66ffecb88321242717c89831/wp-includes/theme.php#L1920
        wp_add_inline_style('ppc-inline-styles-post', wp_strip_all_tags($ppc_additional_css));
    }
);
