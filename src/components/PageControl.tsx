import { store as coreStore } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line - TODO
import { store as editorStore } from '@wordpress/editor';
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { escapeHTML } from '@wordpress/escape-html';
import browserslist from 'browserslist';
import init, { transform, Warning as CssWarning } from 'lightningcss-wasm';
import { mainIcon } from '../icons';
import { CodeEditor } from './CodeEditor';
import { CodePreview } from './CodePreview';

export const PluginDocumentSettingPanelDemo = () => {
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

    const handleChange = useCallback(
        (value: string) => {
            if (!ready || !hasPermission) return;
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
        },
        [ready, hasPermission],
    );

    useEffect(() => {
        init().then(() => setReady(true));
    }, []);

    useEffect(() => {
        if (!ready || !hasPermission || !initialCss) return;
        handleChange(initialCss);
    }, [ready, hasPermission, handleChange, initialCss]);

    useEffect(() => {
        if (!ready || !hasPermission) return;
        if (transformed === undefined) return;
        setCompiled(new TextDecoder().decode(transformed));
    }, [transformed, hasPermission, ready]);

    useEffect(() => {
        if (!ready || !hasPermission) return;
        if (compiled === undefined) return;

        // Append css to iframe
        const frame = (
            document.querySelector(
                'iframe[name="editor-canvas"]',
            ) as HTMLIFrameElement
        )?.contentWindow as Window;
        if (!frame) return;
        const existing = frame.document.getElementById('ppc-styles-editor');
        if (existing) {
            existing.innerHTML = compiled;
            return;
        }
        const style = frame.document.createElement('style');
        style.id = 'ppc-styles-editor';
        style.innerHTML = compiled;
        frame.document.head.appendChild(style);
    }, [compiled, hasPermission, ready]);

    useEffect(() => {
        if (!ready || !hasPermission) return;
        editPost({
            meta: {
                ppc_additional_css: css,
            },
        });
    }, [css, editPost, hasPermission, ready]);

    useEffect(() => {
        if (!ready || !hasPermission) return;
        editPost({
            meta: {
                ppc_additional_css_compiled: compiled,
            },
        });
    }, [compiled, editPost, hasPermission, ready]);

    return (
        <PluginDocumentSettingPanel
            name="per-page-css"
            title="Per Page CSS"
            icon={mainIcon}
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
