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
	it('Removes @import, @keyframes, and others', () => {
		const css = `@font-face {font-family: MyFont;src: url('myfont.woff2');}
		  @keyframes slidein {from {opacity: 0} to {opacity: 1}}
		  @media screen and (max-width: 600px) { [block] { color: red; } }
		  [block] { padding: 1rem; }`;

		cy.withEditorWp((_win, wp) => {
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
			cy.addCodeToCurrentBlock(css);

			cy.previewCurrentPage();

			// should not have any of the global rules except media query and block styles
			cy.get(`style#pcss-block-${className}-inline-css`)
				.invoke('text')
				.should('not.contain', '@keyframes')
				.and('not.contain', '@font-face')
				.and('not.contain', 'slidein')
				.and('contain', '@media')
				.and('contain', 'padding');
		});
	});
});
