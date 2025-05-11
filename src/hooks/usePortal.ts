import { useEffect, useState } from '@wordpress/element';

export const usePortal = (id: string) => {
	const [mounted, setMounted] = useState<HTMLElement | null>(null);

	useEffect(() => {
		let node = document.getElementById(id) as HTMLElement;
		if (!node) {
			node = document.createElement('div');
			node.id = id;
			document.body.appendChild(node);
		}
		setMounted(node);
		return () => node.remove();
	}, [id]);

	return mounted;
};
