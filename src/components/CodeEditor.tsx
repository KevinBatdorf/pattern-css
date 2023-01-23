import { useRef } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import Editor from 'react-simple-code-editor';
import { useTheme } from '../hooks/useTheme';
import type { LineOption } from '../types';

type CodeEditorProps = {
    value: string;
    onChange: (value: string) => void;
    lineOptions: LineOption[];
};
export const CodeEditor = ({
    value,
    onChange,
    lineOptions = [],
}: CodeEditorProps) => {
    const textAreaRef = useRef<HTMLDivElement>(null);
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
        <div ref={textAreaRef}>
            <Editor
                value={decodeEntities(value)}
                className="font-jetbrains-mono border border-gray-600 wp-focus"
                onValueChange={onChange}
                padding={{
                    top: 6,
                    bottom: 6,
                    left: 8,
                    right: 8,
                }}
                style={{
                    minHeight: 300,
                    backgroundColor:
                        highlighter?.getBackgroundColor() ?? '#fff',
                    color: highlighter?.getForegroundColor() ?? '#000',
                }}
                // eslint-disable-next-line
                onKeyDown={(e: any) =>
                    e.key === 'Tab' &&
                    // Tab lock here. Pressing Escape will unlock.
                    textAreaRef.current?.querySelector('textarea')?.focus()
                }
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
};
