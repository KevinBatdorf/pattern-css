import { createBlock } from '@wordpress/blocks';

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
context('Per Block Css', () => {
    it('Renders scoped to the block, targets inner content', () => {
        cy.window().then((win) => {
            // Manually add blocks so we can get the block id
            const block = win.wp.blocks.createBlock('core/group', {}, [
                win.wp.blocks.createBlock('core/paragraph', {
                    content: 'Hello',
                }),
            ]);
            win.wp.data.dispatch('core/block-editor').insertBlock(block);
            // Check the group block has the class
            const className = `ppc-${block.clientId?.split('-')[0]}`;
            cy.get(`.wp-block-group.${className}`).should('exist');

            // Add similiar blocks
            const block2 = win.wp.blocks.createBlock('core/group', {}, [
                win.wp.blocks.createBlock('core/paragraph', {
                    content: 'World',
                }),
            ]);
            win.wp.data.dispatch('core/block-editor').insertBlock(block2);
            // Check the group block has the class
            const className2 = `ppc-${block2.clientId?.split('-')[0]}`;
            cy.get(`.wp-block-group.${className2}`).should('exist');

            // Select the first block
            win.wp.data
                .dispatch('core/block-editor')
                .selectBlock(block.clientId);

            // Open the panel
            cy.openSideBarPanel('Additional CSS');
            cy.get('[data-cy="ppc-editor-block"] textarea')
                .should('exist')
                .click()
                .should('have.focus')
                // Have to escape the curly braces
                .type('p {{} color: red; {}}');

            // First block p tag should be red
            cy.get(`.${className} p`).should(
                'have.css',
                'color',
                'rgb(255, 0, 0)',
            );
            // Second block p tag should not be red
            cy.get(`.${className2} p`).should(
                'not.have.css',
                'color',
                'rgb(255, 0, 0)',
            );

            // confirm the same on the frontend
            cy.previewCurrentPage();

            // First block p tag should be red
            cy.get(`.${className} p`).should(
                'have.css',
                'color',
                'rgb(255, 0, 0)',
            );
            // Second block p tag should not be red
            cy.get(`.${className2} p`).should(
                'not.have.css',
                'color',
                'rgb(255, 0, 0)',
            );
        });
    });

    it('Renders scoped to the block, targets block itself', () => {
        cy.window().then((win) => {
            // Manually add blocks so we can get the block id
            const block = win.wp.blocks.createBlock('core/paragraph', {
                content: 'Hello',
            });
            win.wp.data.dispatch('core/block-editor').insertBlock(block);
            // Check the group block has the class
            const className = `ppc-${block.clientId?.split('-')[0]}`;
            cy.get(`.wp-block-paragraph.${className}`).should('exist');

            // Select the block
            win.wp.data
                .dispatch('core/block-editor')
                .selectBlock(block.clientId);

            // Open the panel
            cy.openSideBarPanel('Additional CSS');
            cy.get('[data-cy="ppc-editor-block"] textarea')
                .should('exist')
                .click()
                .should('have.focus')
                // Have to escape the curly braces
                .type('[block] {{} color: red; {}}');

            // p tag should be red
            cy.get(`.${className}`).should(
                'have.css',
                'color',
                'rgb(255, 0, 0)',
            );

            // confirm the same on the frontend
            cy.previewCurrentPage();

            // p tag should be red
            cy.get(`.${className}`).should(
                'have.css',
                'color',
                'rgb(255, 0, 0)',
            );
        });
    });
});
