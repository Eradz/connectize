import { useState, memo } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import TimeAgo from '../TimeAgo';
import { MarkdownComponent } from '../MarkDownComponent';
import { avatarStyle } from '../ResponsiveNav';
import LexicalCommentEditor from './LexicalCommentEditor';

const CommentThread = memo(({ 
  comment, 
  postUserId, 
  currentUser,
  onReply,
  onLike,
  users = [],
  companies = [],
  level = 0 
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState({ text: '', mentions: [] });
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [liked, setLiked] = useState(false); // TODO: Check if user already liked

  const isAuthor = comment.user?.id === postUserId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isNested = level > 0;

  const handleReplySubmit = async () => {
    if (!replyContent.text.trim()) return;
    
    setIsReplying(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent({ text: '', mentions: [] });
      setShowReplyInput(false);
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleLike = async () => {
    try {
      await onLike(comment.id);
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  return (
    <div className={clsx('mb-3', {
      'ml-8 border-l-2 border-gray-200 pl-4': isNested,
    })}>
      <div className="flex gap-2">
        {/* Avatar */}
        <Link to={`/co/${comment.user?.id}`}>
          <Avatar
            name={`${comment.user?.first_name} ${comment.user?.last_name}`}
            className={avatarStyle}
            src={comment.user?.avatar}
            size={isNested ? 'sm' : 'md'}
          />
        </Link>

        <div className="flex-1">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/co/${comment.user?.id}`} className="font-bold text-sm hover:underline">
              {comment.user?.first_name} {comment.user?.last_name}
            </Link>
            {isAuthor && (
              <span className="text-xs text-gray-500 font-medium px-1.5 py-0.5 bg-gray-100 rounded">
                Author
              </span>
            )}
            <span className="text-gray-400 text-xs">
              • <TimeAgo time={comment.commented_at} />
            </span>
          </div>

          {/* Comment Content */}
          <MarkdownComponent
            markdownContent={comment.content}
            className="text-sm text-gray-700 mb-2"
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

            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <ChatBubbleOvalLeftIcon className="w-4 h-4" />
              <span>Reply</span>
            </button>

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
              <LexicalCommentEditor
                onChange={setReplyContent}
                placeholder={`Reply to ${comment.user?.first_name}...`}
                users={users}
                companies={companies}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReplySubmit}
                  disabled={isReplying || !replyContent.text.trim()}
                  className="px-4 py-1.5 bg-gold hover:bg-custom_yellow disabled:bg-gray-300 text-sm font-medium rounded transition-colors disabled:cursor-not-allowed"
                >
                  {isReplying ? 'Replying...' : 'Reply'}
                </button>
                <button
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyContent({ text: '', mentions: [] });
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
                  users={users}
                  companies={companies}
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
