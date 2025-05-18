<?php

defined('ABSPATH') or die;

add_action('rest_api_init', function () {
	PCSSRouter::post('/global-css', function ($payload) {
		if (isset($payload['global_css'])) {
			update_option('pcss_global_css', (string) $payload['global_css']);
		}
		if (isset($payload['global_css_compiled'])) {
			update_option('pcss_global_css_compiled', (string) $payload['global_css_compiled']);
		}
		return new WP_REST_Response(
			[
				'global_css' => get_option('pcss_global_css', ''),
				'global_css_compiled' => get_option('pcss_global_css_compiled', ''),
			]
		);
	});
});
