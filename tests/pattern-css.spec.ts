import { expect, test } from '@wordpress/e2e-test-utils-playwright';

test.beforeEach(async ({ requestUtils }) => {
	await requestUtils.login();
});

test.describe('Pattern CSS (Block)', () => {
	test('Panel is available on a block', async ({ admin, page, editor }) => {
		await admin.createNewPost({ title: 'Test post' });
		await editor.insertBlock({ name: 'core/paragraph' });
		await page.getByRole('button', { name: 'Pattern CSS' }).click();
		await expect(page.locator('.pattern-css-editor')).toBeVisible();
	});

	test('Only adds the class after adding CSS', async ({
		admin,
		page,
		editor,
	}) => {
		await admin.createNewPost({ title: 'Test post' });
		await editor.insertBlock({
			name: 'core/group',
			innerBlocks: [
				{ name: 'core/paragraph', attributes: { content: 'Hello' } },
			],
		});

		// Get the block's client ID
		const blockId = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return blocks[0]?.clientId;
		});
		const className = `pcss-${blockId?.split('-')[0]}`;

		// No pcss class should exist yet
		const editorCanvas = page
			.locator('iframe[name="editor-canvas"]')
			.contentFrame();
		await expect(
			editorCanvas.locator(`.wp-block-group.${className}`),
		).not.toBeVisible();

		// Select the block and open Pattern CSS panel
		await editor.selectBlocks(
			editorCanvas.locator('.wp-block-group').first(),
		);
		await page.getByRole('button', { name: 'Pattern CSS' }).click();

		// Type CSS into the editor
		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill('p { color: rgb(155, 200, 130); }');

		// Now the class should exist
		await expect(
			editorCanvas.locator(`.wp-block-group.${className}`),
		).toBeVisible();
	});

	test('Renders scoped CSS targeting inner content', async ({
		admin,
		page,
		editor,
	}) => {
		await admin.createNewPost({ title: 'Test post' });

		// Insert two group blocks with paragraphs
		await editor.insertBlock({
			name: 'core/group',
			innerBlocks: [
				{ name: 'core/paragraph', attributes: { content: 'Hello' } },
			],
		});
		await editor.insertBlock({
			name: 'core/group',
			innerBlocks: [
				{ name: 'core/paragraph', attributes: { content: 'World' } },
			],
		});

		const editorCanvas = page
			.locator('iframe[name="editor-canvas"]')
			.contentFrame();

		// Select the first group block
		await editor.selectBlocks(
			editorCanvas.locator('.wp-block-group').first(),
		);
		await page.getByRole('button', { name: 'Pattern CSS' }).click();

		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill('p { color: rgb(155, 200, 130); }');

		// Get the first block's pcss class
		const className = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return blocks[0]?.attributes?.pcssClassId;
		});

		// First block's paragraph should have the color
		await expect(editorCanvas.locator(`.${className} > p`)).toHaveCSS(
			'color',
			'rgb(155, 200, 130)',
		);

		// Second block's paragraph should NOT have the color
		const secondGroupP = editorCanvas
			.locator('.wp-block-group')
			.nth(1)
			.locator('p');
		await expect(secondGroupP).not.toHaveCSS('color', 'rgb(155, 200, 130)');
	});

	test('Scopes CSS to [block] selector targeting block itself', async ({
		admin,
		page,
		editor,
	}) => {
		await admin.createNewPost({ title: 'Test post' });
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: { content: 'Hello' },
		});

		const editorCanvas = page
			.locator('iframe[name="editor-canvas"]')
			.contentFrame();

		await editor.selectBlocks(
			editorCanvas.locator('p[role=document]').first(),
		);
		await page.getByRole('button', { name: 'Pattern CSS' }).click();

		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill('[block] { color: rgb(155, 200, 130); }');

		const className = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return blocks[0]?.attributes?.pcssClassId;
		});

		await expect(editorCanvas.locator(`.${className}`)).toHaveCSS(
			'color',
			'rgb(155, 200, 130)',
		);
	});

	test('Multiple blocks have independent scoped styles', async ({
		admin,
		page,
		editor,
	}) => {
		await admin.createNewPost({ title: 'Test post' });

		await editor.insertBlock({
			name: 'core/group',
			innerBlocks: [
				{ name: 'core/paragraph', attributes: { content: 'Hello' } },
			],
		});
		await editor.insertBlock({
			name: 'core/group',
			innerBlocks: [
				{ name: 'core/paragraph', attributes: { content: 'World' } },
			],
		});

		const editorCanvas = page
			.locator('iframe[name="editor-canvas"]')
			.contentFrame();

		// Style first block
		await editor.selectBlocks(
			editorCanvas.locator('.wp-block-group').first(),
		);
		await page.getByRole('button', { name: 'Pattern CSS' }).click();
		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill('p { color: rgb(155, 200, 130); }');

		// Style second block
		await editor.selectBlocks(
			editorCanvas.locator('.wp-block-group').nth(1),
		);
		await page.getByRole('button', { name: 'Pattern CSS' }).click();
		const cssEditor2 = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor2.fill('p { color: rgb(0, 0, 255); }');

		const classNames = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return [
				blocks[0]?.attributes?.pcssClassId,
				blocks[1]?.attributes?.pcssClassId,
			];
		});

		// First block should be green-ish
		await expect(editorCanvas.locator(`.${classNames[0]} p`)).toHaveCSS(
			'color',
			'rgb(155, 200, 130)',
		);

		// Second block should be blue
		await expect(
			editorCanvas.locator(`.${classNames[1]} p`).first(),
		).toHaveCSS('color', 'rgb(0, 0, 255)');
	});

	test('Shows error on invalid CSS and does not persist it', async ({
		admin,
		page,
		editor,
	}) => {
		await admin.createNewPost({ title: 'Test post' });
		await editor.insertBlock({
			name: 'core/paragraph',
			attributes: { content: 'Hello' },
		});

		const editorCanvas = page
			.locator('iframe[name="editor-canvas"]')
			.contentFrame();

		await editor.selectBlocks(
			editorCanvas.locator('p[role=document]').first(),
		);
		await page.getByRole('button', { name: 'Pattern CSS' }).click();

		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill('[block] { color: rgb(155, 200, 130); }');

		// No error line should exist
		await expect(
			page.locator('[data-cy="pcss-editor-block"] pre .line-error'),
		).not.toBeVisible();

		const className = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return blocks[0]?.attributes?.pcssClassId;
		});

		await expect(editorCanvas.locator(`.${className}`)).toHaveCSS(
			'color',
			'rgb(155, 200, 130)',
		);

		// Add invalid CSS
		await cssEditor.fill('[block] { color: rgb(155, 200, 130); } ??');

		// Error line should appear
		await expect(
			page.locator('[data-cy="pcss-editor-block"] pre .line-error'),
		).toBeVisible();

		// Color should still be the valid one, not changed
		await expect(editorCanvas.locator(`.${className}`)).toHaveCSS(
			'color',
			'rgb(155, 200, 130)',
		);
	});

	test('Removes @keyframes and @font-face but keeps @media', async ({
		admin,
		page,
		editor,
	}) => {
		await admin.createNewPost({ title: 'Test post' });
		await editor.insertBlock({
			name: 'core/group',
			innerBlocks: [
				{ name: 'core/paragraph', attributes: { content: 'Hello' } },
			],
		});

		const editorCanvas = page
			.locator('iframe[name="editor-canvas"]')
			.contentFrame();

		await editor.selectBlocks(
			editorCanvas.locator('.wp-block-group').first(),
		);
		await page.getByRole('button', { name: 'Pattern CSS' }).click();

		const css = [
			"@font-face { font-family: MyFont; src: url('myfont.woff2'); }",
			'@keyframes slidein { from { opacity: 0 } to { opacity: 1 } }',
			'@media screen and (max-width: 600px) { [block] { color: red; } }',
			'[block] { padding: 1rem; }',
		].join('\n');

		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill(css);

		// Check compiled CSS attribute directly — the PHP filter strips
		// @keyframes/@font-face at render time, and the editor transform
		// also strips them before saving the compiled attribute.
		const compiled = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return blocks[0]?.attributes?.pcssAdditionalCssCompiled ?? '';
		});

		expect(compiled).not.toContain('@keyframes');
		expect(compiled).not.toContain('@font-face');
		expect(compiled).toContain('@media');
		expect(compiled).toContain('padding');
	});
});
