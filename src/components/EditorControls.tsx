import { store as blockEditorStore } from '@wordpress/block-editor';
import { Button, Tooltip } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export const EditorControls = ({
	handleChange,
	popoutOpen,
	setPopoutOpen,
	globalEditorOpen,
	setGlobalEditorOpen,
	editorWrapperRef,
}: {
	handleChange: (value: string) => void;
	popoutOpen: boolean;
	setPopoutOpen: (open: boolean) => void;
	globalEditorOpen: boolean;
	setGlobalEditorOpen: (open: boolean) => void;
	editorWrapperRef: React.RefObject<HTMLDivElement>;
}) => {
	const [isHighlighted, setIsHighlighted] = useState(false);
	// eslint-disable-next-line
	// @ts-ignore-next-line
	const { getSelectedBlockClientId } = useSelect(
		(select) => select(blockEditorStore),
		[],
	);
	const { toggleBlockHighlight } = useDispatch(blockEditorStore);
	const currentBlockId = getSelectedBlockClientId();
	useEffect(() => {
		const id = setTimeout(() => {
			toggleBlockHighlight(currentBlockId, false).then(() => {
				setIsHighlighted(false);
			});
		}, 1000);
		return () => {
			clearTimeout(id);
			// Cleanup function to remove the highlight when the component unmounts
			if (isHighlighted) {
				toggleBlockHighlight(currentBlockId, false);
			}
		};
	}, [isHighlighted, toggleBlockHighlight, currentBlockId]);
	return (
		<div className="flex justify-between border border-t-0 border-solid border-gray-600 text-xs text-gray-900">
			{globalEditorOpen ? (
				// placeholder for layout
				<div />
			) : (
				<Tooltip text={__('Open Global Styles Editor', 'pattern-css')}>
					<Button
						size="small"
						variant="tertiary"
						onClick={() => setGlobalEditorOpen(true)}
						className="lowercase hover:bg-gray-100 hover:text-gray-900">
						{
							// translators: Popout as in Popout the editor
							__('Global Styles', 'pattern-css')
						}
					</Button>
				</Tooltip>
			)}
			<div className="flex items-center justify-end gap-2">
				{popoutOpen ? null : (
					<Tooltip text={__('Popout Editor', 'pattern-css')}>
						<Button
							size="small"
							variant="tertiary"
							onClick={() => setPopoutOpen(true)}
							className="lowercase hover:bg-gray-100 hover:text-gray-900">
							{
								// translators: Popout as in Popout the editor
								__('Popout', 'pattern-css')
							}
						</Button>
					</Tooltip>
				)}
				{popoutOpen ? (
					<Tooltip text={__('Toggle highlight', 'pattern-css')}>
						<Button
							size="small"
							variant="tertiary"
							disabled={isHighlighted}
							onClick={() => {
								if (isHighlighted) return;
								setIsHighlighted(true);
								toggleBlockHighlight(currentBlockId, true);
							}}
							className={`lowercase hover:bg-gray-100 hover:text-gray-900 ${
								isHighlighted ? 'bg-gray-100' : ''
							}`}>
							{__('Highlight Block', 'pattern-css')}
						</Button>
					</Tooltip>
				) : null}

				<Tooltip text={__('Clear CSS', 'pattern-css')}>
					<Button
						size="small"
						variant="tertiary"
						onClick={() => {
							handleChange('');
							editorWrapperRef.current
								?.querySelector('textarea')
								?.focus();
						}}
						className="lowercase hover:bg-gray-100 hover:text-gray-900">
						{
							// translators: Clear as in Clear the editor
							__('Clear', 'pattern-css')
						}
					</Button>
				</Tooltip>
			</div>
		</div>
	);
};
