import { Button } from '@wordpress/components';
import {
	createPortal,
	forwardRef,
	RefObject,
	useLayoutEffect,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, close, dragHandle } from '@wordpress/icons';
import { getHighestZIndex } from '../lib/util';

type FloatingWindowProps = {
	label: string;
	transparent: boolean;
	top: number;
	left: number;
	width: number;
	height: number;
	setOpen: (open: boolean) => void;
	children: React.ReactNode;
	mountNode: HTMLElement;
};

export const FloatingWindow = forwardRef<HTMLDivElement, FloatingWindowProps>(
	(
		{
			label,
			transparent,
			top,
			left,
			width,
			height,
			setOpen,
			children,
			mountNode,
		},
		ref,
	) => {
		useLayoutEffect(() => {
			const el = (ref as RefObject<HTMLDivElement>).current;
			if (!el) return;
			// Increase the z index to be highest of all windows
			const highestZIndex = getHighestZIndex();
			el.style.setProperty(
				'z-index',
				`${highestZIndex + 1}`,
				'important',
			);
		}, [ref]);

		return createPortal(
			<div className="pattern-css-editor">
				<div
					className={`pattern-css-floating-window fixed z-high flex flex-col border border-solid border-gray-300 font-jetbrains-mono shadow-2xl ${transparent ? 'bg-white/90' : 'bg-white'}`}
					style={{ top, left, width, height }}
					ref={ref}>
					<>
						<div className="flex items-center justify-between">
							<div
								data-pcss-handle
								draggable
								className="flex flex-grow cursor-grab items-center justify-between gap-1 p-2 py-3">
								<DragButton />
								<h2 className="m-0 h-full flex-grow p-0 text-sm font-medium text-gray-900">
									{label}
								</h2>
							</div>
							<Button
								className="relative z-10 border-0 p-2"
								onClick={() => setOpen(false)}
								icon={<Icon icon={close} size={12} />}
								label={__('Close Modal', 'pattern-css')}
								showTooltip={false}
							/>
						</div>
						<div className="relative z-50 flex h-full flex-col px-4 pb-4">
							{children}
						</div>
						<div
							data-pcss-resize
							className="absolute bottom-0 right-0 z-high h-6 w-6">
							<div className="h-6 w-6 cursor-se-resize border border-l-0 border-t-0 border-solid border-transparent transition-colors duration-300 hover:border-gray-600 active:border-gray-600" />
						</div>
					</>
				</div>
			</div>,
			mountNode,
		);
	},
);

const DragButton = (props: React.HTMLProps<HTMLDivElement>) => (
	<div
		style={{ userSelect: 'none' }}
		className="relative flex text-gray-900 hover:text-gray-700"
		{...props}>
		<Icon icon={dragHandle} size={24} />
		<span className="sr-only">{__('Drag to move', 'pattern-css')}</span>
	</div>
);
