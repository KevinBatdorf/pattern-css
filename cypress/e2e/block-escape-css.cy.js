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
	it('Safely escapes bad css', () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock(); // clear placeholder
			cy.addCodeToCurrentBlock(
				"[block] { background-image: url('https://foo.com/bar.jpg?</style><script>alert(1)</script>');}",
			);

			cy.previewCurrentPage();

			// Confirm on the frontend
			cy.get(`.${className}`).should(
				'not.have.css',
				'background-image',
				'url(https://foo.com/bar.jpg?</style><script>alert(1)</script>)',
			);

			cy.get(`#pcss-block-${className}-inline-css`)
				.invoke('text')
				.should(
					'contain',
					'background-image:url(https://foo.com/bar.jpg?&lt;/style&gt;&lt;script&gt;alert\\(1\\)&lt;/script&gt;)',
				);
		});
	});
});
