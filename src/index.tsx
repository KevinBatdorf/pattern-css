import { addFilter } from '@wordpress/hooks';
import { registerPlugin } from '@wordpress/plugins';
import { BlockControl } from './components/BlockControl';
import { PageControl } from './components/PageControl';
import './editor.css';
import { codeIcon } from './icons';

registerPlugin('ppc-page-control', {
    render: PageControl,
    icon: () => codeIcon,
});

// Both are unexpected objects with any properties types
// eslint-disable-next-line
const addSaveProps = (props: any, _blockType: null, attributes: any) => {
    const classes = new Set(props.className?.split(' '));
    const { ppcClassId } = attributes;

    if (!ppcClassId || classes.has(ppcClassId)) return props;
    classes.add(ppcClassId);
    return {
        ...props,
        className: [...classes].join(' '),
    };
};

addFilter(
    'blocks.registerBlockType',
    'kevinbatdorf/ppc-block-settings',
    (settings) => {
        // This pattern is found in the Gutenberg source code
        const existingGetEditWrapperProps = settings.getEditWrapperProps;
        // Attributes can be any type
        // eslint-disable-next-line
        settings.getEditWrapperProps = (attributes: { [key: string]: any }) => {
            const props = existingGetEditWrapperProps?.(attributes) ?? {};
            return addSaveProps(props, null, attributes);
        };
        return {
            ...settings,
            attributes: {
                ...settings.attributes,
                ppcAdditionalCss: {
                    type: 'string',
                    default: '',
                },
                ppcAdditionalCssCompiled: {
                    type: 'string',
                    default: '',
                },
                ppcClassId: {
                    type: 'string',
                    default: '',
                },
            },
        };
    },
);
addFilter(
    'editor.BlockEdit',
    'kevinbatdorf/ppc-block-control',
    (CurrentMenuItems) =>
        // Not sure how to type these incoming props
        // eslint-disable-next-line
        (props: any) =>
            BlockControl(CurrentMenuItems, props),
);
addFilter(
    'blocks.getSaveContent.extraProps',
    'kevinbatdorf/ppc-add-save-props',
    addSaveProps,
);
