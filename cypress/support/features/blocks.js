export const addCodeToCurrentBlock = (code) => {
    cy.openSideBarPanel('Additional CSS');
    cy.get('[data-cy="ppc-editor-block"] textarea')
        .should('exist')
        .click()
        .should('have.focus')
        .type(code, { parseSpecialCharSequences: false });
};
