import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button
        onClick={formatBold}
        className="p-2 hover:bg-gray-200 rounded transition-colors"
        type="button"
        title="Bold (Cmd+B)"
      >
        <strong className="text-sm">B</strong>
      </button>
      <button
        onClick={formatItalic}
        className="p-2 hover:bg-gray-200 rounded transition-colors"
        type="button"
        title="Italic (Cmd+I)"
      >
        <em className="text-sm">I</em>
      </button>
      <button
        onClick={formatUnderline}
        className="p-2 hover:bg-gray-200 rounded transition-colors"
        type="button"
        title="Underline (Cmd+U)"
      >
        <span className="text-sm underline">U</span>
      </button>
    </div>
  );
}
