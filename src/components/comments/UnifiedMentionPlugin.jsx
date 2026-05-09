import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TextNode } from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { $getSelection, $isRangeSelection, $createTextNode } from 'lexical';
import { Avatar } from '@chakra-ui/react';
import { avatarStyle } from '../ResponsiveNav';
import { BuildingOffice2Icon, UserIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

// Custom Mention Node for both users and companies
export class MentionNode extends TextNode {
  __mention;
  __mentionType; // 'user' or 'company'

  static getType() {
    return 'mention';
  }

  static clone(node) {
    return new MentionNode(node.__mention, node.__mentionType, node.__text, node.__key);
  }

  constructor(mentionName, mentionType = 'user', text, key) {
    super(text ?? `@${mentionName}`, key);
    this.__mention = mentionName;
    this.__mentionType = mentionType;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.className = 'mention-node';
    
    // Different colors for user vs company mentions
    if (this.__mentionType === 'company') {
      dom.style.color = '#059669'; // Green for companies
      dom.style.backgroundColor = '#d1fae5'; // Light green bg
    } else {
      dom.style.color = '#1d4ed8'; // Blue for users
      dom.style.backgroundColor = '#dbeafe'; // Light blue bg
    }
    
    dom.style.fontWeight = '600';
    dom.style.padding = '2px 4px';
    dom.style.borderRadius = '4px';
    return dom;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      mention: this.__mention,
      mentionType: this.__mentionType,
      type: 'mention',
      version: 1,
    };
  }

  static importJSON(serializedNode) {
    const node = $createMentionNode(
      serializedNode.mention,
      serializedNode.mentionType
    );
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }
}

export function $createMentionNode(mentionName, mentionType = 'user') {
  return new MentionNode(mentionName, mentionType);
}

export function $isMentionNode(node) {
  return node instanceof MentionNode;
}

// Unified Typeahead Component - shows both users and companies
const UnifiedMentionTypeahead = ({ 
  items, 
  onSelect, 
  position, 
  searchTerm 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const handleSelect = (item) => {
    onSelect(item);
  };

  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <div
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto w-72"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {items.map((item, index) => (
        <button
          key={`${item.type}-${item.id}`}
          onClick={() => handleSelect(item)}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0',
            {
              'bg-gray-50': index === selectedIndex,
            }
          )}
        >
          {item.type === 'user' ? (
            <>
              <Avatar
                name={item.full_name || item.email}
                src={item.avatar}
                size="sm"
                className={avatarStyle}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate text-gray-900">
                  {item.full_name || `${item.first_name} ${item.last_name}`}
                </div>
                <div className="text-xs text-blue-600 truncate">
                  @{item.username} • User
                </div>
              </div>
              <UserIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </>
          ) : (
            <>
              <Avatar
                name={item.company_name}
                src={item.logo}
                size="sm"
                className={avatarStyle}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate text-gray-900">
                  {item.company_name}
                </div>
                <div className="text-xs text-green-600 truncate">
                  @{item.slug} • Company
                </div>
              </div>
              <BuildingOffice2Icon className="w-4 h-4 text-green-500 flex-shrink-0" />
            </>
          )}
        </button>
      ))}
    </div>
  );
};

// Main Plugin
export default function UnifiedMentionPlugin({ users = [], companies = [] }) {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState(null);
  const [results, setResults] = useState([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!editor.hasNodes([MentionNode])) {
      throw new Error(
        'UnifiedMentionPlugin: MentionNode not registered on editor'
      );
    }
  }, [editor]);

  const updateResults = useCallback(
    (query) => {
      const lowerQuery = query.toLowerCase();

      // Search users
      const matchedUsers = users
        .filter((user) => {
          if (!lowerQuery) return true;

          const fullName = user.full_name?.toLowerCase() || '';
          const firstName = user.first_name?.toLowerCase() || '';
          const lastName = user.last_name?.toLowerCase() || '';
          const username = user.username?.toLowerCase() || '';
          const email = user.email?.toLowerCase() || '';

          return (
            fullName.includes(lowerQuery) ||
            firstName.includes(lowerQuery) ||
            lastName.includes(lowerQuery) ||
            username.includes(lowerQuery) ||
            email.includes(lowerQuery)
          );
        })
        .slice(0, 3) // Limit to 3 users
        .map((user) => ({ ...user, type: 'user' }));

      // Search companies
      const matchedCompanies = companies
        .filter((company) => {
          if (!lowerQuery) return true;

          const name = company.company_name?.toLowerCase() || '';
          const slug = company.slug?.toLowerCase() || '';
          const tagline = company.tag_line?.toLowerCase() || '';

          return (
            name.includes(lowerQuery) ||
            slug.includes(lowerQuery) ||
            tagline.includes(lowerQuery)
          );
        })
        .slice(0, 3) // Limit to 3 companies
        .map((company) => ({ ...company, type: 'company' }));
      
      // Combine and sort: users first, then companies
      setResults([...matchedUsers, ...matchedCompanies]);
    },
    [users, companies]
  );

  useEffect(() => {
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setQueryString(null);
          return;
        }

        const node = selection.anchor.getNode();
        const text = node.getTextContent();
        const cursorPosition = selection.anchor.offset;

        // Find @ symbol before cursor
        let atIndex = -1;
        for (let i = cursorPosition - 1; i >= 0; i--) {
          if (text[i] === '@') {
            atIndex = i;
            break;
          }
          if (text[i] === ' ') break; // Stop at space
        }

        if (atIndex !== -1) {
          const query = text.slice(atIndex + 1, cursorPosition);
          if (query.indexOf(' ') === -1) {
            setQueryString(query);
            updateResults(query);

            // Calculate position
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
              const range = domSelection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              const calculatedPosition = {
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX,
              };
              setPosition(calculatedPosition);
            }
          } else {
            setQueryString(null);
          }
        } else {
          setQueryString(null);
        }
      });
    });

    return () => {
      updateListener();
    };
  }, [editor, updateResults]);

  const selectOption = useCallback(
    (item) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const node = selection.anchor.getNode();
        const text = node.getTextContent();
        const cursorPosition = selection.anchor.offset;

        // Find the @ symbol
        let atIndex = -1;
        for (let i = cursorPosition - 1; i >= 0; i--) {
          if (text[i] === '@') {
            atIndex = i;
            break;
          }
        }

        if (atIndex !== -1) {
          const beforeAt = text.slice(0, atIndex);
          const afterCursor = text.slice(cursorPosition);

          // Determine mention name and type
          const mentionName = item.type === 'user' 
            ? item.username 
            : item.slug;
          const mentionType = item.type;

          // Create mention node
          const mentionNode = $createMentionNode(mentionName, mentionType);
          const spaceNode = $createTextNode(' ');

          // Replace text
          node.setTextContent(beforeAt);
          node.insertAfter(mentionNode);
          mentionNode.insertAfter(spaceNode);

          if (afterCursor) {
            const afterNode = $createTextNode(afterCursor);
            spaceNode.insertAfter(afterNode);
          }

          // Move cursor after the mention
          spaceNode.select();
        }
      });

      setQueryString(null);
      setResults([]);
    },
    [editor]
  );

  return queryString !== null && results.length > 0 ? (
    <UnifiedMentionTypeahead
      items={results}
      onSelect={selectOption}
      position={position}
      searchTerm={queryString}
    />
  ) : null;
}
