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
	it('Only adds the class after adding CSS', () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			wp.data.dispatch('core/block-editor').insertBlock(block);
			// Make sure no class is added
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			cy.findBlock(`.wp-block-group.${className}`).should('not.exist');
			// Add some css
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('p { color: rgb(155, 200, 130); }');
			// Check the group block has the class
			cy.findBlock(`.wp-block-group.${className}`).should('exist');
		});
	});

	it('Renders scoped to the block, targets inner content', () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Add similiar blocks
			const block2 = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'World',
				}),
			]);
			wp.data.dispatch('core/block-editor').insertBlock(block2);

			// Select the first block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('p { color: rgb(155, 200, 130); }');

			// First block p tag should be red
			cy.findBlock(`.${className} > p`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);
			// Second block p tag should not be red
			cy.findBlock('p')
				.not(`.${className} p`)
				.each(($el) => {
					cy.wrap($el).should(
						'not.have.css',
						'color',
						'rgb(155, 200, 130)',
					);
				});

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// First block p tag should be red
			cy.get(`.${className} p`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);
			// Second block p tag should not be red
			cy.get('p')
				.not(`.${className} p`)
				.each(($el) => {
					cy.wrap($el).should(
						'not.have.css',
						'color',
						'rgb(155, 200, 130)',
					);
				});
		});
	});

	it('Renders scoped to the block and concats multiple block styles', () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'Hello',
				}),
			]);
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Add similiar blocks
			const block2 = wp.blocks.createBlock('core/group', {}, [
				wp.blocks.createBlock('core/paragraph', {
					content: 'World',
				}),
			]);
			const className2 = `pcss-${block2.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block2);

			// Select the first block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('p { color: rgb(155, 200, 130); }');

			// Select the second block
			cy.selectBlockById(block2.clientId);
			cy.addCodeToCurrentBlock('p { color: blue; }');

			// First block p tag should be red
			cy.findBlock(`.${className} p`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);
			// Second block p tag should be blue
			cy.findBlock(`.${className2} p`).should(
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
				'rgb(155, 200, 130)',
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
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock();
			cy.addCodeToCurrentBlock('[block] { color: rgb(155, 200, 130); }');

			// p tag should be red
			cy.findBlock(`.${className}`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// p tag should be red
			cy.get(`.${className}`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);
		});
	});

	it("Errors when the css is invalid and doesn't persist it", () => {
		cy.withEditorWp((_win, wp) => {
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock(); // clear placeholder
			cy.addCodeToCurrentBlock('[block] { color: rgb(155, 200, 130); }');

			// p tag should be red
			cy.findBlock(`.${className}`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
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
			cy.findBlock(`.${className}`)
				.should('not.have.css', 'color', 'rgb(0, 128, 0)')
				.and('have.css', 'color', 'rgb(155, 200, 130)');

			// Confirm the same on the frontend
			cy.previewCurrentPage();

			// p tag should be red
			cy.get(`.${className}`)
				.should('not.have.css', 'color', 'rgb(0, 128, 0)')
				.and('have.css', 'color', 'rgb(155, 200, 130)');
		});
	});
	it('Supports custom selectors in addition to [block]', () => {
		cy.withEditorWp((win, wp) => {
			// Override usually by php but can mutate the window anyway
			win.patternCss.selectorOverride = {
				name: 'selector',
				type: 'type',
			};
			// Manually add blocks so we can get the block id
			const block = wp.blocks.createBlock('core/paragraph', {
				content: 'Hello',
			});
			const className = `pcss-${block.clientId?.split('-')[0]}`;
			wp.data.dispatch('core/block-editor').insertBlock(block);

			// Select the block
			cy.selectBlockById(block.clientId);
			cy.clearCodeFromCurrentBlock(); // clear placeholder
			cy.addCodeToCurrentBlock(`
				[block] { color: rgb(155, 200, 130); }
				selector { border-bottom: 1px solid green; }
			`);

			// p tag should be red
			cy.findBlock(`.${className}`).should(
				'have.css',
				'color',
				'rgb(155, 200, 130)',
			);

			// p tag should have green border
			cy.findBlock(`.${className}`).should(
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
	it('Removes @import, @keyframes, and others', () => {
		const css = `@charset "UTF-8";
		  @import url('https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css');
		  @media screen and (max-width: 600px) { .f { foo: 'bar';} }
		  @page :left {}
		  @font-face {font-family: MyFont;src: url('myfont.woff2');}
		  @keyframes slidein {from {}to {}}
		  @view-transition { navigation: auto }
		  @counter-style customCounter { system: cyclic; }
		  @namespace svg url(http://www.w3.org/2000/svg);`;

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

			// should not have any of the rules except media query
			cy.get(`style#pcss-block-${className}-inline-css`)
				.invoke('text')
				.should('not.contain', '@import')
				.and('not.contain', '@keyframes')
				.and('not.contain', '@charset')
				.and('not.contain', '@font-face')
				.and('not.contain', '@page')
				.and('not.contain', 'slidein')
				.and('not.contain', '@view-transition')
				.and('not.contain', '@counter-style')
				.and('not.contain', '@namespace')
				.and('contain', '@media');
		});
	});
});
