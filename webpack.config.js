const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    ...defaultConfig,
    plugins: [
        ...defaultConfig.plugins,
        new CopyPlugin({
            patterns: [
                { from: 'node_modules/shiki/dist', to: 'shiki/dist' },
                {
                    from: 'node_modules/shiki/themes/light-plus.json',
                    to: 'shiki/themes',
                },
                {
                    from: 'node_modules/shiki/languages/css.tmLanguage.json',
                    to: 'shiki/languages',
                },
                { from: 'src/fonts', to: 'fonts' },
            ],
        }),
    ],
    experiments: {
        asyncWebAssembly: true,
    },
};
