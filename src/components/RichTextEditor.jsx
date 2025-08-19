import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Simple toolbar with basic formatting
const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  
  return (
    <div className="border-b border-gray-200 p-2 flex items-center space-x-2">
      <button
        type="button"
        className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
        onClick={() => {
          editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'bold');
        }}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
        onClick={() => {
          editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'italic');
        }}
      >
        <em>I</em>
      </button>
      <span className="text-gray-400">|</span>
      <span className="text-xs text-gray-500">
        Use **bold** or *italic* for formatting
      </span>
    </div>
  );
};

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your message...", 
  minHeight = "120px",
  className = "" 
}) => {
  const initialConfig = {
    namespace: 'ConnectizeEditor',
    theme: {
      root: 'p-0 border-none outline-none',
      paragraph: 'mb-2 last:mb-0',
    },
    onError: (error) => {
      console.error('Lexical editor error:', error);
    },
    editorState: value || null,
  };

  const handleChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      onChange(textContent);
    });
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <PlainTextPlugin
            contentEditable={
              <ContentEditable 
                className="resize-none outline-none p-3 text-gray-900"
                style={{ minHeight }}
                placeholder={placeholder}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
};

export default RichTextEditor;
