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
	it("Errors when the css is invalid and doesn't persist it", () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock(); // clear placeholder
			cy.addCodeToCurrentBlock('[block] { color: rgb(155, 200, 130); }');

			// p tag should be red
			cy.findBlock(`.${className}`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);
			// Make sure the 'line-error' class isn't there
			cy.get('[data-cy="pcss-editor-block"] pre .line-error').should(
				'not.exist',
			);

			// Add some invalid css
			cy.addCodeToCurrentBlock('??');

			cy.get('[data-cy="pcss-editor-block"] pre .line-error').should(
				'exist',
			);

			// Append style to make the text green
			cy.addCodeToCurrentBlock('[block] { color: green; }');

			// p tag should be red
			cy.findBlock(`.${className}`)
				.should('not.have.css', 'color', 'rgb(0, 128, 0)')
				.and('have.css', 'color', 'rgb(155, 200, 130)');

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// p tag should be red
			cy.get(`.${className}`)
				.should('not.have.css', 'color', 'rgb(0, 128, 0)')
				.and('have.css', 'color', 'rgb(155, 200, 130)');
		});
	});
});
