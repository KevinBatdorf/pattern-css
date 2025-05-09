import { BLOCK_CONTAINER } from '../constants';
import {
	addCodeToCurrentBlock,
	clearCodeFromCurrentBlock,
} from './features/blocks';
import {
	addBlock,
	addBlocks,
	closeWelcomeGuide,
	openBlockInserter,
	closeBlockInserter,
	openBlockSettingsSideBar,
	openSideBarPanel,
	saveDraft,
	setPostContent,
	wpDataSelect,
	previewCurrentPage,
	selectBlockById,
	findBlock,
	findBlockClass,
} from './gutenberg';
import { login, logout } from './login-logout';
import {
	visitPageEditor,
	visitAdminPage,
	visitToLoginPage,
} from './navigate-pages';
import {
	installPlugin,
	uninstallPlugin,
	resetDatabase,
	disableIframe,
} from './wp-cli';

// Port more commands from WP here:
// https://github.com/WordPress/gutenberg/tree/trunk/packages/e2e-test-utils/src

// Getting around
Cypress.Commands.add('visitLoginPage', (query) => visitToLoginPage(query));
Cypress.Commands.add('visitAdminPage', (path, query, options) =>
	visitAdminPage(path, query, options),
);
Cypress.Commands.add('visitNewPageEditor', (query, skipWelcomeGuide) =>
	visitPageEditor(query, skipWelcomeGuide),
);

// Login logout
Cypress.Commands.add('loginUser', (username, password) =>
	login(username, password),
);
Cypress.Commands.add('logoutUser', () => logout());

// Gutenberg
Cypress.Commands.add('closeWelcomeGuide', () => closeWelcomeGuide());
Cypress.Commands.add('saveDraft', () => saveDraft());
Cypress.Commands.add('openBlockInserter', () => openBlockInserter());
Cypress.Commands.add('closeBlockInserter', () => closeBlockInserter());
Cypress.Commands.add('openBlockSettingsSideBar', () =>
	openBlockSettingsSideBar(),
);
Cypress.Commands.add('openSideBarPanel', (label) => openSideBarPanel(label));
Cypress.Commands.add('addBlock', (slug, attributes) =>
	addBlock(slug, attributes),
);
Cypress.Commands.add('addBlocks', (block, children) =>
	addBlocks(block, children),
);
Cypress.Commands.add('selectBlockById', (clientId) =>
	selectBlockById(clientId),
);
Cypress.Commands.add('findBlockClass', findBlockClass);
Cypress.Commands.add('findBlock', findBlock);
Cypress.Commands.add('setPostContent', (content) => setPostContent(content));
Cypress.Commands.add('getPostContent', (addon = '') => {
	return cy.get(`${BLOCK_CONTAINER} ${addon}`);
});
Cypress.Commands.add('focusBlock', (blockName, addon = '') => {
	cy.get(
		`${BLOCK_CONTAINER} .wp-block[class$="${blockName}"] ${addon}`,
	).click();
});
Cypress.Commands.add('getCurrentPostObject', () => {
	cy.wpDataSelect('core/editor', 'getCurrentPost');
});
Cypress.Commands.add('wpDataSelect', (store, selector, ...parameters) =>
	wpDataSelect(store, selector, ...parameters),
);
Cypress.Commands.add('previewCurrentPage', () => previewCurrentPage());

// Server
Cypress.Commands.add('resetDatabase', () => resetDatabase());

// Manage plugins
Cypress.Commands.add('installPlugin', (slug) => installPlugin(slug));
Cypress.Commands.add('uninstallPlugin', (slug) => uninstallPlugin(slug));

// Disable iframe
Cypress.Commands.add('disableIframe', () => disableIframe());

// Block css
Cypress.Commands.add('clearCodeFromCurrentBlock', () =>
	clearCodeFromCurrentBlock(),
);
Cypress.Commands.add('addCodeToCurrentBlock', (code) =>
	addCodeToCurrentBlock(code),
);
