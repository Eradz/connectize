import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getOrCreateProductImages } from "../api-services/products";

export const useProductImages = (productId) => {
  const { data: productImages, isLoading } = useQuery({
    queryKey: ["productImages", productId],
    queryFn: () => getOrCreateProductImages(undefined, "get"),
    enabled: !!productId,
    // refetchInterval:100000000
  });

  const productImage = productImages?.filter(
    (image) => productId === image.product
  );

  return { productImage, productImages, isLoading };
};

export const usePageinatedProducts = ({ companyId } = {}) => {
  return useInfiniteQuery({
    queryKey: ["products", "all", { companyId }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return await getProducts(
        { page_size: 2, page: pageParam, company: companyId || undefined },
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
};
