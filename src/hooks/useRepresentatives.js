import { getAllRepresentatives } from "../api-services/representatives";
import { usePageination } from "./usePagination";

export function usePaginatedRepresentatives(
  { companyId, userId } = {},
  { enabled = true } = {},
) {
  return usePageination({
    queryKey: ["representatives", "all", { company: companyId, user: userId }],
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache data to avoid refetching
    queryFn: async ({ pageParam }) =>
      getAllRepresentatives(
        {
          // status: "True",
          company_id: companyId,
          user: userId,
          page_size: 12, // Increased from 6 to reduce number of requests
          page: pageParam,
        },
        true,
      ),
  });
}
