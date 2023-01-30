import { store as coreStore } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line - TODO
import { store as editorStore } from '@wordpress/editor';
import {
    useEffect,
    useLayoutEffect,
    useState,
    useMemo,
    useCallback,
} from '@wordpress/element';
import { escapeHTML } from '@wordpress/escape-html';
import init, { transform, Warning as CssWarning } from 'lightningcss-wasm';
import { CodeEditor } from './CodeEditor';
import { CodePreview } from './CodePreview';

export const PageControl = () => {
    const [ready, setReady] = useState(false);
    const [warnings, setWarnings] = useState<CssWarning[]>([]);
    const { initialCss, compiledCss } = useSelect((select) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore-next-line - TODO
        const { getCurrentPostId, getEditedPostAttribute } =
            select(editorStore);
        const { getEntityRecord } = select(coreStore);
        const postType = getEditedPostAttribute('type');
        const postId = getCurrentPostId();
        const {
            ppc_additional_css: initialCss,
            ppc_additional_css_compiled: compiledCss,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore-next-line - TODO
        } = getEntityRecord('postType', postType, postId).meta;
        return { initialCss, compiledCss };
    }, []);

    const [css, setCss] = useState(initialCss || '');
    const [transformed, setTransformed] = useState<Uint8Array>();
    const [compiled, setCompiled] = useState(compiledCss || '');
    const hasPermission = useMemo(() => window?.perPageCss?.canEditCss, []);
    const { editPost } = useDispatch(editorStore);

    const handleChange = useCallback((value: string) => {
        const css = escapeHTML(value);
        setWarnings([]);
        setCss(css);

        const transformed = transform({
            filename: 'raw.css',
            code: new TextEncoder().encode(css),
            minify: true,
            errorRecovery: true,
        });
        if (transformed.warnings.length > 0) {
            setWarnings(transformed.warnings);
            return;
        }
        setTransformed(transformed.code);
    }, []);

    useEffect(() => {
        if (!hasPermission) return;
        init().then(() => setReady(true));
    }, [hasPermission]);

    useEffect(() => {
        if (!ready || !initialCss) return;
        handleChange(initialCss);
    }, [ready, handleChange, initialCss]);

    useEffect(() => {
        if (!ready) return;
        if (transformed === undefined) return;
        setCompiled(new TextDecoder().decode(transformed));
    }, [transformed, ready]);

    useLayoutEffect(() => {
        if (!ready || compiled === undefined) return;
        // Append css to iframe
        const frame = (
            document.querySelector(
                'iframe[name="editor-canvas"]',
            ) as HTMLIFrameElement
        )?.contentWindow as Window;

        const parent = frame
            ? frame.document
            : document.querySelector('.editor-styles-wrapper');

        // if no parent then not sure where we are TODO - clean this up
        if (!parent) return;

        const id = 'ppc-styles-editor';
        const existing = parent?.querySelector(`#${id}`);
        if (existing) {
            existing.innerHTML = compiled;
            return;
        }
        const style = frame
            ? frame.document.createElement('style')
            : document.createElement('style');
        style.id = id;
        style.innerHTML = compiled;
        frame
            ? frame.document.head.appendChild(style)
            : parent.appendChild(style);
    }, [compiled, ready]);

    useEffect(() => {
        if (!ready) return;
        editPost({
            meta: {
                ppc_additional_css: css,
            },
        });
    }, [css, editPost, ready]);

    useEffect(() => {
        if (!ready) return;
        editPost({
            meta: {
                ppc_additional_css_compiled: compiled,
            },
        });
    }, [compiled, editPost, ready]);

    return (
        <PluginDocumentSettingPanel
            name="per-page-css"
            title="Additional CSS"
            className="per-page-css-editor">
            {/* TODO: Snippet manager inside block and more menu item slot area */}
            {hasPermission ? (
                <CodeEditor
                    value={css}
                    onChange={handleChange}
                    lineOptions={warnings.map(({ loc }) => ({
                        line: loc.line,
                        classes: ['line-error'],
                    }))}
                />
            ) : (
                <CodePreview value={css} />
            )}
        </PluginDocumentSettingPanel>
    );
};
