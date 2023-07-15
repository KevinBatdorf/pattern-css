beforeEach(() => {
	cy.resetDatabase();
	cy.clearBrowserStorage();
	cy.installPlugin('gutenberg');
	cy.loginUser();
	cy.visitNewPageEditor();
});
afterEach(() => {
	cy.saveDraft(); // so we can leave without an alert
	cy.logoutUser();
});
// Typically I run these locally since the published Gutenberg plugin
// often has bugs or breaking changes (by deisng). This keeps the daily tests here from failing.
context('Upcoming tests (Gutenberg)', () => {
	cy.get('.block-editor-block-toolbar [aria-label="Options"]')
		.should('not.exist')
		.click();
	it('Works with reusable blocks', () => {
		cy.window().then((win) => {
			// Manually add blocks so we can get the block id
			const block = win.wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			win.wp.data.dispatch('core/block-editor').insertBlock(block);
			// Check the group block has the class
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			cy.get(`.wp-block-paragraph.${className}`).should('exist');

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.addCodeToCurrentBlock('[block] { color: red; }');

			// Create the reusable block pattern
			cy.selectBlockById(block.clientId);
			cy.get('.block-editor-block-toolbar [aria-label="Options"]')
				.should('exist')
				.click();
			cy.get('.components-menu-group button')
				.contains('Create pattern')
				.click();
		});
	});
});
