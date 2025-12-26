import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById } from "../../api-services/posts";
import { useGetPostComments } from "../../hooks/useComments";
import { useState, useCallback, useEffect } from "react";
import { Avatar, Spinner } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import TimeAgo from "../../components/TimeAgo";
import clsx from "clsx";
import { toast } from "sonner";
import { 
  commentOnPost, 
  likeComment, 
  replyToComment 
} from "../../api-services/posts";
import { useAuth } from "../../context/userContext";
import { useQueryClient } from "@tanstack/react-query";

function SinglePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [allComments, setAllComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch post
  const { data: postItem, isLoading: isLoadingPost, isError: isPostError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
    retry: 1,
  });

  // Fetch comments
  const {
    data: commentsResponse,
    refetch: refetchComments,
    isLoading: isLoadingComments,
    isFetching: isFetchingComments,
  } = useGetPostComments(
    { postId: id, page: currentPage },
    { enabled: !!id }
  );

  // Update comments when data changes
  useEffect(() => {
    if (!commentsResponse?.results) return;
    
    if (currentPage === 1) {
      setAllComments(commentsResponse.results);
    } else {
      setAllComments(prev => [...prev, ...commentsResponse.results]);
    }
  }, [commentsResponse?.results, currentPage]);

  const handleComment = async () => {
    if (commentText.trim().length < 1) return;

    setLoading(true);
    try {
      const newComment = await commentOnPost(id, commentText, [], [], null);

      if (newComment.id) {
        refetchComments();
        toast.success('Comment added!');
        setCommentText('');
      }
    } catch (error) {
      toast.error("Failed to submit comment");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId, hasLiked) => {
    try {
      await likeComment(commentId, hasLiked, null);
      refetchComments();
    } catch (error) {
      toast.error("Failed to like comment");
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Loading state
  if (isLoadingPost) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <Spinner size="xl" color="blue.500" />
      </div>
    );
  }

  // Error state
  if (isPostError || !postItem) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Post Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Comments</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {isLoadingComments && currentPage === 1 ? (
            // Loading skeletons
            Array.from({ length: 3 }, (_, i) => (
              <div className="mb-8 flex gap-3" key={i}>
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="mb-2 w-32 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="mb-2 w-full h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : allComments.length === 0 ? (
            // Empty state
            <div className="text-center py-16">
              <p className="text-gray-400 text-base">No comments yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            // Comments
            <>
              {allComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postUserId={postItem?.user?.id}
                  onLike={handleLikeComment}
                />
              ))}

              {/* Load More Button */}
              {commentsResponse?.hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isFetchingComments && currentPage > 1}
                    className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isFetchingComments && currentPage > 1 ? 'Loading...' : 'Load More Comments'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-3 bg-white">
            <button className="hover:opacity-80 transition-opacity flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.4995 21.0001C17.6416 21.0001 20.9995 17.6422 20.9995 13.5001C20.9995 9.35793 17.6416 6.00006 13.4995 6.00006C9.35738 6.00006 5.99951 9.35793 5.99951 13.5001C5.99951 17.6422 9.35738 21.0001 13.4995 21.0001Z" stroke="#5E5E5E" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.4995 15.0001C10.4995 15.0001 11.6245 16.5001 13.4995 16.5001C15.3745 16.5001 16.4995 15.0001 16.4995 15.0001" stroke="#5E5E5E" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.25 11.25H11.2605" stroke="#5E5E5E" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.75 11.25H15.7605" stroke="#5E5E5E" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <input
              type="text"
              placeholder="Type your comment here"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
              disabled={loading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={handleComment}
              disabled={loading || commentText.trim().length < 1}
              className="hover:opacity-80 transition-opacity disabled:opacity-50 flex-shrink-0"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 37 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.0502 8.14082L6.16305 13.7699C5.49761 13.993 4.9172 14.416 4.50094 14.9811C4.08467 15.5462 3.85282 16.2259 3.837 16.9276C3.82117 17.6293 4.02214 18.3188 4.41249 18.9021C4.80285 19.4854 5.3636 19.9341 6.0183 20.187L12.2666 22.5753C12.4147 22.6359 12.5494 22.7255 12.6626 22.8387C12.7758 22.9519 12.8653 23.0865 12.926 23.2347L15.3143 29.483C15.5181 30.0137 15.8513 30.4852 16.2836 30.8544C16.7159 31.2236 17.2336 31.479 17.7897 31.5972C18.3458 31.7155 18.9226 31.6929 19.4678 31.5315C20.0129 31.3701 20.5091 31.075 20.9112 30.6731C21.2839 30.2928 21.5669 29.834 21.7395 29.3302L27.3685 12.443C27.567 11.8428 27.5947 11.1992 27.4487 10.5841C27.3027 9.96905 26.9887 9.40662 26.5417 8.9596C26.0947 8.51258 25.5322 8.19855 24.9171 8.05255C24.302 7.90656 23.6585 7.93433 23.0583 8.13278L23.0502 8.14082ZM25.2053 11.7273L22.3908 20.1709L19.5763 28.6145C19.4994 28.8333 19.3575 29.0234 19.1696 29.1593C18.9816 29.2952 18.7566 29.3703 18.5247 29.3747C18.2929 29.3791 18.0652 29.3125 17.8723 29.1838C17.6793 29.0551 17.5303 28.8705 17.4453 28.6547L15.0489 22.4145C15.0161 22.332 14.9785 22.2514 14.9363 22.1733L20.4769 16.6327C20.6902 16.4194 20.81 16.1301 20.81 15.8285C20.81 15.5269 20.6902 15.2376 20.4769 15.0244C20.2637 14.8111 19.9744 14.6913 19.6728 14.6913C19.3712 14.6913 19.0819 14.8111 18.8686 15.0244L13.328 20.565C13.2499 20.5228 13.1693 20.4852 13.0868 20.4524L6.84658 18.056C6.63081 17.971 6.44621 17.822 6.31752 17.629C6.18884 17.4361 6.12221 17.2084 6.12659 16.9765C6.13096 16.7447 6.20613 16.5197 6.342 16.3317C6.47788 16.1438 6.66797 16.0019 6.88678 15.925L23.774 10.2959C23.9732 10.2317 24.1862 10.2237 24.3897 10.2728C24.5932 10.3219 24.7791 10.4262 24.9271 10.5742C25.0751 10.7222 25.1794 10.9081 25.2285 11.1116C25.2776 11.3151 25.2696 11.5281 25.2053 11.7273Z" fill="#262626"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Comment Component
function CommentItem({ comment, postUserId, onLike }) {
  const [showReplies, setShowReplies] = useState(false);
  
  if (!comment?.user) return null;

  return (
    <div className="mb-6">
      {/* Main Comment */}
      <div className="flex gap-3">
        <Link to={`/co/${comment.user.id}`}>
          <Avatar
            name={`${comment.user.first_name || ''} ${comment.user.last_name || ''}`}
            src={comment.user.avatar}
            size="md"
            className="flex-shrink-0"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Name and Time */}
          <div className="flex items-baseline gap-2 mb-1">
            <Link to={`/co/${comment.user.id}`}>
              <h5 className="font-semibold text-gray-900 text-base hover:underline">
                {comment.user.first_name} {comment.user.last_name}
              </h5>
            </Link>
            <span className="text-gray-400 text-sm">
              <TimeAgo time={comment.commented_at} />
            </span>
          </div>

          {/* Comment Text */}
          <p className="text-gray-700 text-sm leading-relaxed mb-3 break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onLike(comment.id, comment.isLikedByUser)}
              className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors"
            >
              {comment.numberOfLikes || 0} Likes
            </button>
            <button 
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors flex items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.9689 17.7073L25.2928 11.3887L18.9741 5.06482" stroke="currentColor" strokeWidth="2.5285" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.05922 25.287L5.06286 16.4373C5.06341 15.0961 5.59673 13.8101 6.54549 12.8621C7.49425 11.9141 8.78074 11.3818 10.1219 11.3824L25.2929 11.3886" stroke="currentColor" strokeWidth="2.5285" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Reply
            </button>
          </div>
        </div>

        {/* Like Icon */}
        <button 
          onClick={() => onLike(comment.id, comment.isLikedByUser)}
          className="transition-colors hover:opacity-80 flex-shrink-0"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 31 31" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M8.85089 27.8171L5.05814 27.8156C4.38754 27.8153 3.74452 27.5486 3.27053 27.0742C2.79654 26.5999 2.53041 25.9566 2.53068 25.286L2.53432 16.4363C2.5346 15.7657 2.80126 15.1227 3.27564 14.6487C3.75002 14.1747 4.39326 13.9085 5.06386 13.9088L8.8566 13.9104M17.7074 11.3855L17.7095 6.32852C17.7099 5.32263 17.3107 4.35776 16.5997 3.64619C15.8887 2.93462 14.9242 2.53463 13.9183 2.53422L8.8566 13.9104L8.85089 27.8171L23.1116 27.823C23.7214 27.8301 24.3132 27.6166 24.778 27.2219C25.2428 26.8271 25.5493 26.2777 25.641 25.6748L27.3903 14.2973C27.4455 13.9349 27.4212 13.5649 27.3191 13.2128C27.2171 12.8608 27.0397 12.5351 26.7993 12.2584C26.5589 11.9818 26.2612 11.7606 25.9269 11.6104C25.5926 11.4602 25.2295 11.3845 24.863 11.3885L17.7074 11.3855Z" 
              stroke={comment.isLikedByUser ? "#3B82F6" : "#8991A0"}
              strokeWidth="2.5285" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill={comment.isLikedByUser ? "#3B82F6" : "none"}
            />
          </svg>
        </button>
      </div>

      {/* Replies (if any) */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-14 mt-4 pl-4 relative">
          <svg 
            className="absolute left-0 top-0 bottom-0" 
            width="4" 
            height="100%" 
            viewBox="0 0 4 211" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path 
              d="M1.89648 1.89636L1.89648 208.896" 
              stroke="#E7E7ED" 
              strokeWidth="3.79275" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeDasharray="10.11 10.11"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} onLike={onLike} />
          ))}
        </div>
      )}
    </div>
  );
}

// Reply Component
function ReplyItem({ reply, onLike }) {
  if (!reply?.user) return null;

  return (
    <div className="mb-4 flex gap-3">
      <Link to={`/co/${reply.user.id}`}>
        <Avatar
          name={`${reply.user.first_name || ''} ${reply.user.last_name || ''}`}
          src={reply.user.avatar}
          size="sm"
          className="flex-shrink-0"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <Link to={`/co/${reply.user.id}`}>
            <h5 className="font-semibold text-gray-900 text-sm hover:underline">
              {reply.user.first_name} {reply.user.last_name}
            </h5>
          </Link>
          <span className="text-gray-400 text-xs">
            <TimeAgo time={reply.replied_at} />
          </span>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-2 break-words">
          {reply.content}
        </p>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLike(reply.id, reply.isLikedByUser)}
            className="text-gray-500 hover:text-blue-600 text-xs font-medium transition-colors"
          >
            {reply.numberOfLikes || 0} Likes
          </button>
          <button className="text-gray-500 hover:text-blue-600 text-xs font-medium transition-colors flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.9689 17.7073L25.2928 11.3887L18.9741 5.06482" stroke="currentColor" strokeWidth="2.5285" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.05922 25.287L5.06286 16.4373C5.06341 15.0961 5.59673 13.8101 6.54549 12.8621C7.49425 11.9141 8.78074 11.3818 10.1219 11.3824L25.2929 11.3886" stroke="currentColor" strokeWidth="2.5285" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reply
          </button>
        </div>
      </div>

      <button 
        onClick={() => onLike(reply.id, reply.isLikedByUser)}
        className="transition-colors hover:opacity-80 flex-shrink-0"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 31 31" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M8.85089 27.8171L5.05814 27.8156C4.38754 27.8153 3.74452 27.5486 3.27053 27.0742C2.79654 26.5999 2.53041 25.9566 2.53068 25.286L2.53432 16.4363C2.5346 15.7657 2.80126 15.1227 3.27564 14.6487C3.75002 14.1747 4.39326 13.9085 5.06386 13.9088L8.8566 13.9104M17.7074 11.3855L17.7095 6.32852C17.7099 5.32263 17.3107 4.35776 16.5997 3.64619C15.8887 2.93462 14.9242 2.53463 13.9183 2.53422L8.8566 13.9104L8.85089 27.8171L23.1116 27.823C23.7214 27.8301 24.3132 27.6166 24.778 27.2219C25.2428 26.8271 25.5493 26.2777 25.641 25.6748L27.3903 14.2973C27.4455 13.9349 27.4212 13.5649 27.3191 13.2128C27.2171 12.8608 27.0397 12.5351 26.7993 12.2584C26.5589 11.9818 26.2612 11.7606 25.9269 11.6104C25.5926 11.4602 25.2295 11.3845 24.863 11.3885L17.7074 11.3855Z" 
            stroke={reply.isLikedByUser ? "#3B82F6" : "#8991A0"}
            strokeWidth="2.5285" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill={reply.isLikedByUser ? "#3B82F6" : "none"}
          />
        </svg>
      </button>
    </div>
  );
}

export default SinglePostPage;