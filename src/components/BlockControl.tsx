import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
    useLayoutEffect,
    useEffect,
    useState,
    useMemo,
    useCallback,
} from '@wordpress/element';
import { escapeHTML } from '@wordpress/escape-html';
import { sprintf, __ } from '@wordpress/i18n';
import init, { transform, Warning as CssWarning } from 'lightningcss-wasm';
import { CodeEditor } from './CodeEditor';
import { CodePreview } from './CodePreview';

export const BlockControl = (
    // eslint-disable-next-line
    CurrentMenuItems: any,
    // eslint-disable-next-line
    props: any,
) => {
    const [ready, setReady] = useState(false);
    const [warnings, setWarnings] = useState<CssWarning[]>([]);
    // eslint-disable-next-line
    const { attributes, setAttributes, clientId } = props;
    // eslint-disable-next-line
    const initialCss = attributes?.ppcAdditionalCss;
    // eslint-disable-next-line
    const compiledCss = attributes?.ppcAdditionalCssCompiled;
    // eslint-disable-next-line
    const existingClassNames = attributes?.className?.split(' ');
    const ppcClassId =
        // eslint-disable-next-line
        attributes?.ppcClassId || `ppc-${clientId?.split('-')[0]}`;

    const [css, setCss] = useState(initialCss || '');
    const [transformed, setTransformed] = useState<Uint8Array>();
    const [compiled, setCompiled] = useState(compiledCss || '');
    const hasPermission = useMemo(() => window?.perPageCss?.canEditCss, []);

    const handleChange = useCallback(
        (value: string) => {
            const css = escapeHTML(value);
            setWarnings([]);
            setCss(css);

            const transformed = transform({
                filename: 'raw.css',
                code: new TextEncoder().encode(css),
                minify: true,
                errorRecovery: true,
                visitor: {
                    Selector(selector) {
                        // If the selector is [block] then just swap it with ppcClassId
                        if (
                            selector[0]?.type === 'attribute' &&
                            selector[0]?.name === 'block'
                        ) {
                            return [
                                {
                                    type: 'class',
                                    // eslint-disable-next-line
                                    name: ppcClassId,
                                },
                                ...selector.slice(1),
                            ];
                        }
                        // prepend id to selector
                        return [
                            {
                                type: 'class',
                                // eslint-disable-next-line
                                name: ppcClassId,
                            },
                            { type: 'combinator', value: 'descendant' },
                            ...selector,
                        ];
                    },
                },
            });
            if (transformed.warnings.length > 0) {
                setWarnings(transformed.warnings);
                return;
            }
            setTransformed(transformed.code);
        },
        [ppcClassId],
    );

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

    useEffect(() => {
        if (!ready) return;
        setAttributes({
            ppcAdditionalCss: css,
            ppcClassId,
            className: [
                ...new Set([...(existingClassNames ?? []), ppcClassId]),
            ].join(' '),
        });
    }, [css, setAttributes, ready, ppcClassId, existingClassNames]);

    useEffect(() => {
        if (!ready) return;
        if (compiled === compiledCss) return;
        setAttributes({ ppcAdditionalCssCompiled: compiled });
        // This will trigger to save all the custom styles to the database
        window.dispatchEvent(
            new CustomEvent('kevinbatdorf::ppc-editing-block'),
        );
    }, [compiled, setAttributes, ready, compiledCss]);

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

        // TODO: can I abstract this more since it's simliar to per-page?
        // eslint-disable-next-line
        const id = `ppc-styles-block-${ppcClassId}`;
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
    }, [compiled, ready, ppcClassId]);

    return (
        <>
            {CurrentMenuItems && <CurrentMenuItems {...props} />}
            <InspectorControls>
                <PanelBody
                    title="Additional CSS"
                    initialOpen={false}
                    // icon={boltIcon}
                    className="per-page-css-editor">
                    {/* TODO: Snippet manager inside block and more menu item slot area */}
                    {hasPermission ? (
                        <>
                            <p className="m-0 my-2 text-gray-700 text-xs">
                                {sprintf(
                                    __(
                                        'This CSS will be scoped to this block only. Use %s (without quotes) to target the block itself.',
                                        'per-page-css',
                                    ),
                                    '`[block]`',
                                )}
                            </p>
                            <CodeEditor
                                value={css}
                                data-cy="ppc-editor-block"
                                onChange={handleChange}
                                lineOptions={warnings.map(({ loc }) => ({
                                    line: loc.line,
                                    classes: ['line-error'],
                                }))}
                            />
                        </>
                    ) : (
                        <CodePreview value={css} />
                    )}
                </PanelBody>
            </InspectorControls>
        </>
    );
};
