import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $createParagraphNode, $createTextNode, $nodesOfType } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
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

const normalizeMentionToken = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getUserDisplayName = (user) => {
  const fullName =
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();

  return fullName || user?.username || user?.email?.split("@")[0] || "";
};

const getCompanyDisplayName = (company) =>
  company?.company_name || company?.name || company?.slug || "";

const mentionMatches = (mentionText, values) => {
  const token = normalizeMentionToken(mentionText);
  return values.filter(Boolean).some((value) => normalizeMentionToken(value) === token);
};

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
      const htmlContent = $generateHtmlFromNodes(editor, null);
      
      // Extract user and company mentions separately
      const userMentions = new Set();
      const companyMentions = new Set();

      $nodesOfType(MentionNode).forEach((mentionNode) => {
        const mentionId = Number(mentionNode.getMentionId?.());
        if (!Number.isFinite(mentionId)) return;

        if (mentionNode.getMentionType?.() === "company") {
          companyMentions.add(mentionId);
        } else {
          userMentions.add(mentionId);
        }
      });
      
      // Parse the editor state to find MentionNodes
      const mentionRegex = /@(\w+[-\w]*)/g;
      let match;
      while ((match = mentionRegex.exec(textContent)) !== null) {
        const mentionText = match[1];
        
        // Check if it's a user or company mention and send backend IDs.
        const user = users.find((item) =>
          mentionMatches(mentionText, [
            item?.username,
            item?.email?.split("@")[0],
            getUserDisplayName(item),
          ])
        );
        const company = companies.find((item) =>
          mentionMatches(mentionText, [
            item?.slug,
            item?.company_name,
            item?.name,
            getCompanyDisplayName(item),
          ])
        );
        
        if (user?.id) {
          userMentions.add(Number(user.id));
        } else if (company?.id) {
          companyMentions.add(Number(company.id));
        }
      }
      
      onChange({
        text: htmlContent,
        plainText: textContent,
        html: htmlContent,
        mentions: Array.from(userMentions).filter(Number.isFinite), // Keep backward compatible
        userMentions: Array.from(userMentions).filter(Number.isFinite),
        companyMentions: Array.from(companyMentions).filter(Number.isFinite),
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
