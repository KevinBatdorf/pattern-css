import { BaseControl, Button, CheckboxControl } from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDraggable } from '../hooks/useDraggable';
import { usePortal } from '../hooks/usePortal';
import { useResizable } from '../hooks/useResizable';
import { usePopoutStore } from '../state/popout';
import { FloatingWindow } from './FloatingWindow';

export const PopoutEditor = ({ children }: { children: React.ReactNode }) => {
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
			<FloatingWindow
				label="Pattern CSS"
				transparent={transparent}
				top={top}
				left={left}
				width={width}
				height={height}
				setOpen={setOpen}
				mountNode={mountNode}
				ref={ref}>
				{children}
			</FloatingWindow>
		</>
	);
};

const PopoverPlaceholder = () => {
	const { setSize, setPosition, transparent, setTransparent } =
		usePopoutStore();
	return (
		<div className="flex flex-col gap-2">
			<div className="flex h-52 items-center justify-center bg-gray-100 p-4 text-gray-900">
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
