export const saveDraft = () => {
	cy.get('body').then((body) => {
		if (body.find('.editor-post-save-draft').length > 0) {
			cy.get('.editor-post-save-draft').click();
			cy.get('.editor-post-saved-state.is-saved');
		}
	});
};

export const setPostContent = (content) => {
	cy.window().then((win) => {
		const { dispatch } = win.wp.data;
		const blocks = win.wp.blocks.parse(content);
		dispatch('core/block-editor').resetBlocks(blocks);
	});
};
export const openBlockInserter = () => {
	cy.get('button[aria-label="Toggle block inserter"]').then((button) => {
		if (button.attr('aria-pressed') === 'false') {
			cy.get('button[aria-label="Toggle block inserter"]').click({
				force: true,
			});
		}
	});
};
export const closeBlockInserter = () => {
	cy.get('button[aria-label="Toggle block inserter"]').then((button) => {
		if (button.attr('aria-pressed') === 'true') {
			cy.get('button[aria-label="Toggle block inserter"]').click();
		}
	});
};
export const openBlockSettingsSideBar = () => {
	cy.get('button[aria-label="Settings"]').then((button) => {
		if (button.attr('aria-pressed') === 'false') {
			button.trigger('click');
			cy.get('button[aria-label="Settings"]').should(
				'have.attr',
				'aria-pressed',
				'true',
			);
		}
	});
};
export const openSideBarPanel = (label) => {
	cy.openBlockSettingsSideBar();
	cy.get('div[aria-label="Editor settings"] button')
		.contains(label)
		.then((button) => {
			if (button.attr('aria-expanded') === 'false') {
				button.trigger('click');
				cy.get('div[aria-label="Editor settings"] button')
					.contains(label)
					.should('have.attr', 'aria-expanded', 'true');
			}
		});
};
export const addBlock = (slug, attributes) => {
	cy.window().then((win) => {
		const block = win.wp.blocks.createBlock(slug, attributes);
		win.wp.data.dispatch('core/block-editor').insertBlock(block);
		cy.get(`[data-type="${slug}"]`).should('exist');
		if (attributes?.content) {
			cy.getPostContent(`.wp-block-${slug.split('/')[1]}`).should(
				'have.text',
				attributes.content,
			);
		}
	});
};
export const addBlocks = ({ slug, attributes }, children) => {
	let block;
	cy.window().then((win) => {
		block = win.wp.blocks.createBlock(
			slug,
			attributes,
			children.map(({ slug, attributes }) =>
				win.wp.blocks.createBlock(slug, attributes),
			),
		);
		win.wp.data.dispatch('core/block-editor').insertBlock(block);
	});
	return block;
};

export const wpDataSelect = (store, selector, ...parameters) => {
	cy.window().then((win) => {
		return win.wp.data.select(store)[selector](...parameters);
	});
};

export const previewCurrentPage = () => {
	cy.saveDraft();
	cy.url().then((url) => {
		const page = url.split('post=')[1].split('&')[0];
		cy.visit(`/?page_id=${page}&preview=true`);
	});
	cy.get('body').should('not.be.empty');
};

export const selectBlockById = (clientId) => {
	cy.window().then((win) => {
		cy.wrap(null).then(() =>
			win.wp.data.dispatch('core/block-editor').selectBlock(clientId),
		);
		cy.findBlockClass(`[data-block="${clientId}"]`, 'is-selected');
	});
};

export const findBlock = (blockSelector) => {
	cy.get('iframe[name="editor-canvas"]').then(($iframe) => {
		cy.wrap($iframe.contents().find(blockSelector));
	});
};
export const findBlockClass = (blockSelector, className) => {
	cy.get('iframe[name="editor-canvas"]').then(($iframe) => {
		cy.wrap($iframe.contents().find(blockSelector)).then(($block) => {
			expect($block[0].outerHTML).to.include(className);
		});
	});
};
