// use zustand for x,y coordinates
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

type PopoutState = {
	open: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	setOpen: (open: boolean) => void;
	setSize: (width: number, height: number) => void;
	setPosition: (x: number, y: number) => void;
};

export const usePopoutStore = create<PopoutState>()(
	persist(
		devtools(
			(set) => ({
				open: false,
				x: '20',
				y: '20',
				width: '400',
				height: '600',
				setOpen: (open) => set({ open }),
				setSize: (width, height) => set({ width, height }),
				setPosition: (x, y) => set({ x, y }),
			}),
			{ name: 'PCSS Popout Store' },
		),
		{ name: 'pcss-popout-store' },
	),
);
