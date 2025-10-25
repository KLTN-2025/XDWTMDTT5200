import { Button, Col, Form, Input, message, Modal, Radio, Row } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import NoRole from "../../../components/NoRole";
import UploadFile from "../../../components/UploadFile";
import useBrands from "../../../hooks/admin/useBrands";
import MyEditor from "../../../components/MyEditor";

function BrandEdit(props) {
  const permissions = JSON.parse(localStorage.getItem('permissions'));

  const { record } = props;

  const token = getCookie("token");

  const { updateBrand } = useBrands({ token: token });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // radio
  const [valueRadio, setValueRadio] = useState(record.status === "active" ? "active" : "inactive");
  const [valueRadioFeatured, setValueRadioFeatured] = useState(record.featured === "1" ? "1" : "0");

  const onChange = (e) => {
    setValueRadio(e.target.value);
  };
  const onChangeFeatured = (e) => {
    setValueRadioFeatured(e.target.value);
  }

  // upload img
  const [thumbnailUrl, setThumbnailUrl] = useState(record.thumbnail || "");
  const [logo, setLogo] = useState(record.logo || "");
  // upload img

  useEffect(() => {
    if (!token) {
      message.error("Token không tồn tại, vui lòng đăng nhập!");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (e) => {
    e.thumbnail = thumbnailUrl ? thumbnailUrl : "";
    e.logo = logo ? logo : "";
    e.position = !e.position ? "" : Number(e.position);
    e.description = !e.description ? "" : e.description;
    e.featured = valueRadioFeatured;

    updateBrand.mutate({ id: record._id, data: e }, {
      onSuccess: (response) => {
        if (response?.code === 200) {
          handleCancel();
        }
      }
    });
  };

  return (
    <>
      {permissions.includes("brands_edit") ?
        <>
          <Button icon={<EditOutlined />} type="primary" ghost onClick={showModal} />
          <Modal
            title="Chỉnh sửa"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
            width={"70%"}
          >
            <Form onFinish={onFinish} layout="vertical" form={form}
              initialValues={record}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item label="Tiêu đề" name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Giới thiệu ngắn" name="excerpt"
                    rules={[{ required: true, message: 'Vui lòng nhập giới thiệu ngắn!' }]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item label="Vị trí" name="position" >
                    <Input
                      allowClear
                      type="number"
                      min={0}
                      placeholder="Tự tăng"
                    />
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item label="Nổi bật?" name="featured">
                    <Radio.Group onChange={onChangeFeatured} value={valueRadioFeatured}>
                      <Radio value="1">Bật</Radio>
                      <Radio value="0">Tắt</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Ảnh nhỏ" name="thumbnail">
                    <UploadFile onImageUrlsChange={setThumbnailUrl} initialImageUrls={thumbnailUrl} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Logo" name="logo">
                    <UploadFile onImageUrlsChange={setLogo} initialImageUrls={logo} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Mô tả" name="description" >
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
                    <Button type="primary" htmlType="submit" name="btn">
                      Cập nhập
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </>
        :
        <NoRole />
      }
    </>
  );
}

export default BrandEdit;
