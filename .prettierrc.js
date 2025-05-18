module.exports = {
	trailingComma: 'all',
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	bracketSameLine: true,
	importOrder: ['^@wordpress/(.*)$', '<THIRD_PARTY_MODULES>', '^[./]'],
	plugins: [
		'@trivago/prettier-plugin-sort-imports',
		'prettier-plugin-tailwindcss',
	],
	overrides: [
		{
			files: ['**/*.html'],
			options: {
				singleQuote: false,
			},
		},
		{
			files: ['**/*.md'],
			options: {
				useTabs: false,
				tabWidth: 2,
				singleQuote: false,
			},
		},
	],
};
