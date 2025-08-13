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

export const getProducts = async (params, returnFullRes = false) => {
  const { results: products, next } = await makeApiRequest({
    url: `api/products/`,
    method: "GET",
    params,
  });

  if (returnFullRes) return { data: products, next };

  return products || [];
};

export const getSingleProduct = async (id) => {
  const product = await makeApiRequest({
    url: `api/products/${id}/`,
    method: "GET",
  });

  return product || null;
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

export const createProduct = async (data, resetForm, editId) => {
  if (!data.images.length) {
    toast.error("Upload at least one image");
    return;
  }

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
    url: `api/products/${editId ? editId + "/" : ""}`,
    method: editId ? "PUT" : "POST",
    data: {
      title: capitalizeFirst(data.product_title),
      images: data.images,
      sub_title: data.subtitle,
      category: productCategoryData,
      description: data.description,
      featured: false,
      company: company?.[0]?.company_name || "",
    },
    resetForm,
  });

  if (product) {
    toast.success(
      editId
        ? "Product has been edited successfully"
        : `${product.title} has been created successfully!`,
      {
        id: toastId,
      }
    );

    return product;
  }
};

/**
 *
 * @param {File} image
 * @param {*} type
 * @returns
 */
export const getOrCreateProductImages = async (image, { onUploadProgress }) => {
  return await makeApiRequest({
    url: `api/product-images/`,
    method: "POST",
    data: { image },
    contentType: "multipart/form-data",
    onUploadProgress,
  });
};

export const getProductCategories = async (params, returnFullRes = false) => {
  const { results, next } = await makeApiRequest({
    url: `api/product-categories/`,
    method: "GET",
    params,
  });

  if (returnFullRes) return { data: results, next };

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

export const deleteProduct = async (id) => {
  return await makeApiRequest({
    url: `api/products/${id}/`,
    method: "DELETE",
  });
};

export const updateProduct = async (id, data) => {
  return await makeApiRequest({
    url: `api/products/${id}/`,
    method: "PATCH",
    data,
  });
};

export const bulkDeleteProducts = async (ids) => {
  return await makeApiRequest({
    url: `api/products/bulk-delete/`,
    method: "POST",
    data: { ids },
  });
};
