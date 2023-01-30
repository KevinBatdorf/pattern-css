// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line - TODO
import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line - TODO
import { store as editorStore } from '@wordpress/editor';
import { addFilter } from '@wordpress/hooks';
import { registerPlugin } from '@wordpress/plugins';
import { BlockControl } from './components/BlockControl';
import { PageControl } from './components/PageControl';
import './editor.css';
import { codeIcon } from './icons';

// Do the same for templates ?
// Can I do it per pattern or anytihng like that ?
// TODO: Add browser list feature

registerPlugin('ppc-page-control', {
    render: PageControl,
    icon: () => codeIcon,
});

addFilter(
    'blocks.registerBlockType',
    'kevinbatdorf/ppc-block-settings',
    (settings) => ({
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
    }),
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
    (props, blockType, attributes) => {
        const classes = props.className?.split(' ');
        if (classes?.includes(attributes?.ppcClassId)) {
            return props;
        }
        return {
            ...props,
            className: classes
                ? [...classes, attributes?.ppcClassId ?? ''].join(' ')
                : attributes?.ppcClassId,
        };
    },
);

domReady(() => {
    // This will concat all the block styles into one unit
    window.addEventListener('kevinbatdorf::ppc-editing-block', () => {
        const ppc_additional_css_block_compiled = select(blockEditorStore)
            .getBlocks()
            .reduce(
                // eslint-disable-next-line
                (acc: any[], block: any) => {
                    if (!block.attributes.ppcAdditionalCssCompiled) return acc;
                    return [...acc, block.attributes.ppcAdditionalCssCompiled];
                },
                [] as string[],
            )
            .join('');
        dispatch(editorStore).editPost({
            meta: { ppc_additional_css_block_compiled },
        });
    });
});
