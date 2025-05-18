import apiFetch from '@wordpress/api-fetch';
import { useStyleOverride } from '@wordpress/block-editor';
import { BaseControl, CheckboxControl } from '@wordpress/components';
import { PluginMoreMenuItem } from '@wordpress/editor';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Warning as CssWarning } from 'lightningcss-wasm';
import { useDraggable } from '../hooks/useDraggable';
import { usePortal } from '../hooks/usePortal';
import { useResizable } from '../hooks/useResizable';
import { escapeCSS } from '../lib/formatting';
import { useGlobalEditorStore } from '../state/global-editor';
import { CodeEditor } from './CodeEditor';
import { FloatingWindow } from './FloatingWindow';

export const GlobalEditor = () => {
	const mountNode = usePortal('pcss-popout-global-mount');
	const ref = useRef<HTMLDivElement>(null);
	const [compiled, setCompiled] = useState(
		window.patternCss?.globalCssCompiled || '',
	);

	useStyleOverride({ id: 'pcss-styles-global', css: compiled });
	const {
		open,
		transparent,
		x: top,
		y: left,
		width,
		height,
		setOpen,
		setSize,
		setTransparent,
		setPosition,
	} = useGlobalEditorStore();
	useDraggable({
		ref,
		open,
		initialPosition: { x: top, y: left },
		onDragEnd: (x: number, y: number) => {
			setPosition(x, y);
		},
	});
	useResizable({
		ref,
		open,
		initialSize: { width, height },
		onResizeEnd: (width: number, height: number) => {
			setSize(width, height);
		},
	});

	const ready = mountNode && open;
	return (
		<>
			<PluginMoreMenuItem
				data-cy="global-css-editor-btn"
				icon="tool"
				onClick={() => setOpen(true)}>
				{__('Add Global CSS (Pattern CSS)', 'pattern-css')}
			</PluginMoreMenuItem>
			{ready ? (
				<FloatingWindow
					// translators: This is for the global editor (not per block). %s is the plugin name.
					label={sprintf(
						__('%s (Global)', 'pattern-css'),
						'Pattern CSS',
					)}
					transparent={transparent}
					top={top}
					left={left}
					width={width}
					height={height}
					setOpen={setOpen}
					mountNode={mountNode}
					ref={ref}>
					<TheEditor
						initialCss={window.patternCss?.globalCss || ''}
						compiledCss={compiled}
						setCompiled={setCompiled}
					/>
					<CheckboxControl
						label={__('Transparent background', 'pattern-css')}
						className="disable-mb-checkbox mt-2"
						checked={transparent}
						onChange={(transparent) => {
							setTransparent(transparent);
						}}
					/>
				</FloatingWindow>
			) : null}
		</>
	);
};

const TheEditor = ({
	initialCss,
	compiledCss,
	setCompiled,
}: {
	initialCss: string;
	compiledCss: string;
	setCompiled: (compiled: string) => void;
}) => {
	const editorWrapperRef = useRef<HTMLDivElement>(null);
	const [warnings, setWarnings] = useState<CssWarning[]>([]);

	const [css, setCss] = useState(initialCss);
	const [transformed, setTransformed] = useState<Uint8Array>();

	const handleChange = useCallback((css: string) => {
		setWarnings([]);
		setCss(escapeCSS(css));

		if (!window.patternCss?.transform) return;

		const transformed = window.patternCss.transform({
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
		if (!initialCss) return;
		handleChange(initialCss);
	}, [handleChange, initialCss]);

	useEffect(() => {
		if (transformed === undefined) return;
		setCompiled(new TextDecoder().decode(transformed));
	}, [transformed, setCompiled]);

	useEffect(() => {
		window.patternCss.globalCss = css;
		window.patternCss.globalCssCompiled = compiledCss;
		const id = setTimeout(() => {
			apiFetch({
				path: '/pattern-css/v1/global-css',
				method: 'POST',
				data: {
					global_css: css,
					// Only save the compiled CSS if it's different (it compiled)
					global_css_compiled: compiledCss,
				},
			});
		}, 1000);
		return () => clearTimeout(id);
	}, [compiledCss, css]);

	return (
		<div className="relative flex-grow" ref={editorWrapperRef}>
			<CodeEditor
				value={css}
				onChange={handleChange}
				lineOptions={warnings.map(({ loc }) => ({
					line: loc.line,
					classes: ['line-error'],
				}))}
			/>
		</div>
	);
};
