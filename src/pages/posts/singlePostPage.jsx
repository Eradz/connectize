import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Post | Connectize",
    description: "Read and engage with the latest industry posts, insights, and discussions on Connectize.",
  });

import { Button } from "@chakra-ui/react";
import { ArrowBackIos } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPostById } from "../../api-services/posts";
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
