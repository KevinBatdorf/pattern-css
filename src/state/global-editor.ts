import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

type GlobalEditorState = {
	open: boolean;
	transparent: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	setTransparent: (transparent: boolean) => void;
	setOpen: (open: boolean) => void;
	setSize: (width: number, height: number) => void;
	setPosition: (x: number, y: number) => void;
};

export const useGlobalEditorStore = create<GlobalEditorState>()(
	persist(
		devtools(
			(set) => ({
				open: false,
				transparent: false,
				x: '20',
				y: '20',
				width: '400',
				height: '600',
				setTransparent: (transparent) => set({ transparent }),
				setOpen: (open) => set({ open }),
				setSize: (width, height) => set({ width, height }),
				setPosition: (x, y) => set({ x, y }),
			}),
			{ name: 'PCSS Global Editor Store' },
		),
		{ name: 'pcss-global-editor-store' },
	),
);
