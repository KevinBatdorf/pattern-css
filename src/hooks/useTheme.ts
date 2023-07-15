import { useEffect, useState } from '@wordpress/element';
import { getHighlighter, Lang, setCDN, Theme, setWasm } from 'shiki';
import useSWRImmutable from 'swr/immutable';

type Params = { theme: Theme; lang: Lang; ready?: boolean };

const fetcher = ({ theme, lang, ready }: Params) => {
    if (!ready) throw new Error();
    return getHighlighter({ langs: [lang], theme });
};
let once = false;

export const useTheme = ({ theme, lang, ready = true }: Params) => {
    const [wasmLoaded, setWasmFileLoaded] = useState(false);
    if (!once) {
        once = true;
        setCDN(window.patternCss?.pluginUrl + 'build/shiki/');
    }
    const { data: highlighter, error } = useSWRImmutable(
        { theme, lang, ready: ready && wasmLoaded },
        fetcher,
    );
    useEffect(() => {
        const assetDir = window.patternCss?.pluginUrl + 'build/shiki/';
        fetch(assetDir + 'dist/onig.wasm')
            .then((res) => res.arrayBuffer())
            .then((wasmBuffer) => {
                setWasm(wasmBuffer);
                setWasmFileLoaded(true);
            });
    }, []);

    return {
        highlighter,
        error,
        loading: (!highlighter && !error) || !wasmLoaded,
    };
};
