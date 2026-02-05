import { Button } from "@chakra-ui/react";
import { ArrowBackIos } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPostById } from "../../api-services/posts";
import {
  DiscoverPostItem,
  DiscoverPostSkeleton,
} from "../../components/admin/feeds/DiscoverPosts";
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
      />
    </section>
  );
}

export default SinglePostPage;
