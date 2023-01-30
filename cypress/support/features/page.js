export const addCodeToCurrentPage = (code) => {
    cy.get(
        '.interface-interface-skeleton__sidebar button[aria-label="Page"]:not(.is-active',
    ).click();
    cy.openSideBarPanel('Additional CSS');
    cy.get('[data-cy="ppc-editor-page"] textarea')
        .should('exist')
        .click()
        .should('have.focus')
        .type(code, { parseSpecialCharSequences: false });
};
