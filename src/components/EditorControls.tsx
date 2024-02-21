import { Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const EditorControls = ({
	handleChange,
	editorWrapperRef,
}: {
	handleChange: (value: string) => void;
	editorWrapperRef: React.RefObject<HTMLDivElement>;
}) => (
	<div className="flex gap-1 absolute top-[5px] right-[5px]">
		<Tooltip text={__('Clear CSS', 'pattern-css')}>
			<Button
				icon="no-alt"
				size="small"
				onClick={() => {
					handleChange('');
					editorWrapperRef.current
						?.querySelector('textarea')
						?.focus();
				}}
				className="text-gray-600 wp-focus">
				<span className="sr-only">
					{__('Clear CSS', 'pattern-css')}
				</span>
			</Button>
		</Tooltip>
	</div>
);
