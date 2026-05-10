import { useEffect, useMemo, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import TimeAgo from '../TimeAgo';
import { MarkdownComponent } from '../MarkDownComponent';
import { avatarStyle } from '../ResponsiveNav';
import LexicalCommentEditor from './LexicalCommentEditor';
import CommentAsSelector from './CommentAsSelector';

const CommentThread = memo(({ 
  comment, 
  postUserId, 
  currentUser,
  onReply,
  onLike,
  onLikeReply,
  users = [],
  companies = [],
  commentAsCompanies = [],
  level = 0 
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState({
    text: '',
    plainText: '',
    mentions: [],
    companyMentions: [],
  });
  const [replyAsType, setReplyAsType] = useState('user');
  const [replyAsCompanyId, setReplyAsCompanyId] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [liked, setLiked] = useState(() => !!comment.isLikedByUser);

  const authorUser = comment.user;
  const authorCompany = comment.company;
  const isCompanyAuthor = !!(
    authorCompany &&
    typeof authorCompany === 'object' &&
    (authorCompany.company_name || authorCompany.name)
  );
  const authorName = isCompanyAuthor
    ? authorCompany.company_name || authorCompany.name
    : `${authorUser?.first_name || ''} ${authorUser?.last_name || ''}`.trim() ||
      authorUser?.username ||
      authorUser?.email?.split('@')[0] ||
      'User';
  const authorAvatar = isCompanyAuthor
    ? authorCompany.logo || authorCompany.image
    : authorUser?.avatar || authorUser?.profile_picture;
  const authorHref = isCompanyAuthor
    ? `/${authorCompany.slug || authorCompany.company_name || authorCompany.name}`
    : `/co/${authorUser?.id}`;
  const createdAt = comment.commented_at || comment.replied_at || comment.created_at;

  const isAuthor = !isCompanyAuthor && authorUser?.id === postUserId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isNested = level > 0;
  const isReply = level > 0; // Replies are nested comments
  const selectedReplyCompanyId = replyAsType === 'company' ? replyAsCompanyId : null;
  
  // Infinite reply depth now supported with parent_reply field
  const canReply = true; // Always allow replies

  useEffect(() => {
    if (
      replyAsCompanyId &&
      !(commentAsCompanies || []).some((company) => company.id === replyAsCompanyId)
    ) {
      setReplyAsType('user');
      setReplyAsCompanyId(null);
    }
  }, [commentAsCompanies, replyAsCompanyId]);

  const replyPlaceholder = useMemo(() => `Reply to ${authorName}...`, [authorName]);

  const handleReplySubmit = async () => {
    if (!replyContent.plainText?.trim()) return;
    
    setIsReplying(true);
    try {
      // If this is a reply (level > 0), pass the reply ID as parent_reply_id
      // The comment ID is always the root comment
      const replyDataWithParent = {
        ...replyContent,
        parentReplyId: isReply ? comment.id : null,
        commentAsCompanyId: selectedReplyCompanyId,
      };
      
      await onReply(comment.comment_id || comment.id, replyDataWithParent);
      setReplyContent({ text: '', plainText: '', mentions: [], companyMentions: [] });
      setShowReplyInput(false);
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isReply && onLikeReply) {
        // This is a reply, use reply like endpoint
        await onLikeReply(comment.id, liked);
      } else {
        // This is a top-level comment
        await onLike(comment.id, liked);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  return (
    <div className={clsx('mb-3', {
      'ml-8 border-l-2 border-gray-200 pl-4': isNested,
    })}>
      <div className="flex gap-2">
        {/* Avatar */}
        <Link to={authorHref}>
          <Avatar
            name={authorName}
            className={avatarStyle}
            src={authorAvatar}
            size={isNested ? 'sm' : 'md'}
          />
        </Link>

        <div className="flex-1">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link to={authorHref} className="font-bold text-sm hover:underline">
              {authorName}
            </Link>
            {isAuthor && (
              <span className="text-xs text-gray-500 font-medium px-1.5 py-0.5 bg-gray-100 rounded">
                Author
              </span>
            )}
            <span className="text-gray-400 text-xs">
              • <TimeAgo time={createdAt} />
            </span>
          </div>

          {/* Comment Content */}
          <MarkdownComponent
            markdownContent={comment.content}
            className="text-sm text-gray-700 mb-2"
            mentionUsers={users}
            mentionCompanies={companies}
          />

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button
              onClick={handleLike}
              className={clsx('flex items-center gap-1 hover:text-red-600 transition-colors', {
                'text-red-600': liked,
              })}
            >
              {liked ? (
                <HeartSolid className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>{comment.likes?.length || 0}</span>
            </button>

            {canReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 hover:text-gray-700 transition-colors"
              >
                {showReplies ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />
                    <span>Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4" />
                    <span>Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3">
              <CommentAsSelector
                user={currentUser}
                userCompanies={commentAsCompanies}
                selectedType={replyAsType}
                selectedCompanyId={replyAsCompanyId}
                onSelectionChange={(type, companyId) => {
                  setReplyAsType(type);
                  setReplyAsCompanyId(companyId);
                }}
              />
              <LexicalCommentEditor
                onChange={setReplyContent}
                placeholder={replyPlaceholder}
                users={users}
                companies={companies}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReplySubmit}
                  disabled={isReplying || !replyContent.plainText?.trim()}
                  className="px-4 py-1.5 bg-gold hover:bg-custom_yellow disabled:bg-gray-300 text-sm font-medium rounded transition-colors disabled:cursor-not-allowed"
                >
                  {isReplying ? 'Replying...' : 'Reply'}
                </button>
                <button
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyContent({ text: '', plainText: '', mentions: [], companyMentions: [] });
                  }}
                  className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {hasReplies && showReplies && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  postUserId={postUserId}
                  currentUser={currentUser}
                  onReply={onReply}
                  onLike={onLike}
                  onLikeReply={onLikeReply}
                  users={users}
                  companies={companies}
                  commentAsCompanies={commentAsCompanies}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CommentThread.displayName = 'CommentThread';

export default CommentThread;
