import { Button, Card, Input, Table, Tag, Form, Row, Col, Select, message } from "antd";
import { useMemo, useState, useCallback } from "react";
import { getCookie } from "../../../helpers/cookie";
import DeleteItem from "../../../components/DeleteItem";
import ProductEdit from "./Edit";
import NoRole from "../../../components/NoRole";
import useProducts from "../../../hooks/admin/useProducts";
import { listAllCategory } from "../../../services/admin/categoryServies";
import { listAllBrand } from "../../../services/admin/brandServices";
import dayjs from "dayjs";
import { useEffect } from "react";
import ProductReview from "./Review";
dayjs.locale("vi")

function ProductList() {
  const permissions = useMemo(() => JSON.parse(localStorage.getItem("permissions")) || [], []);
  const token = getCookie("token");

  // 🧩 State quản lý phân trang, lọc, sắp xếp
  const [limit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [sortKey, setSortKey] = useState("default");
  const [sortType, setSortType] = useState("asc");
  const [status, setStatus] = useState("default");
  const [category, setCategory] = useState("default");
  const [brand, setBrand] = useState("default");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const { updateStatus, productsQuery } = useProducts({
    token,
    currentPage,
    limit,
    keyword,
    sortKey,
    sortType,
    status,
    category,
    brand
  });

  useEffect(() => {
    if (!token) {
      message.error("Token không tồn tại, vui lòng đăng nhập!");
      return;
    }
    (async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          listAllCategory(token),
          listAllBrand(token),
        ]);
        if (catRes?.data) setCategories(catRes.data);
        if (brandRes?.data) setBrands(brandRes.data);
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu danh mục hoặc thương hiệu");
      }
    })();
  }, [token]);

  // Lấy dữ liệu sản phẩm
  const data = productsQuery.data?.products ?? [];
  const totalPage = productsQuery.data?.totalPage ?? 0;

  /** ✅ useMemo để tránh re-render options mỗi lần render */
  const categoryOptions = useMemo(
    () => [
      { label: "Tất cả", value: "default" },
      ...categories.map((c) => ({ label: c.title, value: c._id })),
    ],
    [categories]
  );

  const brandOptions = useMemo(
    () => [
      { label: "Tất cả", value: "default" },
      ...brands.map((b) => ({ label: b.title, value: b._id })),
    ],
    [brands]
  );

  // 🧠 Handlers (memoized để tránh re-render)
  const handleChangeStatus = useCallback(
    (e) => {
      const [statusChange, id] = e.target.dataset.id.split("-");
      if (!permissions.includes("products_edit"))
        return message.error("Bạn không có quyền chỉnh sửa sản phẩm!");
      updateStatus.mutate({ statusChange, id });
    }, [permissions, updateStatus]);

    // filter
  const handleSearch = useCallback((values) => setKeyword(values.keyword || ""), []);
  const handleSortChange = useCallback((key) => (value) => {
    setSortKey(key);
    setSortType(value);
  }, []);
  const handleSortStatus = useCallback((key) => (value) => {
    setStatus(value);
  }, []);
  const handleFilterCategory = useCallback((key) => (value) => {
    setCategory(value);
  }, []);
  const handleFilterBrand = useCallback((key) => (value) => {
    setBrand(value);
  }, []);
  // end filter


  const columns = useMemo(
    () => [
      {
        title: "Tên sản phẩm",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "Ảnh",
        dataIndex: "thumbnail",
        key: "thumbnail",
        render: (url) => (
          <img
            src={url}
            alt="Uploaded"
            style={{ width: 70, display: "block", marginTop: 10 }}
          />
        ),
      },
      {
        title: "Đã bán",
        dataIndex: "sold",
        key: "sold",
      },
      {
        title: "Giá",
        dataIndex: "price",
        key: "price",
        render: (price) =>
          new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price),
      },
      {
        title: "Số lượng",
        dataIndex: "stock",
        key: "stock",
      },
      {
        title: "Giảm giá (%)",
        dataIndex: "discountPercentage",
        key: "discountPercentage",
      },
      {
        title: 'Người tạo',
        dataIndex: 'fullName',
        key: 'fullName',
        render: (_, record) => {
          return (
            <>
              <p>{record.createBy.fullName || 'N/A'}</p>
              <b>{record.createdAt ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm") : 'N/A'}</b>
            </>
          );
        }
      },
      {
        title: 'Cập nhật bởi',
        dataIndex: 'updatedBy',
        key: 'updatedBy',
        render: (_, record) => {
          const latestUpdate = record.updatedBy?.[record.updatedBy.length - 1];
          return (
            <>
              <p>{latestUpdate?.fullName || 'N/A'}</p>
              <b>{latestUpdate ? dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm") : 'N/A'}</b>
            </>
          );
        }
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (_, record) => (
          <>
            {permissions.includes("products_edit") ? (
              <>
                <Tag
                  color={record.status === "inactive" ? "#cd201f" : "#55acee"}
                  data-id={
                    record.status === "inactive"
                      ? `active-${record._id}`
                      : `inactive-${record._id}`
                  }
                  onClick={handleChangeStatus}
                  style={{ cursor: "pointer" }}
                >
                  {record.status === "inactive" ? "Ngừng hoạt động" : "Hoạt động"}
                </Tag>
              </>
            ) : (
              <>
                <Tag
                  color={record.status === "inactive" ? "#cd201f" : "#55acee"}
                  data-id={
                    record.status === "inactive"
                      ? `active-${record._id}`
                      : `inactive-${record._id}`
                  }
                >
                  {record.status === "inactive" ? "Ngừng hoạt động" : "Hoạt động"}
                </Tag>
              </>
            )}
          </>
        ),
      },
      {
        title: "Hành động",
        key: "actions",
        render: (_, record) => (
          <div>
            {permissions.includes("products_view") &&
              <ProductReview product_id={record._id} slug={record.slug}/>
            }
            {permissions.includes("products_edit") &&
              <ProductEdit record={record} categories={categories} brands={brands} />
            }
            {permissions.includes("products_del") && (
              <DeleteItem record={record} typeDelete="product" />
            )}
          </div>
        ),
      },
    ], [permissions, handleChangeStatus, categories, brands]);

  // 🧭 Render giao diện
  if (!permissions.includes("products_view")) return <NoRole />;


  return (
    <Card title="Danh sách sản phẩm">
      <Form onFinish={handleSearch} layout="vertical">
        <Row gutter={[12, 12]}>
          <Col span={22}>
            <Form.Item name="keyword">
              <Input
                allowClear
                placeholder="Tìm kiếm"
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Form.Item>
          </Col>

          {/* Sort giá */}
          <Col span={4}>
            <Form.Item label="Giá" name="sortPrice" initialValue="default">
              <Select
                onChange={handleSortChange("price")}
                options={[
                  { label: "Mặc định", value: "default" },
                  { label: "Tăng", value: "asc" },
                  { label: "Giảm", value: "desc" },
                ]}
              />
            </Form.Item>
          </Col>

          {/* Sort status */}
          <Col span={4}>
            <Form.Item label="Trạng thái" name="sortStatus" initialValue="default">
              <Select
                onChange={handleSortStatus("status")}
                options={[
                  { label: "Tất cả", value: "default" },
                  { label: "Hoạt động", value: "active" },
                  { label: "Ngưng hoạt động", value: "inactive" },
                ]}
              />
            </Form.Item>
          </Col>

          {/* Sort số lượng */}
          <Col span={4}>
            <Form.Item label="Số lượng" name="sortStock" initialValue="default">
              <Select
                onChange={handleSortChange("stock")}
                options={[
                  { label: "Mặc định", value: "default" },
                  { label: "Tăng", value: "asc" },
                  { label: "Giảm", value: "desc" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Lọc theo danh mục"
              name="product_category_id"
            >
              <Select
                onChange={handleFilterCategory("category")}
                options={categoryOptions}
                placeholder="Chọn danh mục" />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Lọc theo thương hiệu"
              name="brand_id"
            >
              <Select
                onChange={handleFilterBrand("brand")}
                options={brandOptions}
                placeholder="Chọn thương hiệu" />
            </Form.Item>
          </Col>

        </Row>
      </Form>

      <Card style={{ marginTop: 10 }} type="inner">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="_id"
          loading={productsQuery.isFetching}
          pagination={{
            current: currentPage,
            pageSize: limit,
            total: limit * totalPage,
            showSizeChanger: false,
            onChange: setCurrentPage,
            style: { display: "flex", justifyContent: "center" },
          }}
        />
      </Card>
    </Card>
  );
}

export default ProductList;
