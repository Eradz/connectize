import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Product Details | Connectize Marketplace",
    description: "Explore detailed product specifications, pricing, and supplier information on Connectize Marketplace.",
  keywords: "oil and gas products, equipment, marketplace, energy supplies, product details",
  });

import { useEffect } from "react";
import Productdetails from "../../components/admin/products/productdetails";
import NewProducts from "../../components/admin/products/newProducts";
import { useParams } from "react-router-dom";
import { getSingleProduct } from "../../api-services/products";
import { useQuery } from "@tanstack/react-query";
// import { useCustomQuery } from "../../context/queryContext";
import NoPage from "../../components/NoPage";

export default function Product() {
  const { id: productId } = useParams();
  // const { refetchInterval } = useCustomQuery();

  const { data: product, isLoading } = useQuery({
    queryKey: ["products", { id: productId }],
    queryFn: () => getSingleProduct(productId),
    // refetchInterval,
  });

  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} | Products - Connectize`;
    }
  }, [product]);

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <NoPage />;

  return (
    <div className="space-y-12 max-md:container">
      {product ? (
        <Productdetails product={product} />
      ) : (
        <div>Product not found</div>
      )}
      <NewProducts />
    </div>
  );
}

export const ProductDetailSkeleton = () => {
  return (
    <>
      <section className="flex max-lg:flex-col items-start justify-center gap-4">
        {/* Image Skeleton */}
        <div className="w-full lg:w-1/2">
          <div className="w-full h-[350px] skeleton rounded-md" />
          {/* Navigation Buttons Skeleton */}
          <div className="flex gap-4 items-center justify-between mt-4 w-full">
            <div className="flex text-xs gap-1 items-center">
              <div className="h-6 w-12 skeleton rounded" />
              <div className="text-gray-300">/</div>
              <div className="h-6 w-12 skeleton rounded" />
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <button
                  key={index}
                  disabled
                  className="!bg-transparent hover:!text-custom_blue !text-gray-600 first:flex-row-reverse active:scale-95 !text-sm"
                >
                  <div className="h-6 w-16 skeleton rounded" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-4 lg:w-1/2 shrink-0">
          <div className="space-y-2 w-full">
            <div className="h-8 w-1/2 skeleton rounded" />
            <div className="h-6 w-1/3 skeleton rounded" />
          </div>
          <div className="h-[1px] bg-gray-300 my-4" />
          <div className="space-y-2">
            <div className="text-xl font-bold h-6 w-1/3 skeleton rounded" />
            <div className="h-36 w-full skeleton rounded" />
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-32 h-10 skeleton rounded-full" />
            <div className="w-16 h-10 skeleton rounded-full" />
          </div>
        </div>
      </section>

      <section className="gap-4 flex max-lg:flex-col">
        <section className="space-y-4 lg:w-1/2 shrink-0">
          <div className="h-6 w-1/3 skeleton rounded" />
          <div className="w-full h-[300px] skeleton rounded" />
        </section>

        <section className="space-y-4 lg:w-1/2 shrink-0">
          <div className="h-6 w-1/3 skeleton rounded" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 skeleton rounded-full" />
            <div>
              <div className="h-6 w-24 skeleton rounded" />
              <div className="h-4 w-16 skeleton rounded mt-2" />
            </div>
          </div>
        </section>
      </section>
    </>
  );
};
