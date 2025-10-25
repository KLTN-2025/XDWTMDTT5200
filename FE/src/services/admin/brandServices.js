import { delAuth, getAuth, patchAuth, postAuth } from "../../utils/request";
const admin = "/admin";

export const listBrand = async (token, page, limit, keyword, sortKey, sortType) => {
  const params = new URLSearchParams();

  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (keyword) params.append("keyword", keyword);
  if (sortKey && sortKey !== "default") params.append("sortKey", sortKey);
  if (sortType) params.append("sortType", sortType);

  const result = await getAuth(`${admin}/brands?${params.toString()}`, token);
  return result;
};

export const listAllBrand = async (token) => {
  const result = await getAuth(`${admin}/brands/all`, token);
  return result;
}

export const editBrand = async (id, option, token) => {
  const result = await patchAuth(`${admin}/brands/edit-item/${id}`, option, token);
  return result;
}

export const deleteBrand = async (id, token) => {
  const result = await delAuth(`${admin}/brands/delete-item/${id}`, token);
  return result;
}

export const addBrand = async (option, token) => {
  const result = await postAuth(`${admin}/brands/create-item`, option, token);
  return result;
}

export const changeStatusBrand = async (token, status, id) => {
  const result = await getAuth(`${admin}/brands/change-status/${status}/${id}`, token);
  return result;
}