import { addQueryArgs } from '@wordpress/url';

export const visitToLoginPage = (query = '') => {
	const question = query.startsWith('?') ? '' : '?';
	cy.visit(`wp-login.php${question}${query}`);
};

export const visitAdminPage = (adminPath = '', query = '', options = {}) => {
	const question = query.startsWith('?') ? '' : '?';
	cy.visit(`wp-admin/${adminPath}${question}${query}`, options);
};

export const visitPageEditor = (query) => {
	query = addQueryArgs('', {
		post_type: 'page',
		...query,
	}).slice(1);

	cy.visitAdminPage('post-new.php', query);
};
