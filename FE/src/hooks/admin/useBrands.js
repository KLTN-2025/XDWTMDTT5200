import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addBrand,
  changeStatusBrand,
  deleteBrand,
  editBrand,
  listBrand,
} from "../../services/admin/brandServices";
import { message } from "antd";

function useBrands({ token, currentPage, limit, keyword, sortKey, sortType } = {}) {
  const queryClient = useQueryClient();

  // 🟩 1. Lấy danh sách thương hiệu (GET)
  const brandsQuery = useQuery({
    queryKey: ["brands", { currentPage, limit, keyword, sortKey, sortType }],
    queryFn: async () => {
      const res = await listBrand(token, currentPage, limit, keyword, sortKey, sortType);
      return res.data; // Chỉ trả về data cần thiết
    },
    enabled: !!token, // chỉ chạy khi có token
    keepPreviousData: true, // giữ data cũ khi phân trang
    staleTime: 60 * 1000, // cache sống trong 1 phút
    retry: 1, // chỉ thử lại 1 lần nếu lỗi
  });

  // 🟩 2. Thêm mới thương hiệu (CREATE)
  const createBrand = useMutation({
    mutationFn: (newBrand) => addBrand(newBrand, token),
    onSuccess: (response) => {
      if (response?.code === 200) {
        message.success("Thêm mới thương hiệu thành công");
        // Chỉ invalid danh sách, không xoá cache khác
        queryClient.invalidateQueries({ queryKey: ["brands"] });
      } else {
        handleErrorResponse(response);
      }
    },
    onError: (error) => handleNetworkError(error),
  });

  // 🟩 3. Cập nhật thương hiệu (UPDATE)
  const updateBrand = useMutation({
    mutationFn: ({ id, data }) => editBrand(id, data, token),
    onSuccess: (response) => {
      if (response?.code === 200) {
        message.success("Cập nhật thương hiệu thành công");
        // Cập nhật cache trực tiếp, tránh refetch toàn bộ
        queryClient.invalidateQueries({ queryKey: ["brands"] });
      } else {
        handleErrorResponse(response);
      }
    },
    onError: (error) => handleNetworkError(error),
  });

  // 🟩 4. Thay đổi trạng thái (UPDATE status)
  const updateStatus = useMutation({
    mutationFn: ({ statusChange, id }) => changeStatusBrand(token, statusChange, id),

    onSuccess: (response) => {
      if (response?.code === 200) {
        message.success("Thay đổi trạng thái thành công");

        // ⚡ Buộc query re-fetch để UI cập nhật lại
        queryClient.invalidateQueries({
          queryKey: ["brands"],
          exact: false,
        });
      } else {
        handleErrorResponse(response);
      }
    },

    onError: (error) => handleNetworkError(error),
  });

  const delBrand = useMutation({
    mutationFn: ({ id }) => deleteBrand(id, token),
    onSuccess: (response) => {
      if (response?.code === 200) {
        message.success(response.message);
        // ⚡ Buộc query re-fetch để UI cập nhật lại
        queryClient.invalidateQueries({
          queryKey: ["brands"],
          exact: false,
        });
      } else {
        handleErrorResponse(response);
      }
    },

    onError: (error) => handleNetworkError(error),
  });

  // 🧩 Helper: Xử lý lỗi phản hồi API
  const handleErrorResponse = (response) => {
    if (!response) return message.error("Không nhận được phản hồi từ server!");
    if (Array.isArray(response.message)) {
      const errors = response.message.map((err) => err.message).join("\n");
      message.error(errors);
    } else {
      message.error(response.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  // 🧩 Helper: Xử lý lỗi mạng
  const handleNetworkError = (error) => {
    console.error("❌ Network Error:", error);
    message.error(error?.message || "Không thể kết nối đến server!");
  };

  return { brandsQuery, createBrand, updateBrand, updateStatus, delBrand };
}

export default useBrands;
