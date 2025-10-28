import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import ToolbarPlugin from './ToolbarPlugin';
import UnifiedMentionPlugin, { MentionNode } from './UnifiedMentionPlugin';

const theme = {
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

function onError(error) {
  console.error(error);
}

export default function LexicalCommentEditor({ 
  onChange, 
  placeholder = "Write a comment...",
  users = [],
  companies = [],
  initialValue = "",
  editorRef,
  key // Add key prop to force re-render when needed
}) {
  const initialConfig = {
    namespace: 'CommentEditor',
    theme,
    onError,
    nodes: [MentionNode],
    editorState: initialValue ? () => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const text = $createTextNode(initialValue);
      paragraph.append(text);
      root.append(paragraph);
    } : null, // Changed from undefined to null for better reset
  };

  const handleChange = (editorState, editor) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      
      // Extract user and company mentions separately
      const userMentions = [];
      const companyMentions = [];
      
      // Parse the editor state to find MentionNodes
      const mentionRegex = /@(\w+[-\w]*)/g;
      let match;
      while ((match = mentionRegex.exec(textContent)) !== null) {
        const mentionText = match[1];
        
        // Check if it's a user or company mention
        const isUser = users.some(u => u.username === mentionText);
        const isCompany = companies.some(c => c.slug === mentionText);
        
        if (isUser) {
          userMentions.push(mentionText);
        } else if (isCompany) {
          companyMentions.push(mentionText);
        }
      }
      
      onChange({
        text: textContent,
        html: root.__cachedText,
        mentions: userMentions, // Keep backward compatible
        userMentions,
        companyMentions,
        editorState: JSON.stringify(editorState.toJSON()),
      });
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative border border-gray-300 rounded-lg bg-white">
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[80px] max-h-[200px] overflow-y-auto p-3 text-sm focus:outline-none"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="absolute top-3 left-3 text-gray-400 text-sm pointer-events-none">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
          <UnifiedMentionPlugin users={users} companies={companies} />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Type @ to mention users or companies • Cmd/Ctrl+Enter to submit
      </p>
    </LexicalComposer>
  );
}
