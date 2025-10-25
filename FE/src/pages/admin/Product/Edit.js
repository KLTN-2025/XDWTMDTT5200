import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
} from "antd";
import {
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMemo, useState, useCallback } from "react";
import { getCookie } from "../../../helpers/cookie";
import useProducts from "../../../hooks/admin/useProducts";
import NoRole from "../../../components/NoRole";
import UploadFile from "../../../components/UploadFile";
import UploadFiles from "../../../components/UploadFiles";
import MyEditor from "../../../components/MyEditor";

const convertSizeStock = (rawList = []) =>
  rawList.map((item) => {
    const [size, quantity] = item.split("-");
    return { size: size.trim(), quantity: parseInt(quantity.trim(), 10) || 0 };
  });

function ProductEdit(props) {
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  const token = getCookie("token");
  const { updateProduct } = useProducts({ token });

  const { record, brands, categories } = props

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(record.thumbnail);
  const [imageUrls, setImageUrls] = useState(record.images || []);
  const [valueRadio, setValueRadio] = useState(record.status);
  const [valueRadioFeatured, setValueRadioFeatured] = useState(record.featured);

  const [form] = Form.useForm();

  /** ✅ useMemo để tránh re-render options mỗi lần render */
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.title, value: c._id })),
    [categories]
  );
  const brandOptions = useMemo(
    () => brands.map((b) => ({ label: b.title, value: b._id })),
    [brands]
  );

  /** ✅ Dùng useCallback để tránh re-create hàm mỗi render */
  const showModal = useCallback(() => setIsModalOpen(true), []);
  const handleCancel = useCallback(() => setIsModalOpen(false), []);

  const onChange = useCallback((e) => setValueRadio(e.target.value), []);
  const onChangeFeatured = useCallback(
    (e) => setValueRadioFeatured(e.target.value),
    []
  );

  /** ✅ onFinish: không tạo lại object tạm không cần thiết */
  const onFinish = useCallback(
    async (values) => {
      const data = {
        ...values,
        thumbnail: thumbnailUrl || "",
        images: imageUrls || [],
        position: Number(values.position) || "",
        product_category_id: values.product_category_id || "",
        description: values.description || "",
        featured: valueRadioFeatured,
        price: Number(values.price) || 0,
        discountPercentage: Number(values.discountPercentage) || 0,
        additionalInformation: values.additionalInformation || "",
        productSizeChart: values.productSizeChart || "",
        outfitSuggestions: values.outfitSuggestions || "",
        sizeStock: (values.sizeStock || [])
          .filter((v) => v.size && v.quantity > 0)
          .map((v) => `${v.size}-${v.quantity}`),
        status: valueRadio,
      };

      updateProduct.mutate(
        { id: record._id, data },
        {
          onSuccess: (response) => {
            if (response?.code === 200) {
              handleCancel();
            }
          },
        }
      );
    },
    [
      thumbnailUrl,
      imageUrls,
      valueRadio,
      valueRadioFeatured,
      record._id,
      updateProduct,
      handleCancel,
    ]
  );

  if (!permissions.includes("products_edit")) return <NoRole />;

  return (
    <>
      <Button
        icon={<EditOutlined />}
        type="primary"
        ghost
        onClick={showModal}
      />

      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="70%"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            ...record,
            sizeStock: convertSizeStock(record.sizeStock),
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: "Nhập tiêu đề!" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Giới thiệu ngắn"
                name="excerpt"
                rules={[{ required: true, message: "Nhập giới thiệu ngắn!" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                label="Danh mục"
                name="product_category_id"
                rules={[{ required: true, message: "Chọn danh mục!" }]}
              >
                <Select options={categoryOptions} placeholder="Chọn danh mục" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                label="Thương hiệu"
                name="brand_id"
                rules={[{ required: true, message: "Chọn thương hiệu!" }]}
              >
                <Select options={brandOptions} placeholder="Chọn thương hiệu" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: "Nhập giá!" }]}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item label="Tổng số lượng" name="stock">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item
                label="Giảm giá (%)"
                name="discountPercentage"
                rules={[{ required: true, message: "Nhập phần trăm giảm!" }]}
              >
                <Input type="number" min={0} max={100} />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item label="Vị trí" name="position">
                <Input type="number" min={0} placeholder="Tự tăng" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item label="Giới tính" name="sex" initialValue={0}>
                <Radio.Group>
                  <Radio value={0}>Nam</Radio>
                  <Radio value={1}>Nữ</Radio>
                  <Radio value={2}>Unisex</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item label="Nổi bật?" name="featured">
                <Radio.Group
                  onChange={onChangeFeatured}
                  value={valueRadioFeatured}
                >
                  <Radio value="1">Bật</Radio>
                  <Radio value="0">Tắt</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Card type="inner" style={{ marginTop: 10 }}>
                <Form.Item label="Kích cỡ & Số lượng" required>
                  <Form.List
                    name="sizeStock"
                    initialValue={[{ size: "", quantity: 0 }]}
                  >
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row
                            key={key}
                            gutter={12}
                            align="middle"
                            style={{ marginBottom: 12 }}
                          >
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, "size"]}
                                rules={[
                                  { required: true, message: "Nhập kích cỡ!" },
                                ]}
                              >
                                <Input placeholder="VD: S, M, L, XL..." />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, "quantity"]}
                                rules={[
                                  { required: true, message: "Nhập số lượng!" },
                                ]}
                              >
                                <Input type="number" min={0} placeholder="1" />
                              </Form.Item>
                            </Col>
                            <Col span={4} style={{ textAlign: "center" }}>
                              {fields.length > 1 && (
                                <MinusCircleOutlined
                                  style={{ fontSize: 20, cursor: "pointer" }}
                                  onClick={() => remove(name)}
                                />
                              )}
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Thêm kích cỡ
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              </Card>
            </Col>

            <Col span={24}>
              <Form.Item label="Ảnh nhỏ" name="thumbnail">
                <UploadFile
                  onImageUrlsChange={setThumbnailUrl}
                  initialImageUrls={thumbnailUrl}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Ảnh mô tả" name="images">
                <UploadFiles
                  onImageUrlsChange={setImageUrls}
                  initialImageUrls={imageUrls}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Mô tả" name="description">
                <MyEditor />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Thông tin thêm" name="additionalInformation">
                <MyEditor />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Gợi ý phối đồ" name="outfitSuggestions">
                <MyEditor />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Bảng kích thước" name="productSizeChart">
                <MyEditor />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Trạng thái" name="status">
                <Radio.Group onChange={onChange} value={valueRadio}>
                  <Radio value="active">Bật</Radio>
                  <Radio value="inactive">Tắt</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}

export default ProductEdit;
