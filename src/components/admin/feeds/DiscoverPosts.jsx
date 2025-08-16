import { MessageOutlined, ShareAltOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  CloseButton,
  Spinner,
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import { HeartIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  commentOnPost,
  deletePost,
  editPost,
  likePost,
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

function DiscoverPosts({
  searchArray,
  isSearch,
  searchLoading,
  companyName = null,
}) {
  const { data: posts, isLoading } = usePollPosts();

  const finalArray = isSearch
    ? searchArray
    : companyName
    ? posts?.filter(
        (post) =>
          post?.company?.company_name?.toLowerCase() ===
          companyName?.toLowerCase()
      )
    : posts;
  const postLoading = isSearch ? searchLoading : isLoading;

  return (
    <section className="space-y-1.5 md:space-y-6 mt-6">
      {postLoading ? (
        Array.from({ length: 5 }, (_, index) => (
          <DiscoverPostSkeleton key={index} />
        ))
      ) : finalArray?.length < 1 ? (
        <LightParagraph>
          {isSearch ? "No post found in search" : ""}
        </LightParagraph>
      ) : (
        finalArray?.map((post, index) => (
          <DiscoverPostItem
            hasImage={post?.images?.length > 0}
            key={index}
            postItem={post}
          />
        ))
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
    postItem?.user?.first_name
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
            <CompanyName
              name={postItem?.company?.slug}
              verified={postItem?.company?.verify}
            />
            <small className="text-gray-400 lowercase shrink-0">
              <Link to={`/co/${postItem?.user?.id}`}>
                @{postItem.user.first_name}{" "}
              </Link>
              • <TimeAgo time={postItem.date_created} />
            </small>
          </section>
        </section>

        {postItem?.user?.id === currentUser?.id && (
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
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { setRefetchInterval } = useCustomQuery();
  const queryClient = useQueryClient();

  const handleComment = useCallback(async () => {
    if (comment.trim().length < 1) return;

    setLoading(true);
    try {
      const newComment = await commentOnPost(postItem.id, postItem, comment);
      const { id } = newComment;

      queryClient.setQueryData(
        ["comments", { postId: postItem.id }],
        (oldComments) => {
          // const lastComment = oldComments?.at(0);
          // const clone = { ...lastComment, id: Math.random(), content: comment };

          return [...oldComments, newComment];
        }
      );

      refetchComments().catch((e) =>
        console.log("Could not update to lastest comments")
      );
      if (id) toast.success("Comment has been added");

      // setRefetchInterval(1000);
      // setTimeout(() => setRefetchInterval(false), 2000);
      setComment("");
    } catch (error) {
      toast.error("Failed to submit the comment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [comment, postItem, setRefetchInterval]);

  useEffect(() => {
    if (!showCommentSection) setComment("");
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
            <MemoizedCommentBlock
              key={comment.id}
              comment={comment}
              postUserId={postItem.user.id}
            />
          ))}
      <div className="mt-4 border-t pt-4 relative">
        <ReactQuill
          value={comment}
          onChange={(value) => setComment(value === "<p><br></p>" ? "" : value)}
          theme="snow"
          placeholder="Type your comment here"
          // style={{ height: "200px" }}
        />
        <button
          className="absolute bottom-1.5 right-2 bg-gold disabled:skeleton hover:bg-custom_yellow text-xs p-2 active:scale-95 disabled:active:scale-100 transition-all duration-300 rounded disabled:cursor-not-allowed"
          onClick={handleComment}
          disabled={loading || comment.trim().length < 1}
        >
          {loading ? "Commenting..." : "Comment"}
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
            className={clsx("", iconClassName, {
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
