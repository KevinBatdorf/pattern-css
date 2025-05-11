import { Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const PopoutControls = ({
	setPopoutOpen,
}: {
	setPopoutOpen: (open: boolean) => void;
}) => (
	<div className="flex gap-1 absolute bottom-px right-px">
		<Tooltip text={__('Popout Editor', 'pattern-css')}>
			<Button
				icon="external"
				size="small"
				onClick={() => {
					setPopoutOpen(true);
				}}
				className="text-gray-600 wp-focus gap-0 p-1">
				<span className="sr-only">
					{__('Popout Editor', 'pattern-css')}
				</span>
			</Button>
		</Tooltip>
	</div>
);
