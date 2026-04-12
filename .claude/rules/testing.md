---
path: tests/**
---

# Playwright + WP Playground Testing Guidelines

## Architecture

- Each test subdirectory has its own `blueprint.json` + `setup.php` and gets a fresh WP Playground instance.
- `playwright.config.ts` auto-discovers specs by finding `*.spec.ts` files with a `blueprint.json` in the same directory. A spec uses the `blueprint.json` in its own directory (or one level up if shared).
- Each spec = one Playwright project = one CI matrix job = one separate GitHub Actions runner = one fresh WP Playground instance. They do NOT share state across specs.
- Tests within the same spec DO share a single Playground instance and run sequentially.

## Editor Canvas vs Page

- Use `editor.canvas` (or `page.locator('iframe[name="editor-canvas"]').contentFrame()`) for anything inside the block editor — blocks, text, styles. WordPress renders the editor in an iframe.
- Use `page` for sidebar panels, buttons, settings, and toolbar.

## Things That Break

- **Never use `page.goBack()`.** WP Playground crashes. Split into separate tests instead.
- **No `retries` in playwright config.** Retries mask real failures. Use `retries: 0`.
- **Tests share state within a spec.** Settings persist between tests in the same spec file. Explicitly reset anything a previous test might have changed.
- **Isolate heavy tests.** Complex tests (WASM compilation, multi-step workflows) should get their own directory with a `blueprint.json` so they run in a fresh Playground instance.

## WASM-Specific

- Always wait for the WASM module to load before filling CSS: poll `window.patternCss?.transform` until truthy.
- After filling CSS, poll `pcssAdditionalCssCompiled` to confirm compilation finished before asserting styles.
- Use `expect(...).toPass({ timeout })` for WASM compilation checks, not `waitForTimeout`.

## Assertions

- Use `toBeInViewport()` not `toBeVisible()` for elements hidden by `max-height` + `overflow: hidden`.
- Use `button#id` not `#id` when IDs may be duplicated (loading placeholders).
- When checking compiled CSS on the element, use `{ timeout: 10000 }` on `toHaveCSS` to allow for style injection delay.

## Preview

- `admin.createNewPost()` creates a post. Preview URL is `/?p=${postId}&preview=true`, not `/?page_id=`.

## Config

- Use `fast-glob` not `node:fs` `globSync` in config files — `@types/node` is pinned to v20 by `@wordpress/e2e-test-utils-playwright`.
- Use `.filter((s): s is { ... } => s !== null)` instead of `.filter(Boolean)` for proper type narrowing.
