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

const GLOBAL_EDITOR =
	'#pcss-popout-global-mount .npm__react-simple-code-editor__textarea';

context('Pattern Css (Global)', () => {
	it('Can set styles globally', () => {
		cy.withEditorWp((_win, wp, iframe) => {
			cy.get('#pcss-popout-global-mount').should('exist');
			cy.get(GLOBAL_EDITOR).should('not.exist');
			// Make sure white bg
			cy.wrap(iframe.document.body).should(
				'have.css',
				'background-color',
				'rgb(255, 255, 255)',
			);

			cy.get('[aria-label="Options"]').click();
			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.get('[data-cy="global-css-editor-btn"')
				.should('exist')
				.wait(1000)
				.should('be.visible')
				.click();

			// confirm popout is open
			cy.get(GLOBAL_EDITOR).should('exist').click();
			cy.get(GLOBAL_EDITOR).should('have.focus');
			cy.get(GLOBAL_EDITOR).type('body { background: green; }', {
				parseSpecialCharSequences: false,
			});

			// Confirm text is typed
			cy.get(GLOBAL_EDITOR).should(
				'have.value',
				'body { background: green; }',
			);
			// Confirm colors render
			cy.wrap(iframe.document.body).should(
				'have.css',
				'background-color',
				'rgb(0, 128, 0)',
			);

			// The save has a 1s debounce delay
			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(1000);

			// Add a title so we can save the post
			wp.data
				.dispatch('core/editor')
				.editPost({ title: 'Your Page Title' });

			// Confirm on front end
			cy.previewCurrentPage();
			cy.get('body').should(
				'have.css',
				'background-color',
				'rgb(0, 128, 0)',
			);
		});
	});
});
