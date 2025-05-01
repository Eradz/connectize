import { Button } from "@chakra-ui/react";
import { ArrowBackIos } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getPosts } from "../../api-services/posts";
import {
  DiscoverPostItem,
  DiscoverPostSkeleton,
} from "../../components/admin/feeds/DiscoverPosts";
import LightParagraph from "../../components/ParagraphText";
import { useCustomQuery } from "../../context/queryContext";

function SinglePostPage() {
  const { id } = useParams();
  const { refetchInterval } = useCustomQuery();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
    refetchInterval,
    staleTime: 300000,
    cacheTime: 600000,
  });

  const postItem = useMemo(
    () => posts?.find((post) => post.id.toString() === id),
    [posts, id]
  );

  if (isLoading) return <DiscoverPostSkeleton />;
  if (!postItem) return <LightParagraph>No post found</LightParagraph>;

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
