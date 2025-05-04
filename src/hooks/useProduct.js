import { useQuery } from "@tanstack/react-query";
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
