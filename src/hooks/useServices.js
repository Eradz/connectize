import { useInfiniteQuery } from "@tanstack/react-query";
import { getServices } from "../api-services/services";

export const usePageinatedServices = ({ companyId, category, sortBy } = {}) => {
  const res = useInfiniteQuery({
    queryKey: ["services", "all", { companyId, category, sortBy }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return await getServices(
        { page_size: 3, page: pageParam, company: companyId, category, sortBy },
        true
      );
    },

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

  return res;
};

export const useGetServicesFirstPage = (params = {}) => {
  const { data: services, isLoading } = usePageinatedServices(params);
  const page1 = services?.pages?.[0]?.data;

  return { isLoading, data: page1 };
};
