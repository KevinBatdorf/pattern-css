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
	it('Renders scoped to the block and concats multiple block styles', () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Add similiar blocks
			const block2 = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'World',
				}),
			]);
			const className2 = `pcss-${block2.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block2);

			// Select the first block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('p { color: rgb(155, 200, 130); }');

			// Select the second block
			cy.selectBlockById(block2.clientId);
			cy.addCodeToCurrentBlock('p { color: blue; }');

			// First block p tag should be red
			cy.findBlock(`.${className} p`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);
			// Second block p tag should be blue
			cy.findBlock(`.${className2} p`).should(
				'have.css',
				'color',
				'rgb(0, 0, 255)',
			);

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// First block p tag should be red
			cy.get(`.${className} p`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);
			// Second block p tag should be blue
			cy.get(`.${className2} p`).should(
				'have.css',
				'color',
				'rgb(0, 0, 255)',
			);
		});
	});
});
