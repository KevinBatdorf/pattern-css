import { addFilter } from '@wordpress/hooks';
import { BlockControl } from './components/BlockControl';
import './editor.css';
import init, { transform } from 'lightningcss-wasm';

init().then(() => {
	// Add to global scope so it's not loaded multiple times
	window.patternCss.transform = transform;
});

// Both are unexpected objects with any properties types
// eslint-disable-next-line
const addSaveProps = (props: any, _blockType: null, attributes: any) => {
	const classes = new Set(
		[props.className?.split(' '), attributes.className?.split(' ')]
			.flat()
			.filter(Boolean),
	);
	const { pcssClassId } = attributes;

	if (!pcssClassId || classes.has(pcssClassId)) return props;
	classes.add(pcssClassId);
	return {
		...props,
		className: [...classes].join(' '),
	};
};

const blockAttributes = {
	pcssAdditionalCss: { type: 'string' },
	pcssAdditionalCssCompiled: { type: 'string', default: '' },
	pcssClassId: { type: 'string', default: '' },
};

addFilter(
	'blocks.registerBlockType',
	'kevinbatdorf/pcss-block-settings',
	(settings) => {
		// This pattern is found in the Gutenberg source code
		const existingGetEditWrapperProps = settings.getEditWrapperProps;
		// eslint-disable-next-line
		settings.getEditWrapperProps = (attributes: { [key: string]: any }) => {
			const props = existingGetEditWrapperProps?.(attributes) ?? {};
			return addSaveProps(props, null, attributes);
		};
		return {
			...settings,
			attributes: { ...(settings?.attributes ?? {}), ...blockAttributes },
		};
	},
);
addFilter(
	'editor.BlockEdit',
	'kevinbatdorf/pcss-block-control',
	(CurrentMenuItems) =>
		// Not sure how to type these incoming props
		// eslint-disable-next-line
		(props: any) =>
			BlockControl(CurrentMenuItems, props),
	// Force it at the very bottom
	Number.MAX_SAFE_INTEGER,
);
addFilter(
	'blocks.getSaveContent.extraProps',
	'kevinbatdorf/pcss-add-save-props',
	addSaveProps,
);
