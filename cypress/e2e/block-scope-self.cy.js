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
	it('Renders scoped to the block, targets block itself', () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('[block] { color: rgb(155, 200, 130); }');

			// p tag should be red
			cy.findBlock(`.${className}`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// p tag should be red
			cy.get(`.${className}`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);
		});
	});
});
