export const clamp = (value: number, min: number, max: number) =>
	Math.max(min, Math.min(value, max));

export const getHighestZIndex = () => {
	const windows = document.querySelectorAll('.pattern-css-floating-window');
	const highestZIndex = Math.max(
		...Array.from(windows).map((w) => {
			const zIndex = window.getComputedStyle(w).zIndex;
			return zIndex === 'auto' ? 0 : parseInt(zIndex, 10);
		}),
	);
	return highestZIndex;
};

// Parse block attributes from a URL query string
export const parseAttributes = (params: URLSearchParams) =>
	Object.fromEntries(
		Array.from(params.entries())
			.filter(([key]) => key.startsWith('attributes['))
			.map(([key, value]) => [
				key.slice(11, -1), // removes 'attributes[' and ']'
				value,
			]),
	);

export const mergeAttributesToUrl = (
	url: string,
	attributes: Record<string, string>,
) => {
	const [base, query = ''] = url.split('?');
	const params = new URLSearchParams(query);

	// Remove all existing attributes[...] keys
	Array.from(params.keys())
		.filter((key) => key.startsWith('attributes['))
		.forEach((key) => params.delete(key));

	// Add new attributes
	Object.entries(attributes).forEach(([key, value]) => {
		params.set(`attributes[${key}]`, value);
	});

	return `${base}?${params.toString()}`;
};
