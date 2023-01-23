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
// context('Block checks', () => {
// it('Adds the block', () => {
// cy.addBlock('kevinbatdorf/per-page-css');
// // Check the loading text is gone.
// // cy.getPostContent().contains('Loading').should('not.exist')
// // Check the block is there
// cy.getPostContent('.wp-block[class$="per-page-css"]').should('exist');
// });
// });
