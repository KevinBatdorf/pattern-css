import {
	store as blockEditorStore,
	InspectorAdvancedControls,
	InspectorControls,
	// @ts-expect-error -- outdated types
	useStyleOverride,
} from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	Notice,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/editor';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { cleanForSlug } from '@wordpress/url';
import type { Warning as CssWarning } from 'lightningcss-wasm';
import { addToClassList } from '../lib/classes';
import { focusAtEndOfLine2 } from '../lib/dom';
import { escapeCSS } from '../lib/formatting';
import { useGlobalEditorStore } from '../state/global-editor';
import { usePopoutStore } from '../state/popout';
import { CodeEditor } from './CodeEditor';
import { EditorControls } from './EditorControls';
import { PopoutEditor } from './PopoutEditor';

export interface BlockControlProps {
	attributes: Record<string, unknown>;
	setAttributes: (attrs: Record<string, unknown>) => void;
	clientId: string;
}

export const BlockControl = (
	CurrentMenuItems: unknown,
	props: BlockControlProps,
) => {
	const editorWrapperRef = useRef<HTMLDivElement>(null);
	const [warnings, setWarnings] = useState<CssWarning[]>([]);
	const isSaving = useSelect((select) => {
		const { isSavingPost, isAutosavingPost } = select(coreStore);
		return isSavingPost() || isAutosavingPost();
	}, []);
	const { open: popoutOpen, setOpen: setPopoutOpen } = usePopoutStore();
	const { open: globalEditorOpen, setOpen: setglobalEditorOpen } =
		useGlobalEditorStore();
	const { attributes, setAttributes, clientId: blockId } = props;
	const pcssClassId = attributes.pcssClassId as string | undefined;
	const initialCss = attributes.pcssAdditionalCss as string | undefined;
	const compiledCss = attributes.pcssAdditionalCssCompiled as
		| string
		| undefined;
	const existingClasses = attributes.className as string | undefined;

	const isDuplicateId = useSelect(
		(select) => {
			if (!pcssClassId) return false;
			const { getClientIdsWithDescendants, getBlockAttributes } =
				select(blockEditorStore);
			return getClientIdsWithDescendants().some(
				(id: string) =>
					id !== blockId &&
					getBlockAttributes(id)?.pcssClassId === pcssClassId,
			);
		},
		[pcssClassId, blockId],
	);

	const generateNewId = useCallback(() => {
		const newId = `pcss-${Math.random().toString(36).substring(2, 10)}`;
		const existing = existingClasses?.split(' ') || [];
		const className = [
			...new Set(
				[
					...existing.filter((c: string) => c !== pcssClassId && !c.startsWith('pcss-')),
					newId,
				].filter(Boolean),
			),
		].join(' ');
		setAttributes({ pcssClassId: newId, className });
		setManualClassId(newId);
	}, [existingClasses, setAttributes]);

	const [manualClassId, setManualClassId] = useState(pcssClassId ?? '');
	const [css, setCss] = useState(initialCss);
	const [transformed, setTransformed] = useState<Uint8Array>();
	const [compiled, setCompiled] = useState(compiledCss || '');
	useStyleOverride({ id: `pcss-styles-block-${blockId}`, css: compiled });
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
					// Drop global at-rules that shouldn't be scoped to a block
					Rule: {
						import() {
							return [];
						},
						'font-face'() {
							return [];
						},
						keyframes() {
							return [];
						},
						page() {
							return [];
						},
						'counter-style'() {
							return [];
						},
						'view-transition'() {
							return [];
						},
						namespace() {
							return [];
						},
					},
					// @ts-expect-error -- lightningcss visitor return types are overly strict
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
		if (!pcssClassId || existing?.includes(pcssClassId)) return;
		setAttributes({ className: addToClassList(existing, pcssClassId) });
	}, [css, setAttributes, pcssClassId, blockId, existingClasses]);

	// Do a check for the id if they are saving the post
	// TODO: this isn't perfect so check back for pre-save hook
	useEffect(() => {
		if (!pcssClassId || !isSaving) return;
		const existing = existingClasses?.split(' ') ?? [];
		if (existing.find((c: string) => c.startsWith(pcssClassId))) return;
		const className = addToClassList(existing, pcssClassId);
		setAttributes({ className });
	}, [isSaving, existingClasses, pcssClassId, setAttributes]);

	useEffect(() => {
		if (compiled === compiledCss) return;
		setAttributes({ pcssAdditionalCssCompiled: compiled });
	}, [compiled, setAttributes, compiledCss]);

	const MenuItems =
		CurrentMenuItems as React.ComponentType<BlockControlProps>;
	return (
		<>
			{MenuItems && <MenuItems {...props} />}
			<InspectorControls>
				<PanelBody
					title="Pattern CSS"
					initialOpen={false}
					className="pattern-css-editor"
				>
					{isDuplicateId && (
						<Notice
							status="warning"
							isDismissible={false}
							className="mb-4"
						>
							<p style={{ margin: '0 0 8px' }}>
								{sprintf(
									__(
										'Another block on this page is using the same ID (%s). Styles may conflict or be duplicated on the frontend.',
										'pattern-css',
									),
									pcssClassId ?? '',
								)}
							</p>
							<Button
								variant="secondary"
								size="small"
								onClick={generateNewId}
							>
								{__('Generate New ID', 'pattern-css')}
							</Button>
						</Notice>
					)}
					<PopoutEditor>
						<div
							className="overfow-x-hidden relative flex-grow overflow-y-auto border border-solid border-gray-600"
							ref={editorWrapperRef}
						>
							<CodeEditor
								value={css ?? defaultCssExample}
								data-cy="pcss-editor-block"
								onChange={handleChange}
								onFocus={(e: unknown) => {
									const event =
										e as React.FocusEvent<HTMLTextAreaElement>;
									if (
										event.target.value === defaultCssExample
									) {
										focusAtEndOfLine2(event.target);
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
					className="pattern-css-editor"
				>
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
						disabled={!window.patternCss?.allowManualOverride}
						onChange={(value: string) => {
							setManualClassId(value);
						}}
						value={manualClassId}
					/>
					<div className="-mt-2 flex gap-2">
						{window.patternCss?.allowManualOverride && manualClassId !== pcssClassId && (
							<Button
								variant="primary"
								size="small"
								onClick={() => {
									const slug = cleanForSlug(manualClassId);
									setManualClassId(slug);
									const existing = existingClasses?.split(' ') || [];
									const className = [
										...new Set(
											[
												...existing.filter((c: string) => c !== pcssClassId),
												slug,
											].filter(Boolean),
										),
									].join(' ');
									setAttributes({ pcssClassId: slug, className });
								}}
							>
								{__('Apply', 'pattern-css')}
							</Button>
						)}
						<Button
							variant="secondary"
							size="small"
							onClick={generateNewId}
						>
							{__('Generate New ID', 'pattern-css')}
						</Button>
					</div>
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
