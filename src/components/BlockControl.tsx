import {
    InspectorAdvancedControls,
    InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, BaseControl, TextControl } from '@wordpress/components';
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
    // TODO
    /* eslint-disable react/prop-types */
    const { attributes, setAttributes, clientId } = props;
    const {
        pcssClassId,
        pcssAdditionalCss: initialCss,
        pcssAdditionalCssCompiled: compiledCss,
    } = attributes;
    /* eslint-enable react/prop-types */

    const [css, setCss] = useState(initialCss);
    const [transformed, setTransformed] = useState<Uint8Array>();
    const [compiled, setCompiled] = useState(compiledCss || '');
    const hasPermission = useMemo(() => window?.patternCss?.canEditCss, []);

    const stringOne = __('Examples', 'pattern-css');

    /* translators: "An example of css that will focus on the block itself" */
    const stringTwo = __('Target the block', 'pattern-css');

    /* translators: "An example of css that will select items inside the block" */
    const stringThree = __('Inside the block', 'pattern-css');
    const defaultCssExample = sprintf(
        '/* %1$s */\n\n/* %2$s */\n[block] {\n  color: gray;\n}\n\n/* %3$s */\np {\n  color: blue;\n}',
        stringOne,
        stringTwo,
        stringThree,
    );

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
                        // If the selector is [block] then just swap it with pcssClassId
                        if (
                            selector[0]?.type === 'attribute' &&
                            selector[0]?.name === 'block'
                        ) {
                            return [
                                {
                                    type: 'class',
                                    // eslint-disable-next-line
                                    name: pcssClassId,
                                },
                                ...selector.slice(1),
                            ];
                        }
                        // prepend id to selector
                        return [
                            {
                                type: 'class',
                                // eslint-disable-next-line
                                name: pcssClassId,
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
        [pcssClassId],
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
            pcssAdditionalCss: css,
            // eslint-disable-next-line react/prop-types
            pcssClassId: pcssClassId || `pcss-${clientId?.split('-')[0]}`,
        });
    }, [css, setAttributes, ready, pcssClassId, clientId]);

    useEffect(() => {
        if (!ready) return;
        if (compiled === compiledCss) return;
        setAttributes({ pcssAdditionalCssCompiled: compiled });
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

        const id = `pcss-styles-block-${pcssClassId}`;
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
    }, [compiled, ready, pcssClassId]);

    return (
        <>
            {CurrentMenuItems && <CurrentMenuItems {...props} />}
            <InspectorControls>
                <PanelBody
                    title="Additional CSS"
                    initialOpen={false}
                    className="pattern-css-editor">
                    {hasPermission ? (
                        <>
                            <CodeEditor
                                value={css ?? defaultCssExample}
                                data-cy="pcss-editor-block"
                                onChange={handleChange}
                                lineOptions={warnings.map(({ loc }) => ({
                                    line: loc.line,
                                    classes: ['line-error'],
                                }))}
                            />
                            <p className="m-0 my-2 text-gray-700 text-xs">
                                {sprintf(
                                    __(
                                        'Styles will be scoped to this block only.',
                                        'pattern-css',
                                    ),
                                    '`[block]`',
                                )}
                            </p>
                        </>
                    ) : (
                        <CodePreview value={css} />
                    )}
                </PanelBody>
            </InspectorControls>
            <InspectorAdvancedControls>
                <BaseControl id="pcss-css-id-setting">
                    <TextControl
                        spellCheck={false}
                        autoComplete="off"
                        data-cy="class-id"
                        type="string"
                        label={__(
                            'Scoped CSS Selector (Pattern CSS)',
                            'pattern-css',
                        )}
                        help={__(
                            "Edit this if you duplicated a block, or have a conflict with another block's CSS styles.",
                            'pattern-css',
                        )}
                        placeholder={'0'}
                        onChange={(pcssClassId: string) => {
                            setAttributes({ pcssClassId });
                        }}
                        value={pcssClassId}
                    />
                </BaseControl>
            </InspectorAdvancedControls>
        </>
    );
};
