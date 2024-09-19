import {
	InspectorAdvancedControls,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	BaseControl,
	TextControl,
	Button,
} from '@wordpress/components';
import {
	useLayoutEffect,
	useEffect,
	useState,
	useCallback,
	useRef,
} from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';
import { Warning as CssWarning, Rule } from 'lightningcss-wasm';
import { CodeEditor } from './CodeEditor';
import { focusAtEndOfLine2 } from '../lib/dom';
import { EditorControls } from './EditorControls';
import { store as coreStore } from '@wordpress/editor';
import { addToClassList } from '../lib/classes';

export const BlockControl = (
	// eslint-disable-next-line
	CurrentMenuItems: any,
	// eslint-disable-next-line
	props: any,
) => {
	const editorWrapperRef = useRef<HTMLDivElement>(null);
	const [focused, setFocused] = useState(false);
	const [warnings, setWarnings] = useState<CssWarning[]>([]);
	const isSaving = useSelect((select) => {
		// eslint-disable-next-line
		// @ts-ignore-next-line
		const { isSavingPost, isAutosavingPost } = select(coreStore);
		return isSavingPost() || isAutosavingPost();
	}, []);
	const { attributes, setAttributes, clientId: blockId } = props;
	const {
		pcssClassId,
		pcssAdditionalCss: initialCss,
		pcssAdditionalCssCompiled: compiledCss,
		className: existingClasses,
	} = attributes;

	const [css, setCss] = useState(initialCss);
	const [transformed, setTransformed] = useState<Uint8Array>();
	const [compiled, setCompiled] = useState(compiledCss || '');
	const defaultCssExample = '[block] {\n  \n}';

	const handleChange = useCallback(
		(css?: string) => {
			if (css === undefined) {
				setCss(undefined);
				return;
			}
			setWarnings([]);
			setCss(css);

			if (!window.patternCss?.transform) return;

			const transformed = window.patternCss.transform({
				filename: 'raw.css',
				code: new TextEncoder().encode(css),
				minify: true,
				errorRecovery: true,
				visitor: {
					StyleSheetExit: (stylesheet) => {
						// Filter out the globals
						const ignored = [
							'import',
							'supports',
							'page',
							'font-face',
							'keyframes',
							'counter-style',
						];
						stylesheet.rules = stylesheet.rules.filter(
							(rule: Rule) => !ignored.includes(rule.type),
						);
						return stylesheet;
					},
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
		if (!initialCss) return;
		handleChange(initialCss);
	}, [handleChange, initialCss]);

	useEffect(() => {
		if (transformed === undefined) return;
		setCompiled(new TextDecoder().decode(transformed));
	}, [transformed]);

	useEffect(() => {
		if (css === undefined) return;
		setAttributes({
			pcssAdditionalCss: css,
			pcssClassId: pcssClassId || `pcss-${blockId?.split('-')[0]}`,
		});
		// If they are editing and our class isnt in the list then add it
		const existing = existingClasses?.split(' ') || [];
		if (existing?.includes(pcssClassId)) return;
		setAttributes({ className: addToClassList(existing, pcssClassId) });
	}, [css, setAttributes, pcssClassId, blockId, existingClasses]);

	// Do a check for the id if they are saving the post
	// TODO: this isn't perfect so check back for pre-save hook
	useEffect(() => {
		if (!pcssClassId || !isSaving) return;
		const existing = existingClasses?.split(' ') || [];
		if (existing?.find((c: string) => c.startsWith(pcssClassId))) return;
		const className = addToClassList(existing, pcssClassId);
		setAttributes({ className });
	}, [isSaving, existingClasses, pcssClassId, setAttributes]);

	useEffect(() => {
		if (compiled === compiledCss) return;
		setAttributes({ pcssAdditionalCssCompiled: compiled });
	}, [compiled, setAttributes, compiledCss]);

	useLayoutEffect(() => {
		if (compiled === undefined) return;
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
		if (frame?.document?.head) {
			frame.document.head.appendChild(style);
		} else {
			parent.appendChild(style);
		}
	}, [compiled, pcssClassId]);

	return (
		<>
			{CurrentMenuItems && <CurrentMenuItems {...props} />}
			<InspectorControls>
				<PanelBody
					title="Pattern CSS"
					initialOpen={false}
					className="pattern-css-editor">
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
				</PanelBody>
			</InspectorControls>
			<InspectorAdvancedControls>
				<BaseControl
					id="pcss-css-id-setting"
					className="pattern-css-editor">
					<TextControl
						spellCheck={false}
						autoComplete="off"
						data-cy="class-id"
						type="text"
						label={__('Pattern CSS ID', 'pattern-css')}
						disabled
						onChange={() => undefined}
						value={pcssClassId}
					/>
					<Button
						variant="secondary"
						className="-mt-2"
						onClick={() => {
							const pcssClassId = `pcss-${Math.random()
								.toString(36)
								.substring(2, 10)}`;
							const existing = existingClasses?.split(' ') || [];
							const className = [
								...new Set(
									[
										// Remove any existing pcss- classes
										...existing.filter(
											(c: string) =>
												!c.startsWith('pcss-'),
										),
										pcssClassId,
									].filter(Boolean),
								),
							].join(' ');
							setAttributes({ pcssClassId, className });
						}}>
						{__('Generate New ID', 'pattern-css')}
					</Button>
					<p className="text-md text-gray-600 mt-2">
						{__(
							"If there's a styling conflict with another block you can generate a new ID.",
							'pattern-css',
						)}
					</p>
				</BaseControl>
			</InspectorAdvancedControls>
		</>
	);
};
