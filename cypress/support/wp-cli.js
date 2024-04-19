export const resetDatabase = () =>
	cy.exec('wp-env clean all', {
		failOnNonZeroExit: false,
	});
export const installPlugin = (slug) =>
	cy.exec(`wp-env run cli wp plugin install ${slug} --activate`, {
		failOnNonZeroExit: false,
	});
export const uninstallPlugin = (slug) =>
	cy.exec(`wp-env run cli wp plugin uninstall ${slug}`, {
		failOnNonZeroExit: false,
	});
export const disableIframe = () =>
	cy.exec(
		'wp-env run cli wp user meta update 1 enable_custom_fields "true"',
		{
			failOnNonZeroExit: false,
		},
	);
