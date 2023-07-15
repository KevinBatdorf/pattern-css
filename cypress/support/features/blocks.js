export const addCodeToCurrentBlock = (code) => {
    cy.openSideBarPanel('Additional CSS');
    cy.get('[data-cy="pcss-editor-block"] textarea').should('exist').click();
    cy.get('[data-cy="pcss-editor-block"] textarea')
        .should('have.focus')
        .type(code, { parseSpecialCharSequences: false });
};
