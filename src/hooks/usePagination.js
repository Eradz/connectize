import { useInfiniteQuery } from "@tanstack/react-query";

export const usePageination = ({
  queryKey,
  queryFn,
  initialPageParam = 1,
  //   page_size = 3,
} = {}) => {
  return useInfiniteQuery({
    queryKey,
    initialPageParam,
    queryFn,

    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.next) return;

      const lastPageUrl = new URL(lastPage.next);

      let nextPage = lastPageUrl.searchParams.get("page");

      if (!nextPage) return;
      let nextPageAsNumber = parseInt(nextPage);

      if (!nextPageAsNumber) return;

      return nextPageAsNumber;
    },
  });
};
