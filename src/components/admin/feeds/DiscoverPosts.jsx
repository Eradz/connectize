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
import { Link } from "react-router";
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
}) => {
  const [showCommentSection, setShowCommentSection] = useState(false);
  const {
    data: comments,
    refetch: refetchComments,
    isLoading: isLoadingComments,
  } = useGetPostComments(
    { postId: postItem.id },
    {
      enabled: showCommentSection,
    }
  );

  const { setRefetchInterval } = useCustomQuery();
  const { user: currentUser } = useAuth();

  const postTitle = `Connectize Post by ${
    postItem?.user?.full_name
  } | ${capitalizeFirst(postItem?.company?.company_name)} Company`;

  // const userHasLikedPost = postItem?.likes.find(
  //   (post) => post?.user?.id === currentUser?.id
  // )
  //   ? true
  //   : false;

  const [commentsLength, setCommentsLength] = useState(
    () => postItem.numberOfComments || 0
  );

  const recentLikes = postItem?.likes;
  const [liked, setLiked] = useState(() => !!postItem?.isLikedByUser);
  const [likes, setLikes] = useState(() => postItem?.numberOfLikes || 0);
  const [disabled, setDisabled] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (isLoadingComments || !comments) return;
    setCommentsLength(comments?.length);
  }, [comments?.length]);

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
    // url: shareUrlString,
  };

  // const sharePost = async () => await shareThis({ shareUrlString, shareData });

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
              {/* <ButtonWithTooltipIcon
                text="Convert to draft"
                IconName={ChangeCircleOutlined}
              /> */}
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

      <FormatPostText
        text={postItem?.body}
        postId={postItem?.id}
        isSinglePost={isSinglePost}
      />

      {hasImage && <PostImageCollage images={postItem.images} />}

      <SocialShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        title={`Share to`}
        url={""}
        // footerContent={<></>}
      ></SocialShareModal>

      <div className="flex items-center gap-2 justify-between mt-4">
        <ConJoinedImages
          size={30}
          array={recentLikes?.map((post) => ({
            name: `${post?.user?.first_name} ${post?.user?.last_name}`,
            src: post?.user?.avatar,
            href: `/co/${post?.user?.id}`,
          }))}
          sizeVariant="sm"
        />

        <div className="flex items-center gap-3">
          <ButtonWithTooltipIcon
            IconName={MessageOutlined}
            tip="Comments"
            textClassName="!text-[.6rem]"
            text={formatNumber(commentsLength)}
            onClick={() => setShowCommentSection(!showCommentSection)}
          />
          <ButtonWithTooltipIcon
            IconName={liked ? Heart : HeartIcon}
            tip={liked ? "Unlike post" : "Like post"}
            onClick={handleLikePost}
            textClassName="!text-[.6rem]"
            disabled={disabled}
            text={formatNumber(likes)}
          />

          <PDFPreview
            postBody={postItem?.body}
            postTitle={postTitle}
            postImages={postItem.images}
          />

          <CustomShareButton
            shareData={shareData}
            url={shareUrlString}
            modalTitle="Share post to"
          >
            <ButtonWithTooltipIcon
              IconName={ShareAltOutlined}
              tip="Share post"
              // onClick={sharePost}
              // onClick={() => setIsSharing(true)}
            />
          </CustomShareButton>
        </div>
      </div>

      <CommentSection
        showCommentSection={showCommentSection}
        setShowCommentSection={setShowCommentSection}
        commentsData={comments}
        postItem={postItem}
        refetchComments={refetchComments}
        isLoading={isLoadingComments}
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

/**
 * @todo the refechPosts fuction actuall fetches all the posts again when a user adds a comment. Instead make this process optimistc and optimise it for speed
 * @param {*} param0
 * @returns
 */
const CommentSection = ({
  showCommentSection,
  setShowCommentSection,
  commentsData = [],
  isLoading,
  // setCommentsLength.
  postItem,
  refetchComments,
}) => {
  const [commentData, setCommentData] = useState({ text: '', mentions: [], html: '', editorState: '' });
  const [loading, setLoading] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // Key to force editor reset
  
  // State for comment as user/company selection
  const [commentAsType, setCommentAsType] = useState('user'); // 'user' or 'company'
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  
  const { setRefetchInterval } = useCustomQuery();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch users and companies for mention autocomplete
  const { users, loading: usersLoading, error: usersError } = useUserSearch();
  const { companies, loading: companiesLoading, error: companiesError } = useCompanySearch();
  
  // Debug logging for mention data
  useEffect(() => {
    console.log('📥 Mention Data Loaded:', { 
      users: users?.length || 0, 
      companies: companies?.length || 0,
      usersLoading,
      companiesLoading,
      usersError: usersError ? usersError.message : null,
      companiesError: companiesError ? companiesError.message : null
    });
  }, [users, companies, usersLoading, companiesLoading, usersError, companiesError]);
  
  // Fetch companies owned by current user
  const { companies: userCompanies } = useUserCompanies(user?.id);

  // Handle selection change from CommentAsSelector
  const handleCommentAsChange = useCallback((type, companyId) => {
    setCommentAsType(type);
    setSelectedCompanyId(companyId);
    console.log('💬 Comment as:', type, companyId ? `Company ID: ${companyId}` : 'Personal');
  }, []);

  const handleComment = useCallback(async () => {
    if (commentData.text.trim().length < 1) return;

    setLoading(true);
    try {
      // Pass selectedCompanyId if commenting as company
      const companyIdForComment = commentAsType === 'company' ? selectedCompanyId : null;
      
      const newComment = await commentOnPost(
        postItem.id, 
        commentData.text, 
        commentData.mentions || [],
        commentData.companyMentions || [],
        companyIdForComment // Pass the company ID if commenting as company
      );
      const { id } = newComment;

      queryClient.setQueryData(
        ["comments", { postId: postItem.id }],
        (oldComments) => {
          return [...oldComments, newComment];
        }
      );

      refetchComments().catch((e) =>
        console.log("Could not update to latest comments")
      );
      if (id) {
        const commentedAs = commentAsType === 'company' 
          ? userCompanies.find(c => c.id === selectedCompanyId)?.company_name 
          : 'you';
        toast.success(`Comment added as ${commentedAs}`);
      }

      // Reset the editor by changing its key
      setCommentData({ text: '', mentions: [], html: '', editorState: '' });
      setEditorKey(prev => prev + 1); // Force editor to remount and clear
    } catch (error) {
      toast.error("Failed to submit the comment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [commentData, postItem, queryClient, refetchComments, commentAsType, selectedCompanyId, userCompanies]);

  const handleReply = useCallback(async (commentId, replyData) => {
    if (!replyData.text?.trim()) return;
    
    try {
      await replyToComment(
        commentId,
        replyData.text,
        replyData.userMentions || [],
        replyData.companyMentions || [],
        replyData.parentReplyId || null  // NEW: Pass parent reply ID for nested replies
      );
      
      // Refetch comments to show new reply
      refetchComments();
      toast.success("Reply added!");
    } catch (error) {
      console.error('Failed to reply:', error);
      toast.error("Failed to post reply");
    }
  }, [refetchComments]);

  const handleLike = useCallback(async (commentId, hasLiked = false) => {
    try {
      // TODO: Allow users to like as their company
      // For now, always like as user (company_id = null)
      await likeComment(commentId, hasLiked, null);
      
      // Refetch comments to update like counts
      refetchComments();
      toast.success(hasLiked ? "Unliked!" : "Liked!");
    } catch (error) {
      console.error('Failed to like comment:', error);
      toast.error("Failed to like comment");
    }
  }, [refetchComments]);

  const handleLikeReply = useCallback(async (replyId, hasLiked = false) => {
    try {
      // TODO: Allow users to like as their company
      // For now, always like as user (company_id = null)
      await likeReply(replyId, hasLiked, null);
      
      // Refetch comments to update like counts
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

  return (
    <section
      className={clsx("transition-all duration-300", {
        "mt-4": showCommentSection,
        "h-0 opacity-0": !showCommentSection,
      })}
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-bold text-lg">Comments</h2>
        <CloseButton
          className="!text-xs"
          onClick={() => setShowCommentSection(false)}
        />
      </div>

      {isLoading
        ? Array.from({ length: 3 }, (i) => {
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
      <div className="mt-4 border-t pt-4">
        {/* Comment as selector - only shows if user has companies */}
        <CommentAsSelector
          user={user}
          userCompanies={userCompanies}
          selectedType={commentAsType}
          selectedCompanyId={selectedCompanyId}
          onSelectionChange={handleCommentAsChange}
        />
        
        <LexicalCommentEditor
          key={editorKey}
          onChange={setCommentData}
          placeholder="Write a comment..."
          users={users}
          companies={companies}
        />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-400">
            Type @ to mention users or companies • Cmd/Ctrl+Enter to submit
          </p>
          <button
            className="bg-gold disabled:bg-gray-300 hover:bg-custom_yellow text-sm px-6 py-2 active:scale-95 disabled:active:scale-100 transition-all duration-300 rounded disabled:cursor-not-allowed font-medium"
            onClick={handleComment}
            disabled={loading || commentData.text.trim().length < 1}
          >
            {loading ? "Commenting..." : "Comment"}
          </button>
        </div>
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

// export function ButtonWithTooltipIcon({
//   IconName,
//   text,
//   onClick,
//   tip,
//   className,
//   tooltipClassName,
//   iconClassName,
//   textClassName,
//   loading = false,
//   disabled = false,
//   thisKey,
//   hasArrow = false,
//   type = "button",
// }) {
//   return (
//     <Tooltip
//       label={loading ? "" : tip}
//       fontSize="12"
//       placement="auto"
//       className={clsx(
//         "!rounded-md !bg-white !text-custom_blue border mx-3 text-sm",
//         tooltipClassName
//       )}
//       hasArrow={hasArrow}
//       colorScheme="whiteAlpha"
//     >
//       <button
//         type={type}
//         onClick={onClick}
//         disabled={loading || disabled}
//         className={clsx(
//           "flex items-center text-sm gap-1 bg-transparent text-gray-600 hover:text-custom_blue active:scale-95 transition-all duration-300 overflow-hidden disabled:cursor-not-allowed",
//           className
//         )}
//       >
//         {IconName && !loading && (
//           <IconName
//             className={clsx("", iconClassName, {
//               "xs:!size-4 !size-6 xs:!text-[14px] !text-[20px]": !iconClassName,
//             })}
//           />
//         )}
//         {loading && <Spinner size="xs" className="text-gold" />}
//         {text && (
//           <motion.span
//             initial={{ y: 30, opacity: 0.25 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -30, opacity: 0.25 }}
//             key={thisKey || text}
//             className={`${textClassName} overflow-hidden`}
//           >
//             {text}
//           </motion.span>
//         )}
//       </button>
//     </Tooltip>
//   );
// }

export const DiscoverPostSkeleton = ({ hasImage }) => {
  return (
    <div
      className={clsx("border-t border-gray-200 p-3", {
        "bg-gray-100 !border-0 rounded-md": hasImage,
      })}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Placeholder for logo */}
          <div className="size-10 rounded-full skeleton" />

          <div className="flex flex-col gap-1">
            {/* Placeholder for company name */}
            <div className="h-4 w-24 skeleton rounded-md" />
            {/* Placeholder for small text */}
            <div className="h-3 w-40 skeleton rounded-md" />
          </div>
        </div>

        {/* Placeholder for More Options */}
        <div className="h-6 w-6 skeleton rounded-md" />
      </header>

      {/* Placeholder for post body */}
      <div className="mt-2 space-y-2">
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-3/4 skeleton rounded-md" />
      </div>

      {/* Placeholder for images */}
      {hasImage && (
        <section className="grid grid-cols-3 gap-2 mt-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="size-full rounded-lg skeleton" />
          ))}
        </section>
      )}

      {/* Placeholder for footer */}
      <div className="flex items-center gap-2 justify-between mt-6">
        {/* Placeholder for joined images */}
        <ConjoinedAvatarSkeleton />

        {/* Placeholder for action buttons */}
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
      {/* Placeholder for joined images */}
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
