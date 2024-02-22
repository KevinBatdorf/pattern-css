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
context('Pattern Css', () => {
	it('Only adds the class after adding CSS', () => {
		cy.window().then((win) => {
			// Manually add blocks so we can get the block id
			const block = win.wp.blocks.createBlock('core/group', {}, [
				win.wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			win.wp.data.dispatch('core/block-editor').insertBlock(block);
			// Make sure no class is added
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			cy.get(`.wp-block-group.${className}`).should('not.exist');
			// Add some css
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('p { color: red; }');
			// Check the group block has the class
			cy.get(`.wp-block-group.${className}`).should('exist');
		});
	});

	it('Renders scoped to the block, targets inner content', () => {
		cy.window().then((win) => {
			// Manually add blocks so we can get the block id
			const block = win.wp.blocks.createBlock('core/group', {}, [
				win.wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			win.wp.data.dispatch('core/block-editor').insertBlock(block);

			// Add similiar blocks
			const block2 = win.wp.blocks.createBlock('core/group', {}, [
				win.wp.blocks.createBlock('core/paragraph', {
					content: 'World',
				}),
			]);
			win.wp.data.dispatch('core/block-editor').insertBlock(block2);

			// Select the first block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('p { color: red; }');

			// First block p tag should be red
			cy.get(`.${className} > p`).should(
				'have.css',
				'color',
				'rgb(255, 0, 0)',
			);
			// Second block p tag should not be red
			cy.get('p')
				.not(`.${className} p`)
				.each(($el) => {
					cy.wrap($el).should(
						'not.have.css',
						'color',
						'rgb(255, 0, 0)',
					);
				});

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// First block p tag should be red
			cy.get(`.${className} p`).should(
				'have.css',
				'color',
				'rgb(255, 0, 0)',
			);
			// Second block p tag should not be red
			cy.get('p')
				.not(`.${className} p`)
				.each(($el) => {
					cy.wrap($el).should(
						'not.have.css',
						'color',
						'rgb(255, 0, 0)',
					);
				});
		});
	});

	it('Renders scoped to the block and concats multiple block styles', () => {
		cy.window().then((win) => {
			// Manually add blocks so we can get the block id
			const block = win.wp.blocks.createBlock('core/group', {}, [
				win.wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			win.wp.data.dispatch('core/block-editor').insertBlock(block);

			// Add similiar blocks
			const block2 = win.wp.blocks.createBlock('core/group', {}, [
				win.wp.blocks.createBlock('core/paragraph', {
					content: 'World',
				}),
			]);
			const className2 = `pcss-${block2.clientId?.split('-')[0]}`;
			win.wp.data.dispatch('core/block-editor').insertBlock(block2);

			// Select the first block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('p { color: red; }');

			// Select the second block
			cy.selectBlockById(block2.clientId);
			cy.addCodeToCurrentBlock('p { color: blue; }');

			// First block p tag should be red
			cy.get(`.${className} p`).should(
				'have.css',
				'color',
				'rgb(255, 0, 0)',
			);
			// Second block p tag should be blue
			cy.get(`.${className2} p`).should(
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
				'rgb(255, 0, 0)',
			);
			// Second block p tag should be blue
			cy.get(`.${className2} p`).should(
				'have.css',
				'color',
				'rgb(0, 0, 255)',
			);
		});
	});

	it('Renders scoped to the block, targets block itself', () => {
		cy.window().then((win) => {
			// Manually add blocks so we can get the block id
			const block = win.wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			win.wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('[block] { color: red; }');

			// p tag should be red
			cy.get(`.${className}`).should(
				'have.css',
				'color',
				'rgb(255, 0, 0)',
			);

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// p tag should be red
			cy.get(`.${className}`).should(
				'have.css',
				'color',
				'rgb(255, 0, 0)',
			);
		});
	});

	it("Errors when the css is invalid and doesn't persist it", () => {
		cy.window().then((win) => {
			// Manually add blocks so we can get the block id
			const block = win.wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			win.wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock(); // clear placeholder
			cy.addCodeToCurrentBlock('[block] { color: red; }');

			// p tag should be red
			cy.get(`.${className}`).should(
				'have.css',
				'color',
				'rgb(255, 0, 0)',
			);
			// Make sure the 'line-error' class isn't there
			cy.get('[data-cy="pcss-editor-block"] pre .line-error').should(
				'not.exist',
			);

			// Add some invalid css
			cy.addCodeToCurrentBlock('??');

			cy.get('[data-cy="pcss-editor-block"] pre .line-error').should(
				'exist',
			);

			// Append style to make the text green
			cy.addCodeToCurrentBlock('[block] { color: green; }');

			// p tag should be red
			cy.get(`.${className}`)
				.should('not.have.css', 'color', 'rgb(0, 128, 0)')
				.and('have.css', 'color', 'rgb(255, 0, 0)');

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// p tag should be red
			cy.get(`.${className}`)
				.should('not.have.css', 'color', 'rgb(0, 128, 0)')
				.and('have.css', 'color', 'rgb(255, 0, 0)');
		});
	});
	it('Supports custom selectors in addition to [block]', () => {
		cy.window().then((win) => {
			// Override usually by php but can mutate the window anyway
			win.patternCss.selectorOverride = {
				name: 'selector',
				type: 'type',
			};
			// Manually add blocks so we can get the block id
			const block = win.wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			win.wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock(); // clear placeholder
			cy.addCodeToCurrentBlock(`
				[block] { color: red; }
				selector { border-bottom: 1px solid green; }
			`);

			// p tag should be red
			cy.get(`.${className}`).should(
				'have.css',
				'color',
				'rgb(255, 0, 0)',
			);

			// p tag should have green border
			cy.get(`.${className}`).should(
				'have.css',
				'border-bottom',
				'1px solid rgb(0, 128, 0)',
			);

			// Make sure the 'line-error' class isn't there
			cy.get('[data-cy="pcss-editor-block"] pre .line-error').should(
				'not.exist',
			);
		});
	});
});
