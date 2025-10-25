import {
  Button,
  Card,
  Input,
  Table,
  Tag,
  Form,
  Row,
  Col,
  Select,
  message,
} from "antd";
import { useMemo, useState, useCallback } from "react";
import { getCookie } from "../../../helpers/cookie";
import DeleteItem from "../../../components/DeleteItem";
import NoRole from "../../../components/NoRole";
import useBrands from "../../../hooks/admin/useBrands";
import BrandEdit from "./Edit";

function BrandList() {
  const permissions = useMemo(
    () => JSON.parse(localStorage.getItem("permissions")) || [],
    []
  );

  const token = getCookie("token");

  // State quản lý
  const [limit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [sortKey, setSortKey] = useState("default");
  const [sortType, setSortType] = useState("asc");

  const { updateStatus, brandsQuery } = useBrands({
    token,
    currentPage,
    limit,
    keyword,
    sortKey,
    sortType,
  });

  // Dữ liệu thương hiệu và tổng trang
  const data = brandsQuery.data?.brands || [];
  const totalPage = brandsQuery.data?.totalPage || 0;

  // 🔄 Reload table khi cần
  const handleReload = useCallback(() => {
    brandsQuery.refetch();
  }, [brandsQuery]);

  // 🟩 Xử lý thay đổi trạng thái
  const handleClickStatus = useCallback(
    (e) => {
      const [statusChange, id] = e.target.dataset.id.split("-");
      if (permissions.includes("brands_edit")) {
        updateStatus.mutate({ statusChange, id });
      } else {
        message.error("Bạn không có quyền chỉnh sửa thương hiệu!");
      }
    },
    [permissions, updateStatus]
  );

  // 🔍 Xử lý tìm kiếm
  const onFinish = useCallback((values) => {
    setKeyword(values.keyword?.trim() || "");
    setCurrentPage(1);
  }, []);

  // ⚙️ Thay đổi sắp xếp
  const handleChangePosition = useCallback((value) => {
    setSortKey(value === "default" ? "default" : "position");
    setSortType(value);
  }, []);

  // 🔧 Cấu hình cột Table
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
        render: (thumbnail) => (
          <img
            src={thumbnail}
            alt="thumbnail"
            style={{ width: 70, marginTop: 10 }}
          />
        ),
      },
      {
        title: "Vị trí",
        dataIndex: "position",
        key: "position",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (_, record) =>
          <>
            {permissions.includes("brands_edit") ? (
              <>
                <Tag
                  color={record.status === "inactive" ? "#cd201f" : "#55acee"}
                  data-id={
                    record.status === "inactive"
                      ? `active-${record._id}`
                      : `inactive-${record._id}`
                  }
                  onClick={handleClickStatus}
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
      },
      {
        title: "Hành động",
        key: "actions",
        render: (_, record) => (
          <div style={{ display: "flex", gap: 8 }}>
            {permissions.includes("brands_edit") && (
              <BrandEdit record={record} key={`edit-${record._id}`} />
            )}
            {permissions.includes("brands_del") && (
              <DeleteItem
                record={record}
                key={`delete-${record._id}`}
                typeDelete="brand"
                onReload={handleReload}
              />
            )}
          </div>
        ),
      },
    ],
    [permissions, handleClickStatus, handleReload]
  );

  // 🧠 Không có quyền thì return luôn
  if (!permissions.includes("brands_view")) return <NoRole />;

  return (
    <Card title="Danh sách thương hiệu">
      {/* Tìm kiếm + Sắp xếp */}
      <Form onFinish={onFinish} layout="vertical">
        <Row gutter={[12, 12]}>
          <Col span={22}>
            <Form.Item name="keyword">
              <Input
                allowClear
                placeholder="Tìm kiếm thương hiệu"
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item name="btnSearch">
              <Button type="primary" htmlType="submit">
                Tìm kiếm
              </Button>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Vị trí" name="sortPosition" initialValue="default">
              <Select
                onChange={handleChangePosition}
                options={[
                  { label: "Mặc định", value: "default" },
                  { label: "Tăng", value: "asc" },
                  { label: "Giảm", value: "desc" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Bảng thương hiệu */}
      <Card style={{ marginTop: 10 }} type="inner">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="_id"
          loading={brandsQuery.isLoading}
          pagination={{
            current: currentPage,
            pageSize: limit,
            total: limit * totalPage,
            showSizeChanger: false,
            style: { display: "flex", justifyContent: "center" },
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>
    </Card>
  );
}

export default BrandList;
