import apiFetch from '@wordpress/api-fetch';
import { addFilter } from '@wordpress/hooks';
import { registerPlugin } from '@wordpress/plugins';
import init, { transform } from 'lightningcss-wasm';
import {
	BlockControl,
	type BlockControlProps,
} from './components/BlockControl';
import { GlobalEditor } from './components/GlobalEditor';
import './editor.css';

const blockAttributes = {
	pcssAdditionalCss: { type: 'string' },
	pcssAdditionalCssCompiled: { type: 'string', default: '' },
	pcssClassId: { type: 'string', default: '' },
};
const pcssAttributeKeys = Object.keys(blockAttributes);

init().then(() => {
	// Add to global scope so it's not loaded multiple times
	window.patternCss.transform = transform;
});

// Remove our attributes for server rendering
apiFetch.use((options, next) => {
	if (options.path?.includes('wp/v2/block-renderer')) {
		let { data, body } = options;

		// Strip from query params (GET)
		const [base, query = ''] = options.path.split('?');
		const params = new URLSearchParams(query);
		for (const key of pcssAttributeKeys)
			params.delete(`attributes[${key}]`);
		const path = `${base}?${params.toString()}`;

		// Strip from body attributes (POST)
		if (data?.attributes) {
			const { ...attrs } = data.attributes;
			for (const key of pcssAttributeKeys) delete attrs[key];
			data = { ...data, attributes: attrs };
		}

		if (typeof body === 'string') {
			try {
				const parsed = JSON.parse(body);
				if (parsed?.attributes) {
					for (const key of pcssAttributeKeys)
						delete parsed.attributes[key];
					body = JSON.stringify(parsed);
				}
			} catch {
				// not JSON, leave as-is
			}
		}

		return next({ ...options, path, data, body });
	}
	return next(options);
});

const addSaveProps = (
	props: Record<string, unknown>,
	_blockType: null,
	attributes: Record<string, unknown>,
) => {
	const propsClass =
		typeof props.className === 'string' ? props.className : '';
	const attrsClass =
		typeof attributes.className === 'string' ? attributes.className : '';
	const classes = new Set(
		[...propsClass.split(' '), ...attrsClass.split(' ')].filter(Boolean),
	);
	const pcssClassId = attributes.pcssClassId;

	if (
		typeof pcssClassId !== 'string' ||
		!pcssClassId ||
		classes.has(pcssClassId)
	)
		return props;
	classes.add(pcssClassId);
	return {
		...props,
		className: [...classes].join(' '),
	};
};

addFilter(
	'blocks.registerBlockType',
	'kevinbatdorf/pcss-block-settings',
	(settings) => {
		// This pattern is found in the Gutenberg source code
		const existingGetEditWrapperProps = settings.getEditWrapperProps;
		settings.getEditWrapperProps = (
			attributes: Record<string, unknown>,
		) => {
			const props = (existingGetEditWrapperProps?.(attributes) ??
				{}) as Record<string, unknown>;
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
	(CurrentMenuItems) => (props: BlockControlProps) =>
		BlockControl(CurrentMenuItems, props),
	// Force it at the very bottom
	Number.MAX_SAFE_INTEGER,
);
addFilter(
	'blocks.getSaveContent.extraProps',
	'kevinbatdorf/pcss-add-save-props',
	addSaveProps,
);

registerPlugin('pcss-global-editor', { render: () => <GlobalEditor /> });
