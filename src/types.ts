export {};

declare global {
    interface Window {
        patternCss: {
            canEditCss: string;
            pluginUrl: string;
        };
    }
}

export type LineOption = {
    line: number;
    classes?: string[];
};
