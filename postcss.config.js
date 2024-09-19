module.exports = ({ mode }) => ({
	ident: 'postcss',
	sourceMap: mode !== 'production',
	plugins: [
		require('postcss-import'),
		require('tailwindcss/nesting'),
		require('tailwindcss')(),
		(css) =>
			css.walkRules((rule) => {
				// Removes top level TW styles like *::before {}
				if (rule.selector.startsWith('*')) rule.remove();
			}),
		// See: https://github.com/WordPress/gutenberg/blob/trunk/packages/postcss-plugins-preset/lib/index.js
		require('autoprefixer')({ grid: true }),
		require('postcss-safe-important'),
		mode === 'production' &&
			// See: https://github.com/WordPress/gutenberg/blob/trunk/packages/scripts/config/webpack.config.js#L68
			require('cssnano')({
				preset: [
					'default',
					{
						discardComments: {
							removeAll: true,
						},
					},
				],
			}),
	],
});
