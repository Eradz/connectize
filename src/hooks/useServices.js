import { useInfiniteQuery } from "@tanstack/react-query";
import { getServices } from "../api-services/services";

export const usePageinatedServices = ({ companyId } = {}) => {
  const res = useInfiniteQuery({
    queryKey: ["services", "all", { companyId }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return await getServices(
        { page_size: 3, page: pageParam, company: companyId },
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

export const useGetServicesFirstPage = ({ companyId } = {}) => {
  const { data: services, isLoading } = usePageinatedServices({ companyId });
  const page1 = services?.pages?.[0]?.data;

  console.log({ servicePage1: page1 });

  return { isLoading, data: page1 };
};
