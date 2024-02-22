export const addToClassList = (existing: string[], pcssClassId: string) =>
	[
		...new Set(
			[
				// Remove any existing pcss- classes
				...existing.filter((c: string) => !c.startsWith('pcss-')),
				pcssClassId,
			].filter(Boolean),
		),
	].join(' ');
