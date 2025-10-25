import { post } from "../../utils/request";

export const chatBot = async (message) => {
  const result = await post(`/chatbot`, message);
  return result;
}