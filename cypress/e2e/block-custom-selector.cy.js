beforeEach(() => {
	cy.resetDatabase();
	cy.clearBrowserStorage();
	cy.loginUser();
	cy.visitNewPageEditor();
});
afterEach(() => {
	cy.saveDraft(); // so we can leave without an alert
	cy.logoutUser();
});
context('Pattern Css (Block)', () => {
	it('Supports custom selectors in addition to [block]', () => {
		cy.withEditorWp((win, wp) => {
			// Override usually by php but can mutate the window anyway
			win.patternCss.selectorOverride = {
				name: 'selector',
				type: 'type',
			};
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock(); // clear placeholder
			cy.addCodeToCurrentBlock(`
				[block] { color: rgb(155, 200, 130); }
				selector { border-bottom: 1px solid green; }
			`);

			// p tag should be red
			cy.findBlock(`.${className}`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);

			// p tag should have green border
			cy.findBlock(`.${className}`).should(
				'have.css',
				'border-bottom',
				'1px solid rgb(0, 128, 0)',
			);

			// Make sure the 'line-error' class isn't there
			cy.get('[data-cy="pcss-editor-block"] pre .line-error').should(
				'not.exist',
			);
		});
	});
});
