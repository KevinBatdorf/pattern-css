export const escapeCSS = (url: string) =>
	url
		.replace(/<\s*script\s*>/gi, '&lt;script&gt;')
		.replace(/<\s*\/\s*script\s*>/gi, '&lt;/script&gt;')
		.replace(/<\s*style\s*>/gi, '&lt;style&gt;')
		.replace(/<\s*\/\s*style\s*>/gi, '&lt;/style&gt;');
