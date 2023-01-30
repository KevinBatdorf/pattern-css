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
context('Per Page Css', () => {
    it('Styles only show on the page', () => {
        cy.addBlock('core/paragraph', { content: 'Hello World' });
        cy.addCodeToCurrentPage('p { color: red; }');
        cy.getPostContent('.wp-block-paragraph').should(
            'have.css',
            'color',
            'rgb(255, 0, 0)',
        );
        cy.previewCurrentPage();
        // check all paragraphs are red
        cy.get('p').then((ps) => {
            ps.each((_, p) => {
                cy.wrap(p).should('have.css', 'color', 'rgb(255, 0, 0)');
            });
        });

        // Add a second page and confirm the styles don't show
        cy.visitNewPageEditor();
        cy.addBlock('core/paragraph', { content: 'Hello World' });
        cy.previewCurrentPage();
        // check all paragraphs are not red
        cy.get('p').then((ps) => {
            ps.each((_, p) => {
                cy.wrap(p).should('not.have.css', 'color', 'rgb(255, 0, 0)');
            });
        });
    });
});
