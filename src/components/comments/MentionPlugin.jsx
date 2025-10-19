import { useEffect, useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  TextNode,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';

// Simple mention detection - looks for @username pattern
const MENTION_REGEX = /@(\w+)/g;

export class MentionNode extends TextNode {
  __mention;

  static getType() {
    return 'mention';
  }

  static clone(node) {
    return new MentionNode(node.__mention, node.__text, node.__key);
  }

  constructor(mentionName, text, key) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.className = 'mention';
    dom.style.color = '#1d4ed8';
    dom.style.fontWeight = '600';
    dom.style.cursor = 'pointer';
    return dom;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      mention: this.__mention,
      type: 'mention',
      version: 1,
    };
  }
}

export function $createMentionNode(mentionName) {
  return new MentionNode(mentionName, `@${mentionName}`);
}

export function $isMentionNode(node) {
  return node instanceof MentionNode;
}

// Mention suggestions component
function MentionTypeahead({ users, onSelect, position, searchTerm }) {
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredUsers.length === 0) return null;

  return (
    <div
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '200px',
      }}
    >
      {filteredUsers.slice(0, 5).map((user) => (
        <button
          key={user.id}
          type="button"
          className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
          onClick={() => onSelect(user)}
        >
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white text-xs font-bold">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div>
            <div className="text-sm font-medium">{user.full_name || `${user.first_name} ${user.last_name}`}</div>
            <div className="text-xs text-gray-500">@{user.first_name?.toLowerCase()}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function MentionPlugin({ users = [] }) {
  const [editor] = useLexicalComposerContext();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleMentionSelect = useCallback((user) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const mentionNode = $createMentionNode(user.first_name?.toLowerCase() || user.email);
        selection.insertNodes([mentionNode]);
      }
    });
    setShowSuggestions(false);
    setSearchTerm('');
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const text = selection.getTextContent();
            const lastAtIndex = text.lastIndexOf('@');
            
            if (lastAtIndex !== -1) {
              const searchText = text.slice(lastAtIndex + 1);
              if (searchText.length >= 0 && !searchText.includes(' ')) {
                setSearchTerm(searchText);
                setShowSuggestions(true);
                
                // Get cursor position (simplified)
                const nativeSelection = window.getSelection();
                if (nativeSelection && nativeSelection.rangeCount > 0) {
                  const range = nativeSelection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  setPosition({
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.left + window.scrollX,
                  });
                }
              } else {
                setShowSuggestions(false);
              }
            } else {
              setShowSuggestions(false);
            }
          }
        });
      })
    );
  }, [editor]);

  return showSuggestions ? (
    <MentionTypeahead
      users={users}
      onSelect={handleMentionSelect}
      position={position}
      searchTerm={searchTerm}
    />
  ) : null;
}
