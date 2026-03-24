import type { transform } from 'lightningcss-wasm';

declare global {
	interface Window {
		patternCss: {
			pluginUrl: string;
			transform: typeof transform;
			selectorOverride?: {
				type: string;
				name: string;
			};
			allowManualOverride?: boolean;
			globalCss: string;
			globalCssCompiled: string;
		};
	}
}

export type LineOption = {
	line: number;
	classes?: string[];
};
