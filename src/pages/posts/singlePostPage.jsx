import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Post | Connectize",
    description: "Read and engage with the latest industry posts, insights, and discussions on Connectize.",
  });

import { Button } from "@chakra-ui/react";
import { ArrowBackIos } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getPostById } from "../../api-services/posts";
import { webRoutes } from "../../lib/webRoutes";
import {
  DiscoverPostItem,
  DiscoverPostSkeleton,
} from "../../components/admin/feeds/DiscoverPosts";
import { useCompanySearch } from "../../hooks/useCompanySearch";
import { useUserSearch } from "../../hooks/useUserSearch";
import LightParagraph from "../../components/ParagraphText";

function SinglePostPage() {
  const { id } = useParams();

  const { data: postItem, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
    staleTime: 300000,
    cacheTime: 600000,
    enabled: !!id, // Only run query if id exists
  });
  const { users: mentionUsers = [] } = useUserSearch({ enabled: !!postItem });
  const { companies: mentionCompanies = [] } = useCompanySearch({ enabled: !!postItem });

  if (isLoading) return <DiscoverPostSkeleton />;
  if (isError || !postItem) return <LightParagraph>No post found</LightParagraph>;

  // A plain repost (is_repost with an empty body) is just a pointer at its
  // parent - its detail page is the PARENT's post page. Quote reposts render
  // as their own post (with the parent embedded). If the parent was deleted,
  // fall through and render the "no longer available" notice.
  const isPlainRepost =
    !!postItem?.is_repost && !String(postItem?.body || "").trim();
  if (isPlainRepost && postItem?.parent_post?.id) {
    return (
      <Navigate
        to={webRoutes.singlePost.replace(":id", postItem.parent_post.id)}
        replace
      />
    );
  }

  return (
    <section className="space-y-4">
      <Button
        variant="solid"
        className="!text-sm !flex items-center max-lg:ml-4 max-lg:mt-4"
        onClick={() => window.history.back()}
      >
        <ArrowBackIos fontSize="10" />
        <span>Go Back</span>
      </Button>
      <DiscoverPostItem
        postItem={postItem}
        hasImage={postItem.images?.length > 0}
        isSinglePost
        mentionUsers={mentionUsers}
        mentionCompanies={mentionCompanies}
      />
    </section>
  );
}

export default SinglePostPage;
