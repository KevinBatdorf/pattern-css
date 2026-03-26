import { expect, test } from '@wordpress/e2e-test-utils-playwright';

test.beforeEach(async ({ requestUtils }) => {
	await requestUtils.login();
});

test.describe('Pattern CSS (Manual Override)', () => {
	test('ID input is editable when override is enabled', async ({
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

		// Add CSS so the block gets a class ID
		await page.getByRole('button', { name: 'Pattern CSS' }).click();
		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill('[block] { color: red; }');

		// Open the Advanced section in the sidebar
		await page.getByRole('button', { name: 'Advanced' }).click();

		const idInput = page.getByLabel('Pattern CSS ID');
		await expect(idInput).toBeEnabled();
	});

	test('Apply button appears when ID is dirty and slugifies on apply', async ({
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

		// Add CSS first
		await page.getByRole('button', { name: 'Pattern CSS' }).click();
		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill('[block] { color: red; }');

		// Open Advanced
		await page.getByRole('button', { name: 'Advanced' }).click();

		const idInput = page.getByLabel('Pattern CSS ID');

		// Change the ID
		await idInput.fill('My Custom Class!');

		// Apply button should appear
		const applyButton = page.getByRole('button', { name: 'Apply' });
		await expect(applyButton).toBeVisible();

		// Click Apply
		await applyButton.click();

		// Should be slugified
		const newId = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return blocks[0]?.attributes?.pcssClassId;
		});
		expect(newId).toBe('my-custom-class');

		// Apply button should be gone
		await expect(applyButton).not.toBeVisible();
	});

	test('Applying new ID removes old class from className', async ({
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

		// Add CSS
		await page.getByRole('button', { name: 'Pattern CSS' }).click();
		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);
		await cssEditor.fill('[block] { color: red; }');

		const oldId = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return blocks[0]?.attributes?.pcssClassId;
		});

		// Open Advanced and change the ID
		await page.getByRole('button', { name: 'Advanced' }).click();

		const idInput = page.getByLabel('Pattern CSS ID');
		await idInput.fill('new-class');
		await page.getByRole('button', { name: 'Apply' }).click();

		const attrs = await page.evaluate(() => {
			const blocks = window.wp.data
				.select('core/block-editor')
				.getBlocks();
			return {
				className: blocks[0]?.attributes?.className,
				pcssClassId: blocks[0]?.attributes?.pcssClassId,
			};
		});

		expect(attrs.pcssClassId).toBe('new-class');
		expect(attrs.className).toContain('new-class');
		expect(attrs.className).not.toContain(oldId);
	});
});
