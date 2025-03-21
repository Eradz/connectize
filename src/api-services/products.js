import { redirect } from "react-router-dom";
import { toast } from "sonner";
import { makeApiRequest } from "../lib/helpers";
import { getSession } from "../lib/session";
import { capitalizeFirst } from "../lib/utils";
import { getCompanyByIdOrEmail } from "./companies";

// {
//     "title": "",
//     "sub_title": "",
//     "category": null,
//     "description": "",
//     "date_created": null,
//     "featured": false,
//     "company": null
// }

export const getProducts = async () => {
  const { results: products } = await makeApiRequest({
    url: `api/products/`,
    method: "GET",
  });
  let mergedProductWIthImage = [];

  const productImages = await getOrCreateProductImages(undefined, "get");

  products?.forEach((product) => {
    const productImage = productImages?.filter(
      (image) => product.id === image.product
    );

    mergedProductWIthImage.push({
      ...product,
      images: productImage,
    });
  });

  return mergedProductWIthImage || [];
};

export const getRecommendedProducts = async () => {
  const allProducts = await getProducts();

  const featuredProducts = allProducts.filter(
    (product) =>
      product.featured === true ||
      product.title.toString().toLowerCase().includes("oil") ||
      product
  );
  return featuredProducts.slice(0, 5) || [];
};

export const createProduct = async (data, resetForm) => {
  const productCategoryData = capitalizeFirst(
    data.product_category.trim().toLowerCase()
  );

  const { user } = getSession();

  const company = await getCompanyByIdOrEmail();

  if (!company) {
    toast.error("Please create a company first before you add a product");
    return;
  }

  const toastId = toast.info("Enlisting product...");

  if (!user && (!data || !productCategoryData)) {
    toast.error("No User session or product data or product category found", {
      id: toastId,
    });
    return;
  }

  await getOrCreateProductCategories(productCategoryData);

  const product = await makeApiRequest({
    url: `api/products/`,
    method: "POST",
    data: {
      title: capitalizeFirst(data.product_title),
      sub_title: data.subtitle,
      category: productCategoryData,
      description: data.description,
      featured: false,
      company: company?.[0].company_name || "",
    },
    resetForm,
  });

  const image1 = await getOrCreateProductImages(
    {
      image: data.image_1,
      caption: data?.image_caption1 || data?.product_title,
      product: product.id,
    },
    product
  );

  if (data.image_2)
    await getOrCreateProductImages(
      {
        image: data.image_2,
        caption: data?.image_caption2 || data?.product_title,
        product: product.id,
      },
      product
    );
  if (data.image_3)
    await getOrCreateProductImages(
      {
        image: data.image_3,
        caption: data?.image_caption3 || data?.product_title,
        product: product.id,
      },
      product
    );

  if (data.image_4) {
    await getOrCreateProductImages(
      {
        image: data.image_4,
        caption: data?.image_caption4 || data?.product_title,
        product: product.id,
      },
      product
    );
  }

  if (product && image1) {
    toast.success(`${product.title} has been created successfully!`, {
      id: toastId,
    });

    redirect("/market");
  }
};

export const getOrCreateProductImages = async (data, type) => {
  const { results: images } = await makeApiRequest({
    url: `api/product-images/`,
    method: "GET",
  });

  if (type === "get" || data === undefined) return images || [];

  return await makeApiRequest({
    url: `api/product-images/`,
    method: "POST",
    data,
    contentType: "multipart/form-data",
  });
};

export const getProductCategories = async () => {
  const { results } = await makeApiRequest({
    url: `api/product-categories/`,
    method: "GET",
  });

  return results || [];
};

export const getOrCreateProductCategories = async (name) => {
  const categories = await getProductCategories();

  const hasCategory =
    categories?.filter((data) => data.name === name).length > 0;

  if (hasCategory) return categories || [];

  const newCategory = await makeApiRequest({
    url: `api/product-categories/`,
    method: "POST",
    data: { name: name },
  });

  return newCategory;
};

export const bookmarkProduct = async (productId, data, hasBookmarked) => {
  if (hasBookmarked) {
    await makeApiRequest({
      url: `api/products/${productId}/unlike/`,
      method: "POST",
      // data: { ...data, company_id: data.company },
    });
    return;
  }
  await makeApiRequest({
    url: `api/products/${productId}/like/`,
    method: "POST",
    data: { ...data, company_id: data.company.id },
  });
};
