import { Tooltip } from '@wordpress/components';
import { createPortal, useRef } from '@wordpress/element';
import { usePortal } from '../hooks/usePortal';
import { useDraggable } from '../hooks/useDraggable';
import { __ } from '@wordpress/i18n';
import { usePopoutStore } from '../state/popout';
import { DragHandleIcon } from '../lib/icons';

export const PopoutWindow = ({ children }: { children: React.ReactNode }) => {
	const mountNode = usePortal('pcss-popout-mount');
	const dragRef = useRef<HTMLDivElement>(null);
	const {
		open,
		x: top,
		y: left,
		width,
		height,
		setOpen,
		setSize,
		setPosition,
	} = usePopoutStore();
	useDraggable({
		ref: dragRef,
		open,
		initialPosition: { x: top, y: left },
		onDragEnd: (x: number, y: number) => {
			setPosition(x, y);
		},
	});

	if (!mountNode || !open) return children;
	return (
		<>
			<PopoverPlaceholder />
			{createPortal(
				<div className="pattern-css-editor">
					<div
						className="fixed z-high bg-white shadow-2xl p-2 border border-gray-300 flex flex-col gap-2"
						style={{ top, left, width, height }}
						ref={dragRef}>
						<>
							<div className="flex gap-2 justify-between items-center">
								<DragButton data-pcss-handle="pcss-popout-handle" />
								<h2 className="text-sm font-medium m-0 p-0">
									{__('Pattern CSS', 'pattern-css')}
								</h2>
								<button
									className="text-gray-500 hover:text-gray-700"
									onClick={() => setOpen(false)}
									aria-label={__('Close', 'pattern-css')}>
									&times;
								</button>
							</div>
							<div className="relative z-50">{children}</div>
						</>
					</div>
				</div>,
				mountNode,
			)}
		</>
	);
};

const PopoverPlaceholder = () => {
	return (
		<div className="flex items-center justify-center text-gray-900 bg-gray-100 p-4 h-52">
			{__('Popout is open', 'pattern-css')}
		</div>
	);
};

const DragButton = (props: React.HTMLProps<HTMLDivElement>) => {
	return (
		<div
			draggable
			style={{ userSelect: 'none', left: '-7px' }}
			className="text-gray-900 cursor-grab hover:text-gray-700 relative"
			{...props}>
			<DragHandleIcon />
			<span className="sr-only">{__('Drag to move', 'pattern-css')}</span>
		</div>
	);
};
