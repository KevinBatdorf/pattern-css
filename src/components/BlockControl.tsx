import {
	InspectorAdvancedControls,
	InspectorControls,
} from '@wordpress/block-editor';
import { useStyleOverride } from '@wordpress/block-editor';
import {
	PanelBody,
	BaseControl,
	TextControl,
	Button,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/editor';
import { useEffect, useState, useCallback, useRef } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { Warning as CssWarning, Rule } from 'lightningcss-wasm';
import { addToClassList } from '../lib/classes';
import { focusAtEndOfLine2 } from '../lib/dom';
import { escapeCSS } from '../lib/formatting';
import { useGlobalEditorStore } from '../state/global-editor';
import { usePopoutStore } from '../state/popout';
import { CodeEditor } from './CodeEditor';
import { EditorControls } from './EditorControls';
import { PopoutEditor } from './PopoutEditor';

export const BlockControl = (
	// eslint-disable-next-line
	CurrentMenuItems: any,
	// eslint-disable-next-line
	props: any,
) => {
	const editorWrapperRef = useRef<HTMLDivElement>(null);
	const [warnings, setWarnings] = useState<CssWarning[]>([]);
	const isSaving = useSelect((select) => {
		// eslint-disable-next-line
		// @ts-ignore-next-line
		const { isSavingPost, isAutosavingPost } = select(coreStore);
		return isSavingPost() || isAutosavingPost();
	}, []);
	const { open: popoutOpen, setOpen: setPopoutOpen } = usePopoutStore();
	const { open: globalEditorOpen, setOpen: setglobalEditorOpen } =
		useGlobalEditorStore();
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
	useStyleOverride({ id: `pcss-styles-block-${pcssClassId}`, css: compiled });
	const defaultCssExample = '[block] {\n  \n}';

	const handleChange = useCallback(
		(css?: string) => {
			if (css === undefined) {
				setCss(undefined);
				return;
			}
			setWarnings([]);
			setCss(escapeCSS(css));

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
							'page',
							'font-face',
							'keyframes',
							'counter-style',
							'view-transition',
							'charset',
							'namespace',
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

	return (
		<>
			{CurrentMenuItems && <CurrentMenuItems {...props} />}
			<InspectorControls>
				<PanelBody
					title="Pattern CSS"
					initialOpen={false}
					className="pattern-css-editor">
					<PopoutEditor>
						<>
							<div
								className="overfow-x-hidden relative flex-grow overflow-y-auto border border-solid border-gray-600"
								ref={editorWrapperRef}>
								<CodeEditor
									value={css ?? defaultCssExample}
									data-cy="pcss-editor-block"
									onChange={handleChange}
									onFocus={(e) => {
										const v = e.target.value;
										if (v === defaultCssExample) {
											focusAtEndOfLine2(e.target);
										}
									}}
									lineOptions={warnings.map(({ loc }) => ({
										line: loc.line,
										classes: ['line-error'],
									}))}
								/>
							</div>
							<div>
								<EditorControls
									handleChange={handleChange}
									popoutOpen={popoutOpen}
									setPopoutOpen={setPopoutOpen}
									globalEditorOpen={globalEditorOpen}
									setGlobalEditorOpen={setglobalEditorOpen}
									editorWrapperRef={editorWrapperRef}
								/>
							</div>
						</>
					</PopoutEditor>
					<p
						className="m-0 my-2 text-xs text-gray-700"
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
						// translators: %s = Pattern CSS and ID is an identifier
						label={sprintf(
							__('%s ID', 'pattern-css'),
							'Pattern CSS',
						)}
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
					<p className="text-md mt-2 text-gray-600">
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
