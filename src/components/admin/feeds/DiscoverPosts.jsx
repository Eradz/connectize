import { MessageOutlined, RetweetOutlined, ShareAltOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  CloseButton,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { HeartIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { motion } from "framer-motion";
import { BarChart3, Radio } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { toast } from "sonner";
import {
  commentOnPost,
  deletePost,
  editPost,
  likePost,
  likeComment,
  replyToComment,
  likeReply,
  updateComment,
  deleteComment,
  updateReply,
  deleteReply,
  repostPost,
  unrepostPost,
  getPostReposts,
} from "../../../api-services/posts";
import { useCustomQuery } from "../../../context/queryContext";
import { useAuth } from "../../../context/userContext";
import { useCompanySearch } from "../../../hooks/useCompanySearch";
import { useGetActionableCompanies } from "../../../hooks";
import {
  usePollPosts,
  usePollCompanyPosts,
  usePollFollowingPosts,
  usePollTrendingPosts,
} from "../../../hooks/usePolling";
import { useUserSearch } from "../../../hooks/useUserSearch";
import { Heart } from "../../../icon";
import { capitalizeFirst, formatNumber } from "../../../lib/utils";
import CompanyName from "../../company/CompanyName";
import ReusableModal from "../../custom/ResusableModal";
import FormatPostText from "../../FormatPostText";
import { MarkdownComponent } from "../../MarkDownComponent";
import MoreOptions from "../../MoreOptions";
import PingModal from "../../PingModal";
import LightParagraph from "../../ParagraphText";
import PDFPreview from "../../PDFPreview";
import PostImageCollage from "../../PostImageCollage";
import { avatarStyle, ConJoinedImages } from "../../ResponsiveNav";
import SEO from "../../SEO";
import TimeAgo from "../../TimeAgo";

import SocialShareModal from "../../CustomShareButton";
import CustomShareButton from "../../CustomShareButton";
import { useGetPostComments } from "../../../hooks/useComments";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CommentThread from "../../comments/CommentThread";
import LexicalCommentEditor from "../../comments/LexicalCommentEditor";
import CommentAsSelector from "../../comments/CommentAsSelector";
import { webRoutes } from "../../../lib/webRoutes";

// Large starting index so Virtuoso can absorb prepended (newly polled) posts
// by decrementing firstItemIndex without the value ever going negative.
const FEED_START_INDEX = 1_000_000;

// Rendered by Virtuoso below the list; reads live query state via context.
const FeedFooter = ({ context }) => {
  if (!context) return null;
  if (context.isFetchingNextPage) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="md" color="blue.500" />
        <LightParagraph className="ml-2">Loading more posts...</LightParagraph>
      </div>
    );
  }
  if (!context.hasNextPage && context.hasItems) {
    return (
      <div className="text-center py-6">
        <LightParagraph className="text-gray-500">
          You&apos;ve reached the end! No more posts to load.
        </LightParagraph>
      </div>
    );
  }
  return null;
};

function DiscoverPosts({
  searchArray,
  isSearch,
  searchLoading,
  companyName = null,
  companyId = null,
  feedType = "discover", // "discover" | "following" | "trending"
}) {
  // Only the active feed's query is enabled - the others stay cached but idle,
  // so switching tabs is instant without triple-polling the API.
  const isFollowingFeed = !companyId && feedType === "following";
  const isTrendingFeed = !companyId && feedType === "trending";
  const isDiscoverFeed = !companyId && !isFollowingFeed && !isTrendingFeed;

  const discoverQuery = usePollPosts(30000, { enabled: isDiscoverFeed });
  const companyQuery = usePollCompanyPosts(companyId);
  const followingQuery = usePollFollowingPosts(30000, { enabled: isFollowingFeed });
  const trendingQuery = usePollTrendingPosts(30000, { enabled: isTrendingFeed });

  const {
    data: posts,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = companyId
    ? companyQuery
    : isFollowingFeed
    ? followingQuery
    : isTrendingFeed
    ? trendingQuery
    : discoverQuery;
  // Debug logging
  if (error) {
    console.error("❌ [DiscoverPosts] Error loading posts:", error);
  }
   const observerRef = useRef();
  const lastPostRef = useRef();
  const finalArray = isSearch
    ? searchArray
    : companyId
    ? posts?.pages?.flatMap(page => page.posts)
    : companyName
    ? posts?.pages?.flatMap(page => page.posts)?.filter(
        (post) =>
          post?.company?.company_name?.toLowerCase() ===
          companyName?.toLowerCase()
      )
    : posts?.pages?.flatMap(page => page.posts);
  const postLoading = isSearch ? searchLoading : isLoading;
  const { users: mentionUsers = [] } = useUserSearch({ enabled: !postLoading });
  const { companies: mentionCompanies = [] } = useCompanySearch({ enabled: !postLoading });

  // ── Virtualization (discover / following / trending feeds only) ──
  // Search and company-profile feeds keep the simple mapped rendering.
  const isMainFeed = !isSearch && !companyId && !companyName;
  const virtuosoRootRef = useRef(null);
  const [scrollParent, setScrollParent] = useState(null);

  // Virtuoso needs the real scrolling ancestor (the AppLayout content div),
  // since the page — not the list — owns the scroll.
  useEffect(() => {
    if (!isMainFeed) return;
    let el = virtuosoRootRef.current?.parentElement;
    while (el && el !== document.body) {
      const overflowY = getComputedStyle(el).overflowY;
      if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
        setScrollParent(el);
        return;
      }
      el = el.parentElement;
    }
    setScrollParent(null);
  }, [isMainFeed]);

  // Keep the scroll position anchored when polling prepends new posts to the
  // top: decrement firstItemIndex by the number of newly prepended items.
  const [firstItemIndex, setFirstItemIndex] = useState(FEED_START_INDEX);
  const prevFirstIdRef = useRef(null);
  const feedKeyRef = useRef(null);

  useEffect(() => {
    if (!isMainFeed) return;
    const feedKey = `${feedType}:${companyId || ""}`;
    const items = finalArray || [];
    const newFirstId = items[0]?.id ?? null;

    // Reset when the active feed (tab) changes.
    if (feedKeyRef.current !== feedKey) {
      feedKeyRef.current = feedKey;
      prevFirstIdRef.current = newFirstId;
      setFirstItemIndex(FEED_START_INDEX);
      return;
    }
    const prevFirstId = prevFirstIdRef.current;
    if (newFirstId != null && prevFirstId != null && newFirstId !== prevFirstId) {
      const prepended = items.findIndex((p) => p?.id === prevFirstId);
      if (prepended > 0) setFirstItemIndex((current) => current - prepended);
    }
    prevFirstIdRef.current = newFirstId;
  }, [finalArray, feedType, companyId, isMainFeed]);

  const renderPostItem = useCallback(
    (_index, post) => (
      <div className="w-full pb-1.5 md:pb-6">
        <DiscoverPostItem
          hasImage={post?.images?.length > 0}
          postItem={post}
          mentionUsers={mentionUsers}
          mentionCompanies={mentionCompanies}
        />
      </div>
    ),
    [mentionUsers, mentionCompanies]
  );

   // Infinite scroll observer
  useEffect(() => {
    if (isSearch || (companyName && !companyId)) return; // Disable infinite scroll for client-filtered views

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isSearch, companyName, companyId, feedType]);

  // Tab-specific empty states (mirrors the mobile app's copy)
  const emptyCopy = isFollowingFeed
    ? {
        title: "No Posts From People You Follow",
        body: "Posts from users and companies you follow will appear here. Discover interesting people and companies to follow!",
      }
    : isTrendingFeed
    ? {
        title: "No Trending Posts Yet",
        body: "Posts with the most engagement over the last few days will appear here.",
      }
    : {
        title: "No Posts Yet",
        body: "There are no posts to display. Start sharing your thoughts to get the conversation going!",
      };

  return (
    <section ref={virtuosoRootRef} className="w-full space-y-1.5 md:space-y-6 mt-6">
      {postLoading ? (
        Array.from({ length: 5 }, (_, index) => (
          <DiscoverPostSkeleton key={index} />
        ))
      ) : error ? (
        <LightParagraph>
          Failed to load posts. Please try again.
        </LightParagraph>
      ) : finalArray?.length < 1 ? (
        <LightParagraph>
          {isSearch ? "No post found in search" : 
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="16" width="48" height="36" rx="4" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
                <circle cx="24" cy="28" r="4" fill="#D1D5DB"/>
                <path d="M8 44L24 28L40 40L56 24" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyCopy.title}</h3>
            <p className="text-gray-600 text-center max-w-sm mb-6">
              {emptyCopy.body}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#FFD700' }}
            >
              Refresh Feed
            </button>
          </div>
        }
        </LightParagraph>
      ) : isMainFeed && scrollParent ? (
        <Virtuoso
          data={finalArray}
          firstItemIndex={firstItemIndex}
          computeItemKey={(_index, post) => post?.id ?? _index}
          itemContent={renderPostItem}
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          overscan={800}
          increaseViewportBy={{ top: 400, bottom: 800 }}
          customScrollParent={scrollParent}
          context={{
            isFetchingNextPage,
            hasNextPage,
            hasItems: finalArray?.length > 0,
          }}
          components={{ Footer: FeedFooter }}
        />
      ) : (
        <>
          {finalArray?.map((post, index) => (
            <div
              key={post.id}
              ref={index === finalArray.length - 1 ? lastPostRef : null}
              // content-visibility lets the browser skip rendering/layout/paint
              // for off-screen posts, so scrolling stays fast no matter how many
              // posts have accumulated. contain-intrinsic-size keeps the
              // scrollbar stable (auto remembers each post's real height).
              className="w-full [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
            >
              <DiscoverPostItem
                hasImage={post?.images?.length > 0}
                key={post?.id || index}
                postItem={post}
                mentionUsers={mentionUsers}
                mentionCompanies={mentionCompanies}
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
          {!hasNextPage && !isSearch && finalArray?.length > 0 && (
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

const createEmptyCommentContent = () => ({
  text: "",
  plainText: "",
  mentions: [],
  companyMentions: [],
});

/**
 * Quote-repost comments are stored as plain text with @tokens, but a few
 * legacy rows contain Lexical HTML. Strip tags defensively so both formats
 * render the same through MarkdownComponent.
 */
const stripHtmlTags = (value) => {
  const text = String(value || "");
  if (!/<\/?[a-z][^>]*>/i.test(text)) return text;
  // Preserve paragraph/line breaks before dropping tags
  const withBreaks = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n");
  const doc = new DOMParser().parseFromString(withBreaks, "text/html");
  return (doc.body.textContent || "").trim();
};

/** Display name for a repost row (company reposts win over the user). */
const getRepostAuthorName = (repost = {}) =>
  repost.company?.company_name ||
  repost.company?.name ||
  repost.user?.full_name ||
  `${repost.user?.first_name || ""} ${repost.user?.last_name || ""}`.trim();

/** Muted placeholder shown where a repost's original post used to be. */
const DeletedParentNotice = ({ className }) => (
  <div
    className={clsx(
      "border border-gray-200 bg-gray-50 rounded-lg p-4 text-sm text-gray-500",
      className
    )}
  >
    This post is no longer available
  </div>
);

/**
 * One-level embed of the original post inside a quote repost.
 * Clicking anywhere on it (except links/buttons) opens the parent's post page.
 */
const ParentPostEmbed = ({
  parentPost,
  mentionUsers = [],
  mentionCompanies = [],
}) => {
  const navigate = useNavigate();

  if (!parentPost) return <DeletedParentNotice className="mt-2" />;

  const authorName =
    parentPost?.company?.company_name ||
    parentPost?.user?.full_name ||
    `${parentPost?.user?.first_name || ""} ${
      parentPost?.user?.last_name || ""
    }`.trim();

  const openParent = (event) => {
    if (event?.target?.closest?.("a, button")) return;
    navigate(webRoutes.singlePost.replace(":id", parentPost.id));
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openParent}
      onKeyDown={(event) => {
        if (event.key === "Enter") openParent(event);
      }}
      className="mt-2 border border-gray-200 rounded-lg p-3 xs:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar
          name={
            parentPost?.company?.company_name || parentPost?.user?.first_name
          }
          size="xs"
          src={parentPost?.company?.logo || parentPost?.user?.avatar}
          className={avatarStyle}
        />
        <CompanyName
          name={authorName || "Unknown"}
          verified={
            parentPost?.company?.verified ??
            parentPost?.company?.verify ??
            parentPost?.user?.verified
          }
          company={!!parentPost?.company}
          userId={parentPost?.user?.id}
          slug={parentPost?.company?.slug}
        />
        {parentPost?.date_created && (
          <small className="text-gray-400 shrink-0">
            • <TimeAgo time={parentPost.date_created} />
          </small>
        )}
      </div>
      {parentPost?.body && (
        <div className="line-clamp-4">
          <MarkdownComponent
            markdownContent={stripHtmlTags(parentPost.body)}
            className="text-sm !text-gray-800"
            mentionUsers={[parentPost?.user, ...mentionUsers].filter(Boolean)}
            mentionCompanies={[parentPost?.company, ...mentionCompanies].filter(
              Boolean
            )}
          />
        </div>
      )}
      {parentPost?.images?.length > 0 && (
        <PostImageCollage images={parentPost.images} />
      )}
    </div>
  );
};

export const DiscoverPostItem = ({
  postItem = {},
  hasImage = false,
  isSinglePost = false,
  mentionUsers = [],
  mentionCompanies = [],
}) => {
  const [showCommentSection, setShowCommentSection] = useState(false);

  // ---- Repost model: reposts are first-class child posts ----
  // post.is_repost + post.parent_post (one-level embed or null when the
  // original was deleted). The reposter is this post's own author.
  const isRepost = !!postItem?.is_repost;
  const parentPost = isRepost ? postItem?.parent_post || null : null;
  // Quote text is plain text with @tokens; strip legacy Lexical HTML defensively
  const quoteText = isRepost ? stripHtmlTags(postItem?.body).trim() : "";
  const isQuoteRepost = isRepost && quoteText.length > 0;
  const isPlainRepost = isRepost && !isQuoteRepost;
  const isParentDeleted = isRepost && !parentPost;
  // Plain reposts proxy content AND every interaction (like/comment/repost/
  // share/counts) to the PARENT post; normal posts and quote reposts act on
  // themselves.
  const activePost = (isPlainRepost && parentPost) || postItem;

  const navigate = useNavigate();
  const goToPost = (id) => (event) => {
    if (!id) return;
    // Don't hijack clicks on links, buttons or interactive media in the card
    if (event?.target?.closest?.("a, button, img, video")) return;
    navigate(webRoutes.singlePost.replace(":id", id));
  };

  // Use preview_comments from post data initially - instant display!
  const previewComments = activePost?.preview_comments || [];
  const totalComments = activePost?.numberOfComments || 0;
  const hasMoreComments = totalComments > previewComments.length;
  
  // Show all comments (switch from preview to full list)
  const [showAllComments, setShowAllComments] = useState(false);
  
  // Background prefetch: Start loading ALL comments when comment section opens
  // This way they're ready when user clicks "Load more"
  const {
    data: allCommentsData,
    refetch: refetchComments,
    isLoading: isLoadingMoreComments,
    isFetched: commentsFetched,
  } = useGetPostComments(
    { postId: activePost?.id },
    {
      // Start fetching in background when comments section is shown AND there are more comments
      enabled: showCommentSection && hasMoreComments,
      staleTime: 30000, // Cache for 30 seconds
    }
  );
  
  // Use fetched comments if available, otherwise use preview
  // Automatically show all comments once they're fetched (no need to click button)
  const comments = allCommentsData?.results && commentsFetched
    ? allCommentsData.results 
    : previewComments;
  
  // Check if more comments are ready to show (prefetched in background)
  const moreCommentsReady = commentsFetched && allCommentsData?.results;
  
  // Auto-show all comments when they're ready
  useEffect(() => {
    if (moreCommentsReady && !showAllComments) {
      setShowAllComments(true);
    }
  }, [moreCommentsReady, showAllComments]);

  const { setRefetchInterval } = useCustomQuery();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Reposter attribution for the compact "{reposter} reposted" header
  const reposterIsCompany = !!postItem?.company;
  const reposterName = reposterIsCompany
    ? postItem?.company?.company_name
    : postItem?.user?.full_name ||
      `${postItem?.user?.first_name || ""} ${
        postItem?.user?.last_name || ""
      }`.trim();
  const reposterHref = reposterIsCompany
    ? `/${postItem?.company?.slug || postItem?.company?.company_name || ""}`
    : `/co/${postItem?.user?.id}`;
  const isSelfRepost =
    !reposterIsCompany && !!postItem?.user?.id && postItem?.user?.id === currentUser?.id;

  const postTitle = `Connectize Post by ${
    activePost?.user?.first_name
  } | ${capitalizeFirst(activePost?.company?.company_name)} Company`;

  const [commentsLength, setCommentsLength] = useState(
    () => activePost?.numberOfComments || 0
  );

  const [liked, setLiked] = useState(() => !!activePost?.isLikedByUser);
  const [likes, setLikes] = useState(() => activePost?.numberOfLikes || 0);
  const [disabled, setDisabled] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Update comment count when loaded
  useEffect(() => {
    if (allCommentsData?.results) {
      setCommentsLength(allCommentsData.results.length);
    }
  }, [allCommentsData?.results]);

  const handleLikePost = async () => {
    const currentIsLiked = liked;
    setLiked(!currentIsLiked);
    setLikes((prev) => (!currentIsLiked ? prev + 1 : prev - 1));
    // setDisabled(true);
    try {
      // Any non-error (2xx) response is success — the backend is idempotent,
      // so "already liked/unliked" also comes back as 200. makeApiRequest
      // returns null/undefined instead of throwing when the request fails.
      const result = await likePost(activePost?.id, activePost, currentIsLiked);
      if (result == null) throw new Error("Like request failed");
    } catch (error) {
      // Roll back the optimistic update and re-sync this post's like state
      // from the server so the heart can't drift from what the backend holds.
      setLiked(currentIsLiked);
      setLikes((prev) => (!currentIsLiked ? prev - 1 : prev + 1));
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
    // setDisabled(false);
    setRefetchInterval(1000);
    setTimeout(() => setRefetchInterval(false), 2000);
  };
  // Repost state - mirrors the optimistic like-button pattern above.
  // For plain reposts these reflect (and mutate) the PARENT post.
  const [reposted, setReposted] = useState(() => !!activePost?.isRepostedByUser);
  const [reposts, setReposts] = useState(() => activePost?.numberOfReposts || 0);
  const [repostLoading, setRepostLoading] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteContent, setQuoteContent] = useState(createEmptyCommentContent);
  const [quoteEditorKey, setQuoteEditorKey] = useState(0);
  const [isQuoteSubmitting, setIsQuoteSubmitting] = useState(false);
  const [showRepostersModal, setShowRepostersModal] = useState(false);
  const {
    isOpen: isRepostMenuOpen,
    onOpen: onRepostMenuOpen,
    onClose: onRepostMenuClose,
  } = useDisclosure();

  // "Reposted by {first reposter} and N others" attribution — SINGLE POST
  // PAGE ONLY (feeds must not fire a per-card reposts request). Shares the
  // ["reposts", id] cache key with RepostersModal, so this fetches once and
  // opening the modal reuses the cached list.
  const { data: repostersPreview } = useQuery({
    queryKey: ["reposts", activePost?.id],
    queryFn: () => getPostReposts(activePost?.id),
    enabled: isSinglePost && !!activePost?.id && reposts > 0,
    staleTime: 30000,
  });
  const repostersList =
    repostersPreview?.results ||
    (Array.isArray(repostersPreview) ? repostersPreview : []);
  const firstReposterName = getRepostAuthorName(repostersList[0]);
  const totalReposters = repostersPreview?.count ?? repostersList.length;
  const otherReposterCount = Math.max(totalReposters - 1, 0);

  // Refresh every feed reading from the shared ["posts"] cache (discover feed,
  // following feed and the user/company profile feeds all consume this key),
  // plus the reposters list, so the NEW child repost appears in the feeds.
  // (The repost response's "post" payload is the child post; invalidating
  // ["posts"] re-fetches it at the top of the feed.)
  const invalidateFeedsAfterRepost = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["reposts", activePost?.id] });
  };

  const handleRepost = async (quote = "", mentions = [], companyMentions = []) => {
    onRepostMenuClose();
    setRepostLoading(true);
    setReposted(true);
    setReposts((prev) => prev + 1);
    try {
      // makeApiRequest returns null on failure (and toasts the API error itself)
      const result = await repostPost(activePost?.id, {
        comment: quote,
        mentions,
        companyMentions,
      });
      if (result === null) {
        setReposted(false);
        setReposts((prev) => prev - 1);
        return false;
      }
      toast.success("Reposted");
      invalidateFeedsAfterRepost();
      setRefetchInterval(1000);
      setTimeout(() => setRefetchInterval(false), 2000);
      return true;
    } catch (error) {
      setReposted(false);
      setReposts((prev) => prev - 1);
      toast.error("Failed to repost");
      console.error("Repost error:", error);
      return false;
    } finally {
      setRepostLoading(false);
    }
  };

  const handleUnrepost = async () => {
    onRepostMenuClose();
    setRepostLoading(true);
    setReposted(false);
    setReposts((prev) => Math.max(prev - 1, 0));
    try {
      const result = await unrepostPost(activePost?.id);
      if (result === null) {
        setReposted(true);
        setReposts((prev) => prev + 1);
        return;
      }
      toast.success("Repost removed");
      invalidateFeedsAfterRepost();
      setRefetchInterval(1000);
      setTimeout(() => setRefetchInterval(false), 2000);
    } catch (error) {
      setReposted(true);
      setReposts((prev) => prev + 1);
      toast.error("Failed to remove repost");
      console.error("Unrepost error:", error);
    } finally {
      setRepostLoading(false);
    }
  };

  // Kebab "Undo repost" on the reposter's own plain-repost feed item.
  // Unreposting the parent removes this child post server-side; when the
  // parent was deleted, delete the orphaned child repost directly instead.
  const handleUndoOwnRepost = async () => {
    if (parentPost?.id) {
      await handleUnrepost();
      return;
    }
    setRepostLoading(true);
    try {
      const result = await deletePost(postItem?.id);
      if (result === null) return;
      toast.success("Repost removed");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setRefetchInterval(1000);
      setTimeout(() => setRefetchInterval(false), 2000);
    } catch (error) {
      toast.error("Failed to remove repost");
      console.error("Undo repost error:", error);
    } finally {
      setRepostLoading(false);
    }
  };

  const handleQuoteRepost = async () => {
    if (!quoteContent.plainText?.trim()) return;
    setIsQuoteSubmitting(true);
    // Submit the PLAIN TEXT with @tokens (not Lexical HTML) — plain text is
    // the cross-platform canonical quote format (mobile renders it with a
    // plain-text MentionText component; web linkifies @tokens on render).
    // Mention/company-mention id arrays are still sent alongside.
    const success = await handleRepost(
      quoteContent.plainText.trim(),
      quoteContent.mentions || [],
      quoteContent.companyMentions || []
    );
    setIsQuoteSubmitting(false);
    if (success) {
      setQuoteContent(createEmptyCommentContent());
      setQuoteEditorKey((key) => key + 1);
      setShowQuoteModal(false);
    }
  };

  // Reset the quote editor whenever the modal closes (mirrors CommentSection)
  useEffect(() => {
    if (!showQuoteModal) {
      setQuoteContent(createEmptyCommentContent());
      setQuoteEditorKey((key) => key + 1);
    }
  }, [showQuoteModal]);

  // Plain reposts share the PARENT post's page; everything else shares itself
  const shareUrlString = window?.location?.hostname?.includes("localhost")
    ? `http://${window.location.hostname}:3000${webRoutes.singlePost.replace(":id", activePost?.id)}`
    : `https://${window.location.hostname}${webRoutes.singlePost.replace(":id", activePost?.id)}`;
  const shareData = {
    title: postTitle,
    text: activePost?.body,
    // url: shareUrlString,
  };

  // const sharePost = async () => await shareThis({ shareUrlString, shareData });

  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(postItem?.body);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);

  // Show edit/delete if user is the post author OR owns the company that posted
  const isPostOwner = postItem?.user?.id === currentUser?.id || 
    (postItem?.company?.id && currentUser?.companies?.includes(postItem.company.id));
  const postMentionUsers = useMemo(
    () =>
      [postItem?.user, parentPost?.user, ...(mentionUsers || [])].filter(
        Boolean
      ),
    [mentionUsers, postItem?.user, parentPost?.user]
  );
  const postMentionCompanies = useMemo(
    () =>
      [
        postItem?.company,
        parentPost?.company,
        ...(mentionCompanies || []),
      ].filter(Boolean),
    [mentionCompanies, postItem?.company, parentPost?.company]
  );

  // Live mention directories for the quote-repost editor (mirrors CommentSection)
  const { users: quoteLiveMentionUsers = [] } = useUserSearch({
    enabled: showQuoteModal,
  });
  const { companies: quoteLiveMentionCompanies = [] } = useCompanySearch({
    enabled: showQuoteModal,
  });
  const quoteMentionUsers = useMemo(
    () =>
      [...(postMentionUsers || []), ...(quoteLiveMentionUsers || [])].filter(
        Boolean
      ),
    [postMentionUsers, quoteLiveMentionUsers]
  );
  const quoteMentionCompanies = useMemo(
    () =>
      [
        ...(postMentionCompanies || []),
        ...(quoteLiveMentionCompanies || []),
      ].filter(Boolean),
    [postMentionCompanies, quoteLiveMentionCompanies]
  );

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        "w-full max-w-none py-4 px-4 xs:px-6 bg-white rounded-md transition-colors duration-300"
      )}
    >
      {isSinglePost && <SEO title={postTitle} description={activePost?.body} />}

      <PingModal
        isOpen={showPingModal}
        onClose={() => setShowPingModal(false)}
        objectType="post"
        objectId={postItem?.id}
      />

      {/* Plain repost: compact "{reposter} reposted" attribution header.
          The kebab offers the reposter an "Undo repost" affordance. */}
      {isPlainRepost && (
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
            <RetweetOutlined className="!text-[12px] shrink-0" />
            <Link
              to={reposterHref}
              className="font-medium hover:underline truncate"
            >
              {isSelfRepost ? "You" : reposterName || "Someone"}
            </Link>
            <span className="shrink-0">reposted</span>
            {postItem?.date_created && (
              <span className="shrink-0">
                • <TimeAgo time={postItem.date_created} />
              </span>
            )}
          </div>
          {isPostOwner && (
            <MoreOptions className="shrink-0 !max-w-[130px]">
              <ButtonWithTooltipIcon
                text="Undo repost"
                IconName={RetweetOutlined}
                onClick={handleUndoOwnRepost}
                disabled={repostLoading}
                className={clsx(
                  "!text-red-700 hover:!text-red-500",
                  repostLoading && "opacity-50 cursor-not-allowed"
                )}
              />
            </MoreOptions>
          )}
        </div>
      )}

      {isPlainRepost && isParentDeleted ? (
        // The original post behind this plain repost was deleted
        <DeletedParentNotice />
      ) : (
        <>
      {/* Plain reposts render the PARENT post's content as the card;
          clicking it (outside links/buttons) opens the parent's post page */}
      <div
        className={clsx(isPlainRepost && !isSinglePost && "cursor-pointer")}
        onClick={
          isPlainRepost && !isSinglePost ? goToPost(parentPost?.id) : undefined
        }
      >
      <header className="flex justify-between mb-2 gap-5 xs:gap-6 w-full overflow-hidden">
        <section className="flex xs:items-center gap-2">
          <Avatar
            name={
              activePost?.company?.company_name || activePost?.user?.first_name
            }
            size="sm"
            src={
              activePost?.company?.logo ||
              activePost?.user?.avatar ||
              "images/default-company-logo.png"
            }
            className={avatarStyle}
          />

          <section className="flex max-xs:flex-col xs:items-center gap-0.5 xs:gap-1">
            <CompanyName
              name={
                activePost?.company?.company_name ||
                activePost?.user?.full_name ||
                `${activePost?.user?.first_name || ""} ${
                  activePost?.user?.last_name || ""
                }`.trim()
              }
              verified={
                activePost?.company?.verified ??
                activePost?.company?.verify ??
                activePost?.user?.verified
              }
              company={!!activePost?.company?.slug}
              userId={activePost?.user?.id}
              slug={activePost?.company?.slug}
            />
            <small className="text-gray-400 lowercase shrink-0">
              {activePost?.user && (
                <Link to={`/co/${activePost?.user?.id}`}>
                  @{activePost?.user?.first_name}{" "}
                </Link>
              )}
              • <TimeAgo time={activePost?.date_created} />
            </small>
          </section>
        </section>

        {isPostOwner && !isPlainRepost && (
          <MoreOptions className="shrink-0 !max-w-[145px]">
            <div className="flex flex-col gap-2">
              <ButtonWithTooltipIcon
                text="View insights"
                IconName={BarChart3}
                onClick={() =>
                  navigate(webRoutes.postInsights.replace(":id", postItem?.id))
                }
              />
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
                  setIsDeleteLoading(true);
                  try {
                    await deletePost(postItem?.id);
                    setRefetchInterval(1000);
                    setTimeout(() => setRefetchInterval(false), 2000);
                    toast.success("Post deleted successfully");
                  } catch (error) {
                    toast.error("Failed to delete post");
                    console.error("Delete error:", error);
                  } finally {
                    setIsDeleteLoading(false);
                  }
                }}
                disabled={isDeleteLoading}
                className={clsx(
                  "!text-red-700 hover:!text-red-500",
                  isDeleteLoading && "opacity-50 cursor-not-allowed"
                )}
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
            isLoading={isEditLoading}
            disabled={isEditLoading}
            onClick={async () => {
              setErrorMessage(null);
              if (editMessage.length < 10) {
                setErrorMessage("Please at least 10 character length of text");
                return;
              }
              setIsEditLoading(true);
              try {
                const { id } = await editPost(
                  postItem?.id,
                  editMessage,
                  postItem
                );
                setRefetchInterval(1000);
                setTimeout(() => setRefetchInterval(false), 2000);
                setIsEditing(false);
                if (id) toast.success("Post updated successfully");
              } catch (error) {
                toast.error("Failed to update post");
                console.error("Edit error:", error);
              } finally {
                setIsEditLoading(false);
              }
            }}
          >
            {isEditLoading ? "Updating..." : "Edit post"}
          </Button>
        </ReusableModal>
      </header>

      {isQuoteRepost ? (
        <>
          {/* Quote commentary (this post's own body): plain text with
              @tokens, linkified like comments. Clicking it (outside links)
              opens THIS post's page. */}
          <div
            className={clsx(!isSinglePost && "cursor-pointer")}
            onClick={!isSinglePost ? goToPost(postItem?.id) : undefined}
          >
            <MarkdownComponent
              markdownContent={quoteText}
              className="text-sm !text-gray-800"
              mentionUsers={postMentionUsers}
              mentionCompanies={postMentionCompanies}
            />
          </div>

          {/* The original post embedded as a bordered child card (or the
              deleted-original notice when the parent no longer exists) */}
          <ParentPostEmbed
            parentPost={parentPost}
            mentionUsers={mentionUsers}
            mentionCompanies={mentionCompanies}
          />
        </>
      ) : (
        <>
          <FormatPostText
            text={activePost?.body}
            postId={activePost?.id}
            isSinglePost={isSinglePost}
            mentionUsers={postMentionUsers}
            mentionCompanies={postMentionCompanies}
          />

          {activePost?.images?.length > 0 && (
            <PostImageCollage images={activePost.images} />
          )}
        </>
      )}
      </div>

      <SocialShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        title={`Share to`}
        url={""}
        // footerContent={<></>}
      ></SocialShareModal>

      {/* Action bar: for plain reposts every action/count below targets the
          PARENT post (activePost); otherwise this post itself. */}
      <div className="flex items-center gap-2 justify-between mt-4">
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

          <div className="flex items-center gap-1">
            <Popover
              isOpen={isRepostMenuOpen}
              onOpen={onRepostMenuOpen}
              onClose={onRepostMenuClose}
              placement="top"
            >
              <PopoverTrigger>
                <button
                  type="button"
                  disabled={repostLoading}
                  title={reposted ? "Reposted" : "Repost"}
                  className={clsx(
                    "flex items-center text-sm gap-1 bg-transparent active:scale-95 transition-all duration-300 disabled:cursor-not-allowed",
                    reposted
                      ? "text-green-600 hover:text-green-500"
                      : "text-gray-600 hover:text-custom_blue"
                  )}
                >
                  <RetweetOutlined className="xs:!text-[14px] !text-[20px]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="!p-2 !w-fit">
                <PopoverArrow />
                <div className="flex flex-col gap-2">
                  {reposted ? (
                    <button
                      onClick={handleUnrepost}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-500 transition-colors"
                    >
                      <RetweetOutlined />
                      <span>Undo repost</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRepost()}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-custom_blue transition-colors"
                      >
                        <RetweetOutlined />
                        <span>Repost</span>
                      </button>
                      <button
                        onClick={() => {
                          onRepostMenuClose();
                          setShowQuoteModal(true);
                        }}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-custom_blue transition-colors"
                      >
                        <Pencil1Icon className="w-4 h-4" />
                        <span>Quote repost</span>
                      </button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Repost COUNT: tappable on every card when > 0 — opens the
                reposters list. The repost/undo menu stays on the icon. */}
            {reposts > 0 ? (
              <button
                type="button"
                onClick={() => setShowRepostersModal(true)}
                title="View reposts"
                className={clsx(
                  "!text-[.6rem] hover:underline",
                  reposted ? "text-green-600" : "text-gray-600"
                )}
              >
                {formatNumber(reposts)}
              </button>
            ) : (
              <span
                className={clsx(
                  "!text-[.6rem]",
                  reposted ? "text-green-600" : "text-gray-600"
                )}
              >
                {formatNumber(reposts)}
              </span>
            )}
          </div>

          {/* <PDFPreview
            postBody={postItem?.body}
            postTitle={postTitle}
            postImages={postItem.images}
          /> */}

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

          {isPostOwner && activePost?.company?.id && (
            <ButtonWithTooltipIcon
              IconName={Radio}
              tip="Ping post"
              onClick={() => setShowPingModal(true)}
            />
          )}
        </div>
      </div>

      {/* Single post page: subtle "Reposted by …" attribution line. Tapping
          it opens the same RepostersModal as the count. */}
      {isSinglePost && firstReposterName && (
        <button
          type="button"
          onClick={() => setShowRepostersModal(true)}
          className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors"
        >
          <RetweetOutlined className="!text-[12px]" />
          <span className="truncate">
            Reposted by {firstReposterName}
            {otherReposterCount > 0 &&
              ` and ${otherReposterCount} ${
                otherReposterCount === 1 ? "other" : "others"
              }`}
          </span>
        </button>
      )}

      {/* Quote repost modal */}
      <ReusableModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        title="Quote repost"
        footerContent={<></>}
      >
        <LexicalCommentEditor
          key={quoteEditorKey}
          onChange={setQuoteContent}
          placeholder="Add a comment to your repost..."
          users={quoteMentionUsers}
          companies={quoteMentionCompanies}
        />

        {/* Preview of the post being reposted (the parent for plain reposts) */}
        <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Avatar
              name={
                activePost?.company?.company_name ||
                activePost?.user?.first_name
              }
              size="xs"
              src={activePost?.company?.logo || activePost?.user?.avatar}
              className={avatarStyle}
            />
            <span className="font-semibold text-sm">
              {activePost?.company?.company_name ||
                activePost?.user?.full_name ||
                `${activePost?.user?.first_name || ""} ${
                  activePost?.user?.last_name || ""
                }`.trim()}
            </span>
            <small className="text-gray-400">
              • <TimeAgo time={activePost?.date_created} />
            </small>
          </div>
          <p className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap">
            {activePost?.body}
          </p>
          {activePost?.images?.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {activePost.images.length}{" "}
              {activePost.images.length === 1 ? "image" : "images"} attached
            </p>
          )}
        </div>

        <Button
          className="!bg-gold block mt-4 float-right !text-sm"
          isLoading={isQuoteSubmitting}
          disabled={isQuoteSubmitting || !quoteContent.plainText?.trim()}
          onClick={handleQuoteRepost}
        >
          {isQuoteSubmitting ? "Reposting..." : "Repost"}
        </Button>
      </ReusableModal>

      {/* Reposters list modal (post detail page) - lists who reposted the
          post being interacted with (the parent for plain reposts) */}
      {showRepostersModal && (
        <RepostersModal
          postId={activePost?.id}
          isOpen={showRepostersModal}
          onClose={() => setShowRepostersModal(false)}
        />
      )}

      <CommentSection
        showCommentSection={showCommentSection}
        setShowCommentSection={setShowCommentSection}
        commentsData={comments}
        postItem={activePost}
        mentionUsers={postMentionUsers}
        mentionCompanies={postMentionCompanies}
        refetchComments={refetchComments}
        isLoadingMore={isLoadingMoreComments && !moreCommentsReady}
        hasMoreComments={hasMoreComments && !showAllComments}
        onLoadMore={() => setShowAllComments(true)}
        moreCommentsReady={moreCommentsReady}
        showAllComments={showAllComments}
      />
        </>
      )}
    </motion.article>
  );
};

/**
 * Comment section with instant display - uses preview_comments from post data
 * Background prefetching loads more comments while user views preview
 */
const CommentSection = ({
  showCommentSection,
  setShowCommentSection,
  commentsData = [],
  isLoadingMore = false,
  hasMoreComments = false,
  onLoadMore,
  moreCommentsReady = false,
  postItem,
  mentionUsers: initialMentionUsers = [],
  mentionCompanies: initialMentionCompanies = [],
  refetchComments,
  showAllComments = false,
}) => {
  const [comment, setComment] = useState(createEmptyCommentContent);
  const [commentEditorKey, setCommentEditorKey] = useState(0);
  const [commentAsType, setCommentAsType] = useState("user");
  const [commentAsCompanyId, setCommentAsCompanyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data: commentAsCompanies = [] } = useGetActionableCompanies("company_post");
  const { users: liveMentionUsers = [] } = useUserSearch({ enabled: showCommentSection });
  const { companies: liveMentionCompanies = [] } = useCompanySearch({ enabled: showCommentSection });
  const mentionUsers = useMemo(
    () => [...(initialMentionUsers || []), ...(liveMentionUsers || [])].filter(Boolean),
    [initialMentionUsers, liveMentionUsers]
  );
  const mentionCompanies = useMemo(
    () => [...(initialMentionCompanies || []), ...(liveMentionCompanies || [])].filter(Boolean),
    [initialMentionCompanies, liveMentionCompanies]
  );
  const selectedCompanyId = commentAsType === "company" ? commentAsCompanyId : null;

  useEffect(() => {
    if (
      commentAsCompanyId &&
      !(commentAsCompanies || []).some((company) => company.id === commentAsCompanyId)
    ) {
      setCommentAsType("user");
      setCommentAsCompanyId(null);
    }
  }, [commentAsCompanies, commentAsCompanyId]);

  const handleComment = useCallback(async () => {
    if (!comment.plainText?.trim()) return;

    setLoading(true);
    try {
      // Fixed: pass comment text, not the postItem object
      const newComment = await commentOnPost(
        postItem.id,
        comment.text,
        comment.mentions || [],
        comment.companyMentions || [],
        selectedCompanyId
      );
      
      // Comment created successfully
      toast.success("Comment has been added");
      setComment(createEmptyCommentContent());
      setCommentEditorKey((key) => key + 1);

      // Update cache if possible
      if (newComment?.id) {
        queryClient.setQueryData(
          ["comments", postItem.id, 1],
          (oldComments) => {
            if (!oldComments) {
              return {
                results: [newComment],
                count: 1,
                next: null,
                previous: null,
                hasMore: false,
              };
            }

            if (Array.isArray(oldComments)) return [newComment, ...oldComments];

            return {
              ...oldComments,
              results: [newComment, ...(oldComments.results || [])],
              count: (oldComments.count || 0) + 1,
            };
          }
        );
      }

      // Refetch to get latest comments
      refetchComments().catch((e) =>
        console.log("Could not update to latest comments")
      );
    } catch (error) {
      console.error("Comment submission error:", error);
      toast.error("Failed to submit the comment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [comment, postItem, queryClient, refetchComments, selectedCompanyId]);

  const handleReplyToComment = useCallback(async (commentId, replyData) => {
    try {
      await replyToComment(
        commentId,
        replyData.text,
        replyData.mentions || [],
        replyData.companyMentions || [],
        replyData.parentReplyId || null,
        replyData.commentAsCompanyId || null
      );
      refetchComments();
      toast.success("Reply posted successfully");
    } catch (error) {
      console.error("Failed to reply:", error);
      toast.error("Failed to post reply");
      throw error;
    }
  }, [refetchComments]);

  const handleLikeComment = useCallback(async (commentId, hasLiked) => {
    try {
      await likeComment(commentId, hasLiked);
      refetchComments();
    } catch (error) {
      console.error("Failed to like comment:", error);
      toast.error("Failed to like comment");
      throw error;
    }
  }, [refetchComments]);

  const handleLikeReply = useCallback(async (replyId, hasLiked) => {
    try {
      await likeReply(replyId, hasLiked);
      refetchComments();
    } catch (error) {
      console.error("Failed to like reply:", error);
      toast.error("Failed to like reply");
      throw error;
    }
  }, [refetchComments]);

  const handleEditComment = useCallback(async (commentId, isReply, content) => {
    try {
      const result = isReply
        ? await updateReply(commentId, content)
        : await updateComment(commentId, content);
      // makeApiRequest returns null on failure (and toasts the API error itself)
      if (!result) return false;
      refetchComments();
      toast.success(isReply ? "Reply updated" : "Comment updated");
      return true;
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error(isReply ? "Failed to update reply" : "Failed to update comment");
      throw error;
    }
  }, [refetchComments]);

  const handleDeleteComment = useCallback(async (commentId, isReply) => {
    try {
      const result = isReply
        ? await deleteReply(commentId)
        : await deleteComment(commentId);
      // DELETE returns "" on 204 success and null on failure
      if (result === null) return;
      // Drop any cached comment pages for this post so deleted items disappear
      queryClient.invalidateQueries({ queryKey: ["comments", postItem.id] });
      refetchComments();
      toast.success(isReply ? "Reply deleted" : "Comment deleted");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error(isReply ? "Failed to delete reply" : "Failed to delete comment");
      throw error;
    }
  }, [postItem.id, queryClient, refetchComments]);

  useEffect(() => {
    if (!showCommentSection) {
      setComment(createEmptyCommentContent());
      setCommentEditorKey((key) => key + 1);
    }
  }, [showCommentSection]);

  return (
    <section
      className={clsx("transition-all duration-300", {
        "mt-4": showCommentSection,
        "h-0 opacity-0 overflow-hidden": !showCommentSection,
      })}
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-bold text-lg">Comments</h2>
        <CloseButton
          className="!text-xs"
          onClick={() => setShowCommentSection(false)}
        />
      </div>

      <div className="mb-4 border-b pb-4">
        <CommentAsSelector
          user={currentUser}
          userCompanies={commentAsCompanies}
          selectedType={commentAsType}
          selectedCompanyId={commentAsCompanyId}
          label="Comment as:"
          idPrefix={`post-${postItem.id}-comment-as`}
          onSelectionChange={(type, companyId) => {
            setCommentAsType(type);
            setCommentAsCompanyId(companyId);
          }}
        />
        <LexicalCommentEditor
          key={commentEditorKey}
          onChange={setComment}
          placeholder="Type your comment here"
          users={mentionUsers}
          companies={mentionCompanies}
        />
        <button
          className="mt-2 ml-auto block bg-gold disabled:skeleton hover:bg-custom_yellow text-xs px-3 py-2 active:scale-95 disabled:active:scale-100 transition-all duration-300 rounded disabled:cursor-not-allowed"
          onClick={handleComment}
          disabled={loading || !comment.plainText?.trim()}
        >
          {loading ? "Commenting..." : "Comment"}
        </button>
      </div>

      {/* Instant display - no loading for initial comments */}
      {(commentsData?.length === 0 && !isLoadingMore) ? (
        <p className="text-gray-500 text-sm py-2">No comments yet. Be the first to comment!</p>
      ) : (
        commentsData?.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            postUserId={postItem.user?.id}
            currentUser={currentUser}
            onReply={handleReplyToComment}
            onLike={handleLikeComment}
            onLikeReply={handleLikeReply}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            users={mentionUsers}
            companies={mentionCompanies}
            commentAsCompanies={commentAsCompanies}
            level={0}
          />
        ))
      )}
      
      {/* Load more button - shows instantly if prefetch is ready, skeleton if still loading */}
      {hasMoreComments && !showAllComments && (
        <>
          {isLoadingMore ? (
            // Show skeleton while background loading
            <div className="py-2 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-2 animate-pulse">
                  <div className="w-7 h-7 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center">Loading more comments...</p>
            </div>
          ) : (
            // Button ready to show more (already prefetched)
            <button
              onClick={onLoadMore}
              className="w-full py-2 text-sm text-gold hover:text-custom_yellow transition-colors flex items-center justify-center gap-2"
            >
              {moreCommentsReady ? (
                <>Show all comments</>
              ) : (
                <>Load more comments</>
              )}
            </button>
          )}
        </>
      )}
    </section>
  );
};

/**
 * Modal listing everyone who reposted a post (with quote text when present).
 * Shown when clicking the repost count on the post detail page.
 */
const RepostersModal = ({ postId, isOpen, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["reposts", postId],
    queryFn: () => getPostReposts(postId),
    enabled: isOpen && !!postId,
  });
  // Mention directories so quote text linkifies @mentions like comments do
  const { users: mentionUsers = [] } = useUserSearch({ enabled: isOpen });
  const { companies: mentionCompanies = [] } = useCompanySearch({
    enabled: isOpen,
  });

  const reposters = data?.results || (Array.isArray(data) ? data : []);

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reposts"
      footerContent={<></>}
    >
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      ) : reposters.length === 0 ? (
        <LightParagraph>No reposts yet.</LightParagraph>
      ) : (
        <div className="space-y-4">
          {reposters.map((repost) => {
            const isCompany = !!repost.company;
            const name = isCompany
              ? repost.company?.company_name || repost.company?.name
              : repost.user?.full_name ||
                `${repost.user?.first_name || ""} ${
                  repost.user?.last_name || ""
                }`.trim();
            const avatarSrc = isCompany
              ? repost.company?.logo
              : repost.user?.avatar;
            const href = isCompany
              ? `/${repost.company?.slug || repost.company?.company_name || ""}`
              : `/co/${repost.user?.id}`;

            return (
              <div key={repost.id} className="flex gap-2">
                <Link to={href} onClick={onClose}>
                  <Avatar
                    name={name}
                    size="sm"
                    src={avatarSrc}
                    className={avatarStyle}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={href}
                      onClick={onClose}
                      className="font-semibold text-sm hover:underline truncate"
                    >
                      {name || "Unknown"}
                    </Link>
                    <small className="text-gray-400 shrink-0">
                      <TimeAgo time={repost.created_at || repost.date_created} />
                    </small>
                  </div>
                  {/* Quote text: legacy rows expose `comment`, the new
                      child-post model exposes the quote as `body` */}
                  {stripHtmlTags(repost.comment ?? repost.body) && (
                    <MarkdownComponent
                      markdownContent={stripHtmlTags(repost.comment ?? repost.body)}
                      className="text-sm !text-gray-600 mt-0.5"
                      mentionUsers={mentionUsers}
                      mentionCompanies={mentionCompanies}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ReusableModal>
  );
};

export function ButtonWithTooltipIcon({
  IconName,
  text,
  onClick,
  tip,
  className,
  tooltipClassName,
  iconClassName,
  textClassName,
  loading = false,
  disabled = false,
  thisKey,
  hasArrow = false,
  type = "button",
}) {
  return (
    <Tooltip
      label={loading ? "" : tip}
      fontSize="12"
      placement="auto"
      className={clsx(
        "!rounded-md !bg-white !text-custom_blue border mx-3 text-sm",
        tooltipClassName
      )}
      hasArrow={hasArrow}
      colorScheme="whiteAlpha"
    >
      <button
        type={type}
        onClick={onClick}
        disabled={loading || disabled}
        className={clsx(
          "flex items-center text-sm gap-1 bg-transparent text-gray-600 hover:text-custom_blue active:scale-95 transition-all duration-300 overflow-hidden disabled:cursor-not-allowed",
          className
        )}
      >
        {IconName && !loading && (
          <IconName
            className={clsx("", iconClassName,  tip === "Unlike post" && "text-red-500", {
              "xs:!size-4 !size-6 xs:!text-[14px] !text-[20px]": !iconClassName,
            })}
          />
        )}
        {loading && <Spinner size="xs" className="text-gold" />}
        {text && (
          <motion.span
            initial={{ y: 30, opacity: 0.25 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0.25 }}
            key={thisKey || text}
            className={`${textClassName} overflow-hidden`}
          >
            {text}
          </motion.span>
        )}
      </button>
    </Tooltip>
  );
}

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
