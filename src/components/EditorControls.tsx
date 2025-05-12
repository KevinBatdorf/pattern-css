import { Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const EditorControls = ({
	handleChange,
	popoutOpen,
	setPopoutOpen,
	editorWrapperRef,
}: {
	handleChange: (value: string) => void;
	popoutOpen: boolean;
	setPopoutOpen: (open: boolean) => void;
	editorWrapperRef: React.RefObject<HTMLDivElement>;
}) => (
	<div className="flex justify-end text-gray-900 text-xs border border-solid border-gray-600 border-t-0">
		{popoutOpen ? null : (
			<Tooltip text={__('Popout Editor', 'pattern-css')}>
				<Button
					size="small"
					variant="tertiary"
					onClick={() => {
						setPopoutOpen(true);
					}}
					className="lowercase hover:bg-gray-100 hover:text-gray-900">
					{
						// translators: Popout as in Popout the editor
						__('Popout', 'pattern-css')
					}
				</Button>
			</Tooltip>
		)}
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
);
