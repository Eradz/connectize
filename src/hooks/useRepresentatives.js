import { getAllRepresentatives } from "../api-services/representatives";
import { usePageination } from "./usePagination";

export function usePaginatedRepresentatives({ companyId, userId } = {}) {
  return usePageination({
    queryKey: ["representatives", "all", { company: companyId, user: userId }],
    queryFn: async ({ pageParam }) =>
      getAllRepresentatives(
        {
          // status: "True",
          company_id: companyId,
          user: userId,
          page_size: 6,
          page: pageParam,
        },
        true
      ),
  });
}
