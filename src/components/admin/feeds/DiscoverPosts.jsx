import {  } from "@ant-design/icons";
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
// import PDFPreview from "../../PDFPreview";
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
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill={liked ? "currentColor" : "none"}
    xmlns="http://www.w3.org/2000/svg"
    className={`w-5 h-5 group-hover:scale-110 transition-transform ${liked ? 'text-red-500' : ''}`}
  >
    <path 
      d="M4.31802 6.31802C2.56066 8.07538 2.56066 10.9246 4.31802 12.682L12.0001 20.364L19.682 12.682C21.4393 10.9246 21.4393 8.07538 19.682 6.31802C17.9246 4.56066 15.0754 4.56066 13.318 6.31802L12.0001 7.63609L10.682 6.31802C8.92462 4.56066 6.07538 4.56066 4.31802 6.31802Z" 
      stroke={liked ? "none" : "currentColor"}
      fill={liked ? "currentColor" : "none"}
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
  <span className="text-sm font-medium">{formatNumber(likes)}</span>
</button>

          <Link to={`/feed/posts/${postItem.id}`}>
  <button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 transition-colors group">
    <svg 
      width="18" 
      height="17" 
      viewBox="0 0 18 17" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="group-hover:scale-110 transition-transform"
    >
      <path 
        d="M8.18848 0.5C12.7416 0.5 16.2975 4.43494 15.8379 8.96484L15.6299 11.0127L15.2568 13.2207L15.209 13.5068L15.4326 13.6904L16.8291 14.8379L11.1963 15.7627L8.72754 15.9258C4.27508 16.2183 0.5 12.6689 0.5 8.2041C0.500072 3.95667 3.94353 0.500028 8.18848 0.5Z" 
        stroke="currentColor"
      />
    </svg>
    <span className="text-sm font-medium">{formatNumber(commentsLength)}</span>
  </button>
</Link>

          <CustomShareButton
  shareData={shareData}
  url={shareUrlString}
  modalTitle="Share post to"
>
  <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-500 transition-colors group">
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="group-hover:scale-110 transition-transform"
    >
      <path 
        d="M15.2118 5.74645L3.29142 9.7199C2.8217 9.87743 2.412 10.176 2.11816 10.5749C1.82433 10.9738 1.66067 11.4536 1.6495 11.9489C1.63833 12.4442 1.78019 12.9309 2.05573 13.3426C2.33128 13.7544 2.72711 14.0711 3.18924 14.2496L7.59978 15.9355C7.70438 15.9783 7.79942 16.0415 7.87934 16.1214C7.95926 16.2013 8.02245 16.2964 8.06524 16.401L9.75112 20.8115C9.89496 21.1862 10.1302 21.5189 10.4353 21.7796C10.7405 22.0402 11.1059 22.2204 11.4985 22.3039C11.891 22.3874 12.2982 22.3714 12.683 22.2575C13.0678 22.1436 13.418 21.9353 13.7019 21.6516C13.965 21.3832 14.1648 21.0593 14.2865 20.7037L18.26 8.7833C18.4001 8.35961 18.4197 7.90533 18.3166 7.47115C18.2136 7.03697 17.9919 6.63995 17.6763 6.32441C17.3608 6.00886 16.9638 5.7872 16.5296 5.68414C16.0954 5.58109 15.6411 5.60069 15.2175 5.74077L15.2118 5.74645ZM16.733 8.27811L14.7463 14.2383L12.7596 20.1985C12.7053 20.3529 12.6052 20.4871 12.4725 20.583C12.3398 20.6789 12.181 20.732 12.0173 20.7351C11.8536 20.7382 11.6929 20.6911 11.5567 20.6003C11.4206 20.5095 11.3154 20.3791 11.2554 20.2268L9.5638 15.822C9.54065 15.7637 9.51412 15.7069 9.48433 15.6517L13.3953 11.7407C13.5459 11.5901 13.6305 11.386 13.6305 11.1731C13.6305 10.9601 13.5459 10.756 13.3953 10.6054C13.2448 10.4549 13.0406 10.3703 12.8277 10.3703C12.6148 10.3703 12.4106 10.4549 12.2601 10.6054L8.34906 14.5164C8.29389 14.4866 8.23703 14.4601 8.17876 14.437L3.77391 12.7454C3.62161 12.6854 3.4913 12.5802 3.40046 12.444C3.30962 12.3078 3.26259 12.1471 3.26568 11.9834C3.26877 11.8197 3.32183 11.6609 3.41774 11.5283C3.51365 11.3956 3.64783 11.2954 3.80229 11.2412L15.7226 7.26771C15.8633 7.22237 16.0137 7.21671 16.1573 7.25136C16.3009 7.28601 16.4322 7.35962 16.5367 7.46409C16.6411 7.56857 16.7147 7.69984 16.7494 7.84347C16.784 7.98709 16.7784 8.13749 16.733 8.27811Z" 
        fill="currentColor"
      />
    </svg>
    <span className="text-sm font-medium">{formatNumber(postItem?.shares || 20)}</span>
  </button>
</CustomShareButton>

          {/* <PDFPreview
            postBody={postItem?.body}
            postTitle={postTitle}
            postImages={postItem.images}
          /> */}
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