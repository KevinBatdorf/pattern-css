import { useLayoutEffect, useRef } from '@wordpress/element';

type Size = { width: number; height: number };

const clamp = (value: number, min: number, max: number) =>
	Math.max(min, Math.min(value, max));

export const useResizable = ({
	ref,
	open,
	initialSize,
	onResizeEnd,
	minWidth = 250,
	minHeight = 400,
	maxWidth = window.innerWidth,
	maxHeight = window.innerHeight,
}: {
	ref: React.RefObject<HTMLDivElement>;
	open: boolean;
	initialSize: Size;
	onResizeEnd: (width: number, height: number) => void;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
}) => {
	const start = useRef({ x: 0, y: 0, width: 0, height: 0 });
	const pointerIdRef = useRef<number | null>(null);

	useLayoutEffect(() => {
		const el = ref.current;
		const wp = document.getElementById('wpwrap');
		if (!el || !open || !wp) return;

		el.style.width = `${initialSize.width}px`;
		el.style.height = `${initialSize.height}px`;

		const handle = el.querySelector('[data-pcss-resize]');
		if (!(handle instanceof HTMLElement)) return;

		const onPointerDown = (e: PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();
			wp.style.pointerEvents = 'none';
			if (pointerIdRef.current !== null) {
				return;
			}
			pointerIdRef.current = e.pointerId;
			handle.setPointerCapture(e.pointerId);
			start.current = {
				x: e.clientX,
				y: e.clientY,
				width: el.offsetWidth,
				height: el.offsetHeight,
			};
			document.addEventListener('pointermove', onPointerMove);
			document.addEventListener('pointerup', onPointerUp);
		};

		const onPointerMove = (e: PointerEvent) => {
			const rect = el.getBoundingClientRect();
			const maxAllowedWidth = Math.min(
				maxWidth,
				window.innerWidth - rect.left,
			);
			const maxAllowedHeight = Math.min(
				maxHeight,
				window.innerHeight - rect.top,
			);
			const width = clamp(
				start.current.width + (e.clientX - start.current.x),
				minWidth,
				maxAllowedWidth,
			);
			const height = clamp(
				start.current.height + (e.clientY - start.current.y),
				minHeight,
				maxAllowedHeight,
			);
			el.style.width = `${width}px`;
			el.style.height = `${height}px`;
		};

		const onPointerUp = (e: PointerEvent) => {
			wp.style.pointerEvents = 'auto';
			if (pointerIdRef.current !== e.pointerId) {
				return;
			}
			pointerIdRef.current = null;
			handle.releasePointerCapture(e.pointerId);
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp);

			const rect = el.getBoundingClientRect();
			const maxAllowedWidth = Math.min(
				maxWidth,
				window.innerWidth - rect.left,
			);
			const maxAllowedHeight = Math.min(
				maxHeight,
				window.innerHeight - rect.top,
			);

			const width = clamp(
				start.current.width + (e.clientX - start.current.x),
				minWidth,
				maxAllowedWidth,
			);
			const height = clamp(
				start.current.height + (e.clientY - start.current.y),
				minHeight,
				maxAllowedHeight,
			);
			onResizeEnd(width, height);
		};

		handle.addEventListener('pointerdown', onPointerDown);

		return () => {
			handle.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp);
			wp.style.pointerEvents = 'auto';
			if (pointerIdRef.current !== null) {
				handle.releasePointerCapture(pointerIdRef.current);
				pointerIdRef.current = null;
			}
		};
	}, [
		ref,
		open,
		initialSize.width,
		initialSize.height,
		onResizeEnd,
		minWidth,
		minHeight,
		maxWidth,
		maxHeight,
	]);
};
