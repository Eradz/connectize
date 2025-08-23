import { makeApiRequest } from "../lib/helpers/index";

export const getSearchResults = async ({
  searchTerm,
  types,
  pageSize = 10,
}) => {
  const searchResults = await makeApiRequest({
    url: `api/search/`,
    method: "GET",
    params: {
      q: searchTerm,
      per_type_limit: pageSize,
      types,
    },
  });

  if (types) return searchResults?.[types];

  return searchResults;
};
