import { delAuth, get, getAuth, patch, postAuth } from "../../utils/request";

export const detailProductGet = async (slug) => {
  const result = await get(`/products/detail/${slug}`);
  return result;
};

export const productsCategoryGet = async (
  slugCategory,
  sortKey,
  sortType,
  price,
  brand_id,
  sex
) => {
  const params = new URLSearchParams();

  if (sortKey && sortKey !== "moi-nhat") params.append("sortKey", sortKey);
  if (sortType) params.append("sortType", sortType);
  if (price) params.append("priceRange", price);
  if (brand_id) params.append("brand_id", brand_id);
  if (sex) params.append("sex", sex);
  console.log(`/products/${slugCategory}?${params.toString()}`);

  const result = await get(`/products/${slugCategory}?${params.toString()}`);
  return result;
};

export const productReviewsGet = async (productId) => {
  const result = await get(`/products/reviews/${productId}`);
  return result;
};

export const productReviewPost = async (productId, options, tokenUser) => {
  const result = await postAuth(
    `/products/reviews/create/${productId}`,
    options,
    tokenUser
  );
  return result;
};

export const productReviewDelete = async (reviewId, tokenUser) => {
  const result = await delAuth(
    `/products/reviews/delete/${reviewId}`,
    tokenUser
  );
  return result;
};

export const productReplyDelete = async (reviewId, replyId, tokenUser) => {
  const result = await delAuth(
    `/products/reviews/delete/${reviewId}/${replyId}`,
    tokenUser
  );
  return result;
};

export const productReviewAddReply = async (reviewId, options, tokenUser) => {
  const result = await postAuth(
    `/products/reviews/replies/${reviewId}`,
    options,
    tokenUser
  );
  return result;
};

export const productsFavorite = async (tokenUser) => {
  const result = await getAuth(`/products/favorite-products`, tokenUser);
  return result;
};

export const productFavorite = async (typeFavorite, productId, tokenUser) => {
  const result = await getAuth(
    `/products/favorite/${typeFavorite}/${productId}`,
    tokenUser
  );
  return result;
};

export const productViewed = async (options) => {
  const result = await patch(`/products/viewed-products`, options);
  return result;
};
