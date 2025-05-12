import { forwardRef, useRef } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import Editor from 'react-simple-code-editor';
import { useTheme } from '../hooks/useTheme';
import type { LineOption } from '../types';

type CodeEditorProps = {
	value: string;
	onChange: (value: string) => void;
	// eslint-disable-next-line
	onFocus: (event: any) => void;
	// eslint-disable-next-line
	onBlur?: (event: any) => void;
	lineOptions: LineOption[];
};
export const CodeEditor = forwardRef((props: CodeEditorProps, ref) => {
	const textAreaRef = useRef<HTMLDivElement>(null);
	const {
		value,
		onChange,
		onFocus,
		onBlur,
		lineOptions = [],
		...remainingProps
	} = props;
	const {
		highlighter,
		error: editorError,
		loading,
	} = useTheme({
		theme: 'light-plus',
		lang: 'css',
	});

	if (loading) return null;
	if (editorError) return <p>{editorError.message}</p>;

	return (
		<div ref={textAreaRef} className="h-full">
			<Editor
				// eslint-disable-next-line
				// @ts-ignore-next-line
				ref={ref}
				value={decodeEntities(value)}
				className="font-jetbrains-mono border border-solid border-gray-600 h-full"
				onValueChange={onChange}
				{...remainingProps}
				padding={{
					top: 6,
					bottom: 6,
					left: 8,
					right: 8,
				}}
				style={{
					minHeight: 300,
					backgroundColor: 'none',
					color: highlighter?.getForegroundColor() ?? '#000',
				}}
				// eslint-disable-next-line
				onKeyDown={(e: any) =>
					e.key === 'Tab' &&
					// Tab lock here. Pressing Escape will unlock.
					textAreaRef.current?.querySelector('textarea')?.focus()
				}
				onFocus={onFocus}
				onBlur={onBlur}
				highlight={(code: string) =>
					highlighter
						?.codeToHtml(decodeEntities(code), {
							lang: 'css',
							lineOptions,
						})
						?.replace(/<\/?[pre|code][^>]*>/g, '')
				}
			/>
		</div>
	);
});
