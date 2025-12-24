import { MessageOutlined, ShareAltOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  CloseButton,
  Spinner,
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import { HeartIcon, Pencil1Icon, TrashIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import ContentWarningBadge from "../../posts/ContentWarningBadge";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  commentOnPost,
  deletePost,
  editPost,
  likePost,
  replyToComment,
  likeComment,
  likeReply,
} from "../../../api-services/posts";
import { useCustomQuery } from "../../../context/queryContext";
import { useAuth } from "../../../context/userContext";
import { usePollPosts } from "../../../hooks/usePolling";
import { Heart } from "../../../icon";
import { capitalizeFirst, formatNumber } from "../../../lib/utils";
import CompanyName from "../../company/CompanyName";
import ReusableModal from "../../custom/ResusableModal";
import FormatPostText from "../../FormatPostText";
import { MarkdownComponent } from "../../MarkDownComponent";
import MoreOptions from "../../MoreOptions";
import LightParagraph from "../../ParagraphText";
import PDFPreview from "../../PDFPreview";
import PostImageCollage from "../../PostImageCollage";
import { avatarStyle, ConJoinedImages } from "../../ResponsiveNav";
import SEO from "../../SEO";
import TimeAgo from "../../TimeAgo";

import SocialShareModal from "../../CustomShareButton";
import CustomShareButton from "../../CustomShareButton";
import { useGetPostComments } from "../../../hooks/useComments";
import { useQueryClient } from "@tanstack/react-query";
import { ButtonWithTooltipIcon } from "../../ButtonWithTooltipIcon";
import ReportModal from "../../moderation/ReportModal";
import LexicalCommentEditor from "../../comments/LexicalCommentEditor";
import CommentThread from "../../comments/CommentThread";
import CommentAsSelector from "../../comments/CommentAsSelector";
import { useUserSearch } from "../../../hooks/useUserSearch";
import { useCompanySearch } from "../../../hooks/useCompanySearch";
import { useUserCompanies } from "../../../hooks/useUserCompanies";

function DiscoverPosts({
  searchArray,
  isSearch,
  searchLoading,
  companyName = null,
}) {
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePollPosts();
  
  const observerRef = useRef();
  const lastPostRef = useRef();
  
  // State to track which post has comments open (only one at a time)
  const [openCommentPostId, setOpenCommentPostId] = useState(null);

  // Flatten all pages of posts
  const allPosts = data?.pages?.flatMap((page) => page.posts) ?? [];

  const finalArray = isSearch
    ? searchArray
    : companyName
      ? allPosts?.filter(
          (post) =>
            post?.company?.company_name?.toLowerCase() ===
            companyName?.toLowerCase()
        )
      : allPosts;
  const postLoading = isSearch ? searchLoading : isLoading;

  // Infinite scroll observer
  useEffect(() => {
    if (isSearch || companyName) return; // Disable infinite scroll for filtered views

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5, rootMargin: '200px' }
    );

    if (lastPostRef.current) {
      observer.observe(lastPostRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isSearch, companyName]);

  return (
    <section className="space-y-1.5 md:space-y-6 mt-6">
      {postLoading ? (
        Array.from({ length: 5 }, (_, index) => (
          <DiscoverPostSkeleton key={index} />
        ))
      ) : finalArray?.length < 1 ? (
        <LightParagraph>
          {isSearch ? "No post found in search" : "No posts available"}
        </LightParagraph>
      ) : (
        <>
          {finalArray?.map((post, index) => (
            <div
              key={post.id}
              ref={index === finalArray.length - 1 ? lastPostRef : null}
            >
              <DiscoverPostItem
                hasImage={post?.images?.length > 0}
                postItem={post}
                isCommentOpen={openCommentPostId === post.id}
                onToggleComment={(postId) => {
                  // If clicking the same post, close it. Otherwise, open the new one
                  setOpenCommentPostId(openCommentPostId === postId ? null : postId);
                }}
              />
            </div>
          ))}
          
          {/* Loading indicator for next page */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Spinner size="md" color="blue.500" />
              <LightParagraph className="ml-2">Loading more posts...</LightParagraph>
            </div>
          )}
          
          {/* End of posts message */}
          {!hasNextPage && !isSearch && finalArray.length > 0 && (
            <div className="text-center py-6">
              <LightParagraph className="text-gray-500">
                You've reached the end! No more posts to load.
              </LightParagraph>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DiscoverPosts;


export const DiscoverPostItem = ({
  postItem = {},
  hasImage = false,
  isSinglePost = false,
  isCommentOpen = false,
  onToggleComment = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allComments, setAllComments] = useState([]);
  
  const showCommentSection = isCommentOpen;
  
  const {
    data: commentsResponse,
    refetch: refetchComments,
    isLoading: isLoadingComments,
    isFetching: isFetchingComments,
  } = useGetPostComments(
    { postId: postItem.id, page: currentPage },
    {
      enabled: showCommentSection,
    }
  );

  const { setRefetchInterval } = useCustomQuery();
  const { user: currentUser } = useAuth();

  const postTitle = `Connectize Post by ${
    postItem?.user?.full_name
  } | ${capitalizeFirst(postItem?.company?.company_name)} Company`;

  const [commentsLength, setCommentsLength] = useState(
    () => postItem.numberOfComments || 0
  );

  const recentLikes = postItem?.likes;
  const [liked, setLiked] = useState(() => !!postItem?.isLikedByUser);
  const [likes, setLikes] = useState(() => postItem?.numberOfLikes || 0);
  const [disabled, setDisabled] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Update allComments when new data is fetched
  useEffect(() => {
    if (!commentsResponse?.results) return;
    
    if (currentPage === 1) {
      // First page - replace all comments
      setAllComments(commentsResponse.results);
    } else {
      // Subsequent pages - append new comments
      setAllComments(prev => [...prev, ...commentsResponse.results]);
    }
  }, [commentsResponse?.results, currentPage]);

  const incrementCommentCount = useCallback(() => {
    setCommentsLength((prev) => prev + 1);
  }, []);

  const handleLoadMoreComments = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleLikePost = async () => {
    const currentIsLiked = liked;
    setLiked(!currentIsLiked);
    setLikes((prev) => (!currentIsLiked ? prev + 1 : prev - 1));
    setDisabled(true);
    try {
      await likePost(postItem?.id, postItem, currentIsLiked);
    } catch (error) {
      setLiked(currentIsLiked);
      setLikes((prev) => (!currentIsLiked ? prev - 1 : prev + 1));
    }
    setDisabled(false);
    setRefetchInterval(1000);
    setTimeout(() => setRefetchInterval(false), 2000);
  };
  
  const shareUrlString = window.location.href + "posts/" + postItem.id;
  const shareData = {
    title: postTitle,
    text: postItem.body,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(postItem?.body);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        "py-4 px-4 xs:px-6 md:px-3 bg-white rounded-md transition-colors duration-300"
      )}
    >
      {isSinglePost && <SEO title={postTitle} description={postItem?.body} />}
      <header className="flex justify-between mb-2 gap-5 xs:gap-6 w-full overflow-hidden">
        <section className="flex xs:items-center gap-2">
          <Avatar
            name={postItem?.company?.company_name}
            size="sm"
            src={postItem?.company?.logo || "images/default-company-logo.png"}
            className={avatarStyle}
          />

          <section className="flex max-xs:flex-col xs:items-center gap-0.5 xs:gap-1">
            <div className="flex items-center gap-2">
              <CompanyName
                slug={postItem?.company?.slug}
                name={postItem?.company?.company_name}
                verified={postItem?.company?.verify}
              />
              {postItem?.is_flagged && (
                <ContentWarningBadge 
                  flagReason={postItem?.flag_reason} 
                  isOwner={postItem?.user?.id === currentUser?.id}
                />
              )}
            </div>
            <small className="text-gray-400 lowercase shrink-0">
              <Link to={`/co/${postItem?.user?.id}`}>
                @{postItem.user.first_name}{" "}
              </Link>
              • <TimeAgo time={postItem.date_created} />
            </small>
          </section>
        </section>

        {postItem?.user?.id === currentUser?.id ? (
          <MoreOptions className="shrink-0 !max-w-[120px]">
            <div className="flex flex-col gap-2">
              <ButtonWithTooltipIcon
                text="Edit post"
                IconName={Pencil1Icon}
                onClick={() => setIsEditing(true)}
              />
              <ButtonWithTooltipIcon
                text="Delete post"
                IconName={TrashIcon}
                onClick={async () => {
                  await deletePost(postItem?.id);
                  setRefetchInterval(1000);
                  setTimeout(() => setRefetchInterval(false), 2000);
                }}
                className="!text-red-700 hover:!text-red-500"
              />
            </div>
          </MoreOptions>
        ) : (
          <MoreOptions className="shrink-0 !max-w-[120px]">
            <div className="flex flex-col gap-2">
              <ButtonWithTooltipIcon
                text="Report post"
                IconName={ExclamationTriangleIcon}
                onClick={() => setShowReportModal(true)}
                className="!text-red-600 hover:!text-red-500"
              />
            </div>
          </MoreOptions>
        )}

        <ReusableModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title={`Edit Post`}
          footerContent={<></>}
        >
          <Textarea
            value={editMessage}
            placeholder="Please enter at least 10 character length of text"
            className="max-h-40 !text-sm placeholder:!text-sm"
            onChange={(e) => {
              setEditMessage(e.target.value);

              if (editMessage.trim().length < 10) {
                setErrorMessage(
                  "Please enter at least 10 character length of text"
                );
              } else if (editMessage.trim().length >= 10) {
                setErrorMessage(null);
              }
            }}
          />
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#9e3818] text-xs mx-0.5"
            >
              {errorMessage}
            </motion.div>
          )}

          <Button
            className="!bg-gold block mt-4 float-right !text-sm"
            onClick={async () => {
              setErrorMessage(null);
              if (editMessage.length < 10) {
                setErrorMessage("Please at least 10 character length of text");
                return;
              }
              const { id } = await editPost(
                postItem?.id,
                editMessage,
                postItem
              );
              setRefetchInterval(1000);
              setTimeout(() => setRefetchInterval(false), 2000);
              setIsEditing(false);
              if (id) toast.success("Post updated successfully");
            }}
          >
            Edit post
          </Button>
        </ReusableModal>
      </header>

      {/* Post Body Text */}
      <div className="mt-3 mb-3 text-gray-900 leading-relaxed">
        <FormatPostText
          text={postItem?.body}
          postId={postItem?.id}
          isSinglePost={isSinglePost}
        />
      </div>

      {/* Colored blocks - Always show 3 blocks */}
      <div className="mt-3 mb-3 grid grid-cols-3 gap-2">
        <div className="h-40 rounded-lg bg-blue-400" />
        <div className="h-40 rounded-lg bg-purple-400" />
        <div className="h-40 rounded-lg bg-green-400" />
      </div>

      <SocialShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        title={`Share to`}
        url={""}
      ></SocialShareModal>

      {/* NEW LAYOUT: Liked by avatars (LEFT) and Interaction stats (RIGHT) on same row */}
      <div className="flex items-center justify-between mt-4">
        {/* Left side: Liked by avatars */}
        <ConJoinedImages
          size={24}
          array={recentLikes?.map((post) => ({
            name: `${post?.user?.first_name} ${post?.user?.last_name}`,
            src: post?.user?.avatar,
            href: `/co/${post?.user?.id}`,
          }))}
          sizeVariant="sm"
        />

        {/* Right side: Interaction stats */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikePost}
            disabled={disabled}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors disabled:cursor-not-allowed group"
          >
            {liked ? (
              <Heart className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-sm font-medium">{formatNumber(likes)}</span>
          </button>

          <button
            onClick={() => onToggleComment(postItem.id)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 transition-colors group"
          >
            <MessageOutlined className="text-lg group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{formatNumber(commentsLength)}</span>
          </button>

          <CustomShareButton
            shareData={shareData}
            url={shareUrlString}
            modalTitle="Share post to"
          >
            <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-500 transition-colors group">
              <ShareAltOutlined className="text-lg group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{formatNumber(postItem?.shares || 20)}</span>
            </button>
          </CustomShareButton>

          <PDFPreview
            postBody={postItem?.body}
            postTitle={postTitle}
            postImages={postItem.images}
          />
        </div>
      </div>

      <CommentSection
        showCommentSection={showCommentSection}
        setShowCommentSection={() => onToggleComment(postItem.id)}
        commentsData={allComments}
        postItem={postItem}
        refetchComments={refetchComments}
        isLoading={isLoadingComments}
        hasMore={commentsResponse?.hasMore || false}
        onLoadMore={handleLoadMoreComments}
        isLoadingMore={isFetchingComments && currentPage > 1}
        onIncrementCount={incrementCommentCount}
      />

      {/* Report Modal - App Store Compliance */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="post"
        contentId={postItem?.id}
        reportedUserId={postItem?.user?.id}
      />
    </motion.article>
  );
};

const CommentSection = ({
  showCommentSection,
  setShowCommentSection,
  commentsData = [],
  isLoading,
  postItem,
  refetchComments,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  onIncrementCount,
}) => {
  const [commentData, setCommentData] = useState({ text: '', mentions: [], html: '', editorState: '' });
  const [loading, setLoading] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  
  const [commentAsType, setCommentAsType] = useState('user');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  
  const { setRefetchInterval } = useCustomQuery();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { users, loading: usersLoading, error: usersError } = useUserSearch();
  const { companies, loading: companiesLoading, error: companiesError } = useCompanySearch();
  const { companies: userCompanies } = useUserCompanies(user?.id);

  const handleCommentAsChange = useCallback((type, companyId) => {
    setCommentAsType(type);
    setSelectedCompanyId(companyId);
  }, []);

  const handleComment = useCallback(async () => {
    if (commentData.text.trim().length < 1) return;

    setLoading(true);
    try {
      const companyIdForComment = commentAsType === 'company' ? selectedCompanyId : null;
      
      const newComment = await commentOnPost(
        postItem.id, 
        commentData.text, 
        commentData.mentions || [],
        commentData.companyMentions || [],
        companyIdForComment
      );
      const { id } = newComment;

      queryClient.setQueryData(
        ["comments", { postId: postItem.id }],
        (oldComments) => {
          return [...oldComments, newComment];
        }
      );

      refetchComments().catch(() => {});
      if (id) {
        const commentedAs = commentAsType === 'company' 
          ? userCompanies.find(c => c.id === selectedCompanyId)?.company_name 
          : 'you';
        toast.success(`Comment added as ${commentedAs}`);
        onIncrementCount && onIncrementCount();
      }

      setCommentData({ text: '', mentions: [], html: '', editorState: '' });
      setEditorKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to submit the comment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [commentData, postItem, queryClient, refetchComments, commentAsType, selectedCompanyId, userCompanies, onIncrementCount]);

  const handleReply = useCallback(async (commentId, replyData) => {
    if (!replyData.text?.trim()) return;
    
    try {
      await replyToComment(
        commentId,
        replyData.text,
        replyData.userMentions || [],
        replyData.companyMentions || [],
        replyData.parentReplyId || null
      );
      
      refetchComments();
      toast.success("Reply added!");
      onIncrementCount && onIncrementCount();
    } catch (error) {
      console.error('Failed to reply:', error);
      toast.error("Failed to post reply");
    }
  }, [refetchComments, onIncrementCount]);

  const handleLike = useCallback(async (commentId, hasLiked = false) => {
    try {
      await likeComment(commentId, hasLiked, null);
      refetchComments();
      toast.success(hasLiked ? "Unliked!" : "Liked!");
    } catch (error) {
      console.error('Failed to like comment:', error);
      toast.error("Failed to like comment");
    }
  }, [refetchComments]);

  const handleLikeReply = useCallback(async (replyId, hasLiked = false) => {
    try {
      await likeReply(replyId, hasLiked, null);
      refetchComments();
      toast.success(hasLiked ? "Unliked reply!" : "Liked reply!");
    } catch (error) {
      console.error('Failed to like reply:', error);
      toast.error("Failed to like reply");
    }
  }, [refetchComments]);

  useEffect(() => {
    if (!showCommentSection) setCommentData({ text: '', mentions: [], html: '', editorState: '' });
  }, [showCommentSection]);

  if (!showCommentSection) return null;

  return (
    <section className="mt-4 border-t pt-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-bold text-lg">Comments</h2>
        <CloseButton
          className="!text-xs"
          onClick={() => setShowCommentSection(false)}
        />
      </div>

      {isLoading
        ? Array.from({ length: 3 }, (_, i) => {
            return (
              <div className="mb-4 flex gap-2 w-full" key={i}>
                <div className="">
                  <div className="w-7 h-7 skeleton rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="mb-3 w-28 h-3 skeleton rounded" />
                  <div className="mb-1 w-1/2 h-2 skeleton rounded" />
                  <div className="w-1/2 h-2 skeleton rounded" />
                </div>
              </div>
            );
          })
        : commentsData.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              postUserId={postItem.user.id}
              currentUser={user}
              onReply={handleReply}
              onLike={handleLike}
              onLikeReply={handleLikeReply}
              users={users}
              companies={companies}
            />
          ))}
      
      {hasMore && !isLoading && (
        <div className="mt-4 mb-4 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                Load More Comments
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Comment input at the bottom - matches your design */}
      <div className="mt-4 flex items-center gap-2 border rounded-full px-4 py-3 bg-white">
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-3 5a4 4 0 01-3.464-2H6a1 1 0 110-2h.465a4 4 0 016.07 0H13a1 1 0 110 2h-.536A4 4 0 0110 14z"/>
          </svg>
        </button>
        <input
          type="text"
          placeholder="Type your comment here"
          value={commentData.text}
          onChange={(e) => setCommentData({ ...commentData, text: e.target.value })}
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
          disabled={loading || commentData.text.trim().length < 1}
          className="text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          )}
        </button>
      </div>
    </section>
  );
};

const CommentBlock = ({ comment, postUserId }) => {
  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <Link to={`/co/${comment?.user?.id}`}>
          <Avatar
            name={`${comment.user.first_name} ${comment.user.last_name}`}
            className={clsx(avatarStyle)}
            src={comment.user.avatar}
            size="sm"
          />
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <h5 className="font-bold text-sm">
              <Link to={`/co/${comment?.user?.id}`}>
                {comment.user.first_name} {comment.user.last_name}
              </Link>
              {comment.user.id === postUserId && (
                <span className="text-[.65rem] text-gray-400 font-medium">
                  (author)
                </span>
              )}
            </h5>
            <span className="text-gray-400 text-xs">
              &bull; <TimeAgo time={comment.commented_at} />
            </span>
          </div>
          <MarkdownComponent
            markdownContent={comment.content}
            className="text-sm text-gray-600 mt-1"
          />
        </div>
      </div>
    </div>
  );
};

const MemoizedCommentBlock = memo(CommentBlock);

export const DiscoverPostSkeleton = ({ hasImage }) => {
  return (
    <div
      className={clsx("border-t border-gray-200 p-3", {
        "bg-gray-100 !border-0 rounded-md": hasImage,
      })}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-full skeleton" />
          <div className="flex flex-col gap-1">
            <div className="h-4 w-24 skeleton rounded-md" />
            <div className="h-3 w-40 skeleton rounded-md" />
          </div>
        </div>
        <div className="h-6 w-6 skeleton rounded-md" />
      </header>

      <div className="mt-2 space-y-2">
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-3/4 skeleton rounded-md" />
      </div>

      {hasImage && (
        <section className="grid grid-cols-3 gap-2 mt-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="size-full rounded-lg skeleton" />
          ))}
        </section>
      )}

      <div className="flex items-center gap-2 justify-between mt-6">
        <ConjoinedAvatarSkeleton />
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="size-6 skeleton rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ConjoinedAvatarSkeleton = ({ length = 5 }) => {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex -space-x-1 hover:space-x-1">
        {[...Array(length)].map((_, index) => (
          <div
            key={index}
            className="size-8 skeleton rounded-full border border-white transition-all duration-300"
          />
        ))}
      </div>
    </div>
  );
};

// Quick Comment Input Component
const QuickCommentInput = ({ postItem, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleQuickComment = async () => {
    if (commentText.trim().length < 1) return;

    setLoading(true);
    try {
      const newComment = await commentOnPost(
        postItem.id,
        commentText,
        [], // No mentions in quick comment
        [], // No company mentions
        null // Commenting as user
      );

      if (newComment.id) {
        toast.success('Comment added!');
        setCommentText('');
        onCommentAdded && onCommentAdded();
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickComment();
    }
  };

  return (
    <div className="mt-4 flex items-center gap-2 border rounded-full px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors">
      <button className="text-gray-400 hover:text-gray-600">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-3 5a4 4 0 01-3.464-2H6a1 1 0 110-2h.465a4 4 0 016.07 0H13a1 1 0 110 2h-.536A4 4 0 0110 14z"/>
        </svg>
      </button>
      <input
        type="text"
        placeholder="Type your comment here"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
      />
      <button
        onClick={handleQuickComment}
        disabled={loading || commentText.trim().length < 1}
        className="text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
        )}
      </button>
    </div>
  );
};