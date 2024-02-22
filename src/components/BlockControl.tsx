import {
	InspectorAdvancedControls,
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody, BaseControl, TextControl } from '@wordpress/components';
import {
	useLayoutEffect,
	useEffect,
	useState,
	useMemo,
	useCallback,
	useRef,
} from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { escapeHTML } from '@wordpress/escape-html';
import { sprintf, __ } from '@wordpress/i18n';
import { Warning as CssWarning } from 'lightningcss-wasm';
import { CodeEditor } from './CodeEditor';
import { CodePreview } from './CodePreview';
import { focusAtEndOfLine2 } from '../lib/dom';
import { EditorControls } from './EditorControls';

const unsupportedBlocks = ['core/site-logo'];

export const BlockControl = (
	// eslint-disable-next-line
	CurrentMenuItems: any,
	// eslint-disable-next-line
	props: any,
) => {
	const editorWrapperRef = useRef<HTMLDivElement>(null);
	const [ready, setReady] = useState(false);
	const [focused, setFocused] = useState(false);
	const [warnings, setWarnings] = useState<CssWarning[]>([]);
	// TODO
	/* eslint-disable react/prop-types */
	const { attributes, setAttributes, clientId: blockId } = props;
	const {
		pcssClassId,
		pcssAdditionalCss: initialCss,
		pcssAdditionalCssCompiled: compiledCss,
	} = attributes;
	/* eslint-enable react/prop-types */

	// eslint-disable-next-line
	// @ts-ignore-next-line - it exists?
	const { getBlockName } = useSelect(
		(select) => select(blockEditorStore),
		[],
	);

	const [css, setCss] = useState(initialCss);
	const [transformed, setTransformed] = useState<Uint8Array>();
	const [compiled, setCompiled] = useState(compiledCss || '');
	const hasPermission = useMemo(() => window?.patternCss?.canEditCss, []);
	const defaultCssExample = '[block] {\n  \n}';

	const handleChange = useCallback(
		(value?: string) => {
			if (value === undefined) {
				setCss(undefined);
				return;
			}
			const css = escapeHTML(value);
			setWarnings([]);
			setCss(css);

			if (!window.patternCss?.transform) return;

			const transformed = window.patternCss.transform({
				filename: 'raw.css',
				code: new TextEncoder().encode(css),
				minify: true,
				errorRecovery: true,
				visitor: {
					Selector(selector) {
						const { name, type } = selector[0] as {
							// cast as we only deal with cases where names exist
							name?: string;
							type: string;
						};
						const { name: overrideName, type: overrideType } =
							window.patternCss.selectorOverride || {};
						// If the selector is [block] or custom then just swap it with pcssClassId
						if (
							(type === 'attribute' && name === 'block') ||
							(type === overrideType && name === overrideName)
						) {
							return [
								{
									...selector[0],
									type: 'class',
									// eslint-disable-next-line
									name: pcssClassId,
								},
								...selector.slice(1),
							];
						}
						// If we are nested we don't want to prepend the id
						if (selector[0].type === 'nesting') return selector;
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
		setReady(true);
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
		if (!ready || css === undefined) return;
		setAttributes({
			pcssAdditionalCss: css,
			// eslint-disable-next-line react/prop-types
			pcssClassId: pcssClassId || `pcss-${blockId?.split('-')[0]}`,
		});
	}, [css, setAttributes, ready, pcssClassId, blockId]);

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
			? frame?.document
			: document.querySelector('.editor-styles-wrapper');

		// if no parent then not sure where we are TODO - clean this up
		if (!parent) return;

		const id = `pcss-styles-block-${pcssClassId}`;
		const existing = parent?.querySelector(`#${id}`);
		if (existing) {
			existing.innerHTML = compiled;
			return;
		}
		const style = frame?.document
			? frame.document.createElement('style')
			: document.createElement('style');
		style.id = id;
		style.innerHTML = compiled;
		frame?.document?.head
			? frame.document.head.appendChild(style)
			: parent.appendChild(style);
	}, [compiled, ready, pcssClassId]);

	if (unsupportedBlocks.includes(getBlockName(blockId))) {
		return (
			<>
				<CurrentMenuItems {...props} />
				<InspectorControls>
					<PanelBody
						title="Additional CSS"
						initialOpen={false}
						className="pattern-css-editor">
						<p className="p-3 text-gray-900 bg-gray-150 my-2">
							{sprintf(
								__(
									'The `%s` block is not yet supported by Pattern CSS. You can wrap it in a `core/group` block and add CSS there.',
									'pattern-css',
								),
								getBlockName(blockId),
							)}
						</p>
					</PanelBody>
				</InspectorControls>
			</>
		);
	}

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
							<div className="relative" ref={editorWrapperRef}>
								<CodeEditor
									value={css ?? defaultCssExample}
									data-cy="pcss-editor-block"
									onChange={handleChange}
									onFocus={(e) => {
										const v = e.target.value;
										if (v === defaultCssExample) {
											focusAtEndOfLine2(e.target);
										}
										setFocused(true);
									}}
									onBlur={() => setFocused(false)}
									lineOptions={warnings.map(({ loc }) => ({
										line: loc.line,
										classes: ['line-error'],
									}))}
								/>
								{focused ? null : (
									<EditorControls
										handleChange={handleChange}
										editorWrapperRef={editorWrapperRef}
									/>
								)}
							</div>
							<p
								className="m-0 my-2 text-gray-700 text-xs"
								dangerouslySetInnerHTML={{
									__html: sprintf(
										// translators: %1$s = opening <a> tag, %2$s = closing </a> tag.
										__(
											'See the %1$splugin readme%2$s for examples.',
											'pattern-css',
										),
										'<a href="https://wordpress.org/plugins/pattern-css#opens-in-a-new-tab" target="_blank" rel="noreferrer noopener" class="text-wp-theme-500">',
										'</a>',
									),
								}}
							/>
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
						type="text"
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
