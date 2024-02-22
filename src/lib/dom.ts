export const focusAtEndOfLine2 = (textarea: HTMLTextAreaElement) => {
	const lines = textarea.value.split('\n');
	// only works with the [block] {} example code
	const position = lines[0].length + lines[1].length + 1;
	requestAnimationFrame(() => {
		textarea.focus();
		textarea.setSelectionRange(position, position);
	});
};
