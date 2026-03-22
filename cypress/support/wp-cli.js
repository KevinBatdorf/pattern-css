let snapshotCreated = false;

const createSnapshot = () => {
	cy.exec('wp-env run cli wp db export /tmp/clean-snapshot.sql', {
		failOnNonZeroExit: false,
	});
	snapshotCreated = true;
};

const restoreSnapshot = () => {
	cy.exec('wp-env run cli wp db import /tmp/clean-snapshot.sql', {
		failOnNonZeroExit: false,
	});
	cy.exec('wp-env run cli wp cache flush', {
		failOnNonZeroExit: false,
	});
};

export const resetDatabase = () => {
	if (snapshotCreated) {
		restoreSnapshot();
		return;
	}
	cy.exec('wp-env clean all', {
		failOnNonZeroExit: false,
	});
	cy.exec(
		'wp-env run cli wp user meta add 1 wp_persisted_preferences \'{"core/edit-post":{"welcomeGuide":false,"core/edit-post/pattern-modal":false,"pattern-modal":false,"edit-post/pattern-modal":false,"patternModal":false},"core":{"enableChoosePatternModal":false},"_modified":"2025-03-23T02:16:33.561Z"}\' --format=json',
	);
	createSnapshot();
};
export const installPlugin = (slug) =>
	cy.exec(`wp-env run cli wp plugin install ${slug} --activate`, {
		failOnNonZeroExit: false,
	});
export const uninstallPlugin = (slug) =>
	cy.exec(`wp-env run cli wp plugin uninstall ${slug}`, {
		failOnNonZeroExit: false,
	});
