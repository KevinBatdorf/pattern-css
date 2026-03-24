import { defineConfig, devices } from '@playwright/test';

const PORT = 9400;
const WP_VERSION = process.env.WP_VERSION || 'latest';
export const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: './tests',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: 'html',
	use: {
		baseURL: BASE,
		trace: 'on-first-retry',
		video: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	webServer: {
		command: `wp-playground-cli server --auto-mount --blueprint=tests/blueprint.json --wp=${WP_VERSION} --port=${PORT} --internal-cookie-store=true --login=false`,
		url: BASE,
		reuseExistingServer: false,
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
});
