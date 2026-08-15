import type { Page } from '@playwright/test';
import { expect, test } from '@wordpress/e2e-test-utils-playwright';

/** Wait for the WASM module to load */
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
		await admin.createNewPost({ title: 'At-rules test' });
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

		// Wait for WASM compilation to finish
		await expect(async () => {
			const compiled = await page.evaluate(() => {
				const blocks = window.wp.data
					.select('core/block-editor')
					.getBlocks();
				return blocks[0]?.attributes?.pcssAdditionalCssCompiled ?? '';
			});
			expect(compiled.length).toBeGreaterThan(0);
		}).toPass({ timeout: 15000 });

		// Save and preview on the front end
		await page.getByRole('button', { name: 'Save draft' }).click();
		await expect(
			page.locator('.editor-post-saved-state.is-saved'),
		).toBeVisible({ timeout: 10000 });

		const url = page.url();
		const postId = new URL(url).searchParams.get('post');
		await page.goto(`/?p=${postId}&preview=true`);
		await page.waitForLoadState('networkidle');

		// Check the rendered HTML on the front end
		const frontBlock = page.locator('.wp-block-group').first();
		await expect(frontBlock).toBeVisible();

		// The theme ships its own at-rules, so the whole page is too broad.
		const emitted = await page
			.locator('style[id^="pcss-block-"]')
			.first()
			.innerText();
		// @font-face and @keyframes should be stripped
		expect(emitted).not.toContain('@keyframes');
		expect(emitted).not.toContain('@font-face');
		// @media and padding should be kept
		expect(emitted).toContain('@media');
		expect(emitted).toContain('padding');
	});
});
