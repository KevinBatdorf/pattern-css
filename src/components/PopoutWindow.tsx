import { BaseControl, Button, CheckboxControl } from '@wordpress/components';
import { Icon, close, dragHandle } from '@wordpress/icons';
import { createPortal, useRef } from '@wordpress/element';
import { usePortal } from '../hooks/usePortal';
import { useDraggable } from '../hooks/useDraggable';
import { __ } from '@wordpress/i18n';
import { usePopoutStore } from '../state/popout';
import { useResizable } from '../hooks/useResizable';

export const PopoutWindow = ({ children }: { children: React.ReactNode }) => {
	const mountNode = usePortal('pcss-popout-mount');
	const ref = useRef<HTMLDivElement>(null);
	const {
		open,
		transparent,
		x: top,
		y: left,
		width,
		height,
		setOpen,
		setSize,
		setPosition,
	} = usePopoutStore();
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

	if (!mountNode || !open) return children;
	return (
		<>
			<PopoverPlaceholder />
			{createPortal(
				<div className="pattern-css-editor">
					<div
						className={`fixed z-high font-jetbrains-mono shadow-2xl border border-solid border-gray-300 flex flex-col ${transparent ? 'bg-white/90' : 'bg-white'}`}
						style={{ top, left, width, height }}
						ref={ref}>
						<>
							<div className="flex gap-1 justify-between items-center p-2">
								<div
									data-pcss-handle
									draggable
									className="flex flex-grow gap-1 justify-between items-center">
									<DragButton />
									<h2 className="text-sm font-medium m-0 p-0 flex-grow text-gray-900">
										{__('Pattern CSS', 'pattern-css')}
									</h2>
								</div>
								<Button
									className="border-0 relative z-10"
									onClick={() => setOpen(false)}
									icon={<Icon icon={close} size={12} />}
									label={__('Close Modal', 'pattern-css')}
									showTooltip={false}
								/>
							</div>
							<div className="relative z-50 px-4 pb-4 h-full flex flex-col">
								{children}
							</div>
							<div
								data-pcss-resize
								className="absolute z-high right-0 bottom-0 w-4 h-4">
								<div className="w-4 h-4 border-solid border border-t-0 border-l-0 border-gray-600" />
							</div>
						</>
					</div>
				</div>,
				mountNode,
			)}
		</>
	);
};

const PopoverPlaceholder = () => {
	const { setSize, setPosition, transparent, setTransparent } =
		usePopoutStore();
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-center text-gray-900 bg-gray-100 p-4 h-52">
				{__('Popout is open', 'pattern-css')}
			</div>
			<BaseControl id="pcss-enable-transparency">
				<CheckboxControl
					label={__('Transparent background', 'pattern-css')}
					checked={transparent}
					onChange={(transparent) => {
						setTransparent(transparent);
					}}
				/>
				{/* reset size and positoin */}
				<Button
					variant="secondary"
					onClick={() => {
						setPosition(20, 20);
						setSize(250, 400);
					}}>
					{__('Reset Position', 'pattern-css')}
				</Button>
			</BaseControl>
		</div>
	);
};

const DragButton = (props: React.HTMLProps<HTMLDivElement>) => {
	return (
		<div
			style={{ userSelect: 'none' }}
			className="text-gray-900 hover:text-gray-700 relative flex"
			{...props}>
			<Icon icon={dragHandle} size={24} />
			<span className="sr-only">{__('Drag to move', 'pattern-css')}</span>
		</div>
	);
};
