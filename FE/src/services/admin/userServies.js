import { delAuth, getAuth} from "../../utils/request";
const admin = "/admin";

export const listUserGet = async (token) => {
  const result = await getAuth(`${admin}/users`, token);
  return result;
}

export const deleteUserDel = async (id, token) => {
  const result = await delAuth(`${admin}/users/delete/${id}`, token);
  return result;
}

export const changeStatusUserGet = async (token, status, id) => {
  const result = await getAuth(`${admin}/users/change-status/${status}/${id}`, token);
  return result;
}

export const ordersByUserGet = async (token, id) => {
  const result = await getAuth(`${admin}/users/orders-by-user/${id}`, token);
  return result;
}