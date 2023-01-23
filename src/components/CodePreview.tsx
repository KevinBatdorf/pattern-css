import { BaseControl, Tip } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { useTheme } from '../hooks/useTheme';

type CodeEditorProps = {
    value: string;
};
export const CodePreview = ({ value }: CodeEditorProps) => {
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
        <div className="flex flex-col gap-2">
            <BaseControl id="no-permission-to-edit">
                <Tip>
                    {__(
                        'You do not have permission to edit this css.',
                        'per-page-css',
                    )}
                </Tip>
            </BaseControl>
            <BaseControl id="code-viewer">
                <div
                    className="font-jetbrains-mono border border-gray-600 py-1.5 px-2 code-preview"
                    dangerouslySetInnerHTML={{
                        __html:
                            highlighter?.codeToHtml(decodeEntities(value), {
                                lang: 'css',
                            }) ?? '',
                    }}
                />
            </BaseControl>
        </div>
    );
};
