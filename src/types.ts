import { transform } from 'lightningcss-wasm';
export {};

declare global {
	interface Window {
		patternCss: {
			pluginUrl: string;
			transform: typeof transform;
			selectorOverride?: {
				type: string;
				name: string;
			};
		};
	}
}

export type LineOption = {
	line: number;
	classes?: string[];
};
