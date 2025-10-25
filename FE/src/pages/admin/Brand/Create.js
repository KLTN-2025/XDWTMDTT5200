import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Switch,
  Radio,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import NoRole from "../../../components/NoRole";
import UploadFile from "../../../components/UploadFile";
import { useNavigate } from "react-router-dom";
import useBrands from "../../../hooks/admin/useBrands";
import MyEditor from "../../../components/MyEditor";

function BrandCreate() {
  const permissions = JSON.parse(localStorage.getItem("permissions"));
  const token = getCookie("token"); // Lấy token từ cookie
  const [loading, setLoading] = useState(false);
  const { createBrand } = useBrands({ token: token }); // Sử dụng hook tùy chỉnh với token

  const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng

  // upload img
  const [logo, setLogo] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    if (!token) {
      message.error("Token không tồn tại, vui lòng đăng nhập!");
      return;
    }
  }, [token]); // Thêm token vào dependency để đảm bảo cập nhật khi token thay đổi

  // xử lý submit
  const onFinish = async (e) => {
    // Validate dữ liệu trước khi gửi
    e.thumbnail = thumbnail ? thumbnail : "";
    e.logo = logo ? logo : "";
    e.status = e.status ? "active" : "inactive";
    e.featured = e.featured === 0 ? "0" : "1";
    e.position = !e.position ? "" : Number(e.position);
    e.description = !e.description ? "" : e.description;
    setLoading(true);
    try {
      createBrand.mutate(e, {
        onSuccess: (response) => {
          if (response?.code === 200) {
            navigate("/admin/brands");
          }
        },
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  // end xử lý submit

  return (
    <>
      {permissions.includes("brands_create") ? (
        <Card title="Thêm mới thương hiệu">
          <Card
            style={{
              marginTop: 10,
              width: "100%",
            }}
            type="inner"
          >
            <Form
              onFinish={onFinish}
              layout="vertical"
              initialValues={{ discountPercentage: 0 }}
            >
              <Row gutter={[12, 12]}>
                <Col span={24}>
                  <Form.Item
                    label="Tiêu đề"
                    name="title"
                    rules={[
                      { required: true, message: "Vui lòng nhập tiêu đề!" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Giới thiệu ngắn"
                    name="excerpt"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giới thiệu ngắn!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="Vị trí" name="position">
                    <Input
                      allowClear
                      min={0}
                      type="number"
                      placeholder="Tự tăng"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Nổi bật?" name="featured" initialValue={1}>
                    <Radio.Group>
                      <Radio value={1}>Nổi bật</Radio>
                      <Radio value={0}>Không nổi bật</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Ảnh nhỏ" name="thumbnail">
                    <UploadFile onImageUrlsChange={setThumbnail} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Logo" name="logo">
                    <UploadFile onImageUrlsChange={setLogo} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Mô tả" name="description">
                    <MyEditor />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Tắt hoạt động / Hoạt động " name="status">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-none rounded-lg font-semibold text-lg"
                    >
                      {loading ? "Đang thêm..." : "Thêm"}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Card>
      ) : (
        <NoRole />
      )}
    </>
  );
}

export default BrandCreate;
