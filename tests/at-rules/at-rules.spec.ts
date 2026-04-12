import type { Page } from '@playwright/test';
import { expect, test } from '@wordpress/e2e-test-utils-playwright';

/** Wait for the WASM module to load before interacting with CSS editor */
async function waitForWasm(page: Page) {
	await expect(async () => {
		const ready = await page.evaluate(() => !!window.patternCss?.transform);
		expect(ready).toBe(true);
	}).toPass({ timeout: 15000 });
}

test.beforeEach(async ({ requestUtils }) => {
	await requestUtils.login();
});

test.describe('Pattern CSS (At-Rules)', () => {
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
		await waitForWasm(page);

		const cssEditor = page.locator(
			'[data-cy="pcss-editor-block"] textarea',
		);

		const css = [
			"@font-face { font-family: MyFont; src: url('myfont.woff2'); }",
			'@keyframes slidein { from { opacity: 0 } to { opacity: 1 } }',
			'@media screen and (max-width: 600px) { [block] { color: red; } }',
			'[block] { padding: 1rem; }',
		].join('\n');

		await cssEditor.fill(css);

		// Wait for WASM compilation to finish and update the attribute
		await expect(async () => {
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
		}).toPass({ timeout: 10000 });
	});
});
