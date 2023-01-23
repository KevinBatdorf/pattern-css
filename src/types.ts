export {};

declare global {
    interface Window {
        perPageCss: {
            canEditCss: string;
            pluginUrl: string;
        };
    }
}

export type LineOption = {
    line: number;
    classes?: string[];
};
