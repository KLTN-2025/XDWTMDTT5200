import { getAuth, patchAuth } from "../../utils/request";
const admin = "/admin";

export const listOrderGet = async (token, day, month, keyword) => {
  const result = await getAuth(`${admin}/orders?day=${day}&month=${month}&keyword=${keyword}`, token);
  return result;
}

export const detailOrderGet = async (id, token) => {
  const result = await getAuth(`${admin}/orders/detail/${id}`, token);
  return result;
}

export const changeStatusOrderGet = async (token, status, code) => {
  const result = await getAuth(`${admin}/orders/change-status/${status}/${code}`, token);
  return result;
}

export const shippingSettingsGet = async (token) => {
  const result = await getAuth(`${admin}/orders/shipping-settings`, token);
  return result;
}

export const shippingSettingsPatch = async (token, data) => {
  const result = await patchAuth(`${admin}/orders/shipping-settings`, data, token);
  return result;
}