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
	it('Only adds the class after adding CSS', () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			wp.data.dispatch('core/block-editor').insertBlock(block);
			// Make sure no class is added
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			cy.findBlock(`.wp-block-group.${className}`).should('not.exist');
			// Add some css
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('p { color: rgb(155, 200, 130); }');
			// Check the group block has the class
			cy.findBlock(`.wp-block-group.${className}`).should('exist');
		});
	});
});
