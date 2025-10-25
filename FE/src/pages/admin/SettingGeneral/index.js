import { Button, Card, Col, Form, Input, message, Row, Upload } from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { getCookie } from "../../../helpers/cookie";
import { settingGeneralGet, settingGeneralPatch } from "../../../services/admin/settingGeneralServies";
import NoRole from "../../../components/NoRole";

function SettingGeneral() {
  const permissions = JSON.parse(localStorage.getItem('permissions'));

  const token = getCookie("token");

  const [form] = Form.useForm();

  // upload img
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);
  // upload img

  const fetchApi = async () => {
    try {
      const response = await settingGeneralGet(token);
      if (response.code === 200) {
        form.setFieldsValue(response.setting[0]);
        setImageUrl(response.setting[0].logo);
      } else {
        if (Array.isArray(response.message)) {
          const allErrors = response.message.map(err => err.message).join("\n");
          message.error(allErrors);
        } else {
          message.error(response.message);
        }
      }
    } catch (error) {
      message.error("Lỗi khi tải cài đặt chung:", error.message);
    }
  }

  useEffect(() => {

    fetchApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReload = () => {
    fetchApi();
  }

  const onFinish = async (e) => {
    e.logo = imageUrl ? imageUrl : "";
    e.facebook = e.facebook ? e.facebook : "";
    e.address = e.address ? e.address : "";
    e.instagram = e.instagram ? e.instagram : "";
    if (!e.websiteName) {
      message.error("Vui lòng nhập tên website!");
      return;
    }

    if (!e.email) {
      message.error("Vui lòng nhập email!");
      return;
    }

    // Kiểm tra số điện thoại
    if (!e.phone) {
      e.phone = "";
    } else {
      // Kiểm tra xem số điện thoại có phải là một chuỗi gồm toàn số và có độ dài 10 không
      const phoneRegex = /^[0-9]{10}$/;

      if (!phoneRegex.test(e.phone)) {
        message.error("Số điện thoại phải là 10 chữ số và không chứa ký tự!");
        return;
      }
    }

    if (!e.copyright) {
      message.error("Vui lòng nhập CopyRight!");
      return;
    }

    const response = await settingGeneralPatch(e, token);
    if (response.code === 200) {
      message.success("Cập nhật thành công")
      onReload();
    } else {
      message.error(response.message);
    }

  }

  // Upload ảnh
  const handleCustomRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_preset"); // Thay bằng preset của bạn

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/djckm3ust/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url); // Cập nhật link ảnh
        setFileList([
          {
            uid: data.asset_id, // Đảm bảo UID là duy nhất
            name: data.original_filename,
            status: "done",
            url: data.secure_url,
          },
        ]);
        onSuccess(data);
      }
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      onError(error);
    }
  };
  const handleRemove = () => {
    setImageUrl(""); // Xóa link ảnh
    setFileList([]); // Xóa danh sách file
  }
  // end upload ảnh

  return (
    <>
      {permissions.includes("settings_general") ?
        <Card title="Cài đặt chung">
          <Card
            style={{
              marginTop: 10,
              width: "100%"
            }}
            type="inner"
          >
            <Form onFinish={onFinish} layout="vertical" form={form} >
              <Row>
                <Col span={24}>
                  <Form.Item label="Tên website" name="websiteName">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Email" name="email">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Địa chỉ" name="address">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Facebook" name="facebook">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Instagram" name="instagram">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="CopyRight" name="copyright">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Map" name="map_url">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Logo" name="logo">
                    <div>
                      <Upload
                        name="file"
                        listType="picture-card"
                        showUploadList={{ showPreviewIcon: false }}
                        maxCount={1} // Giới hạn chỉ được chọn 1 ảnh
                        customRequest={handleCustomRequest}
                        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                        onRemove={handleRemove}
                        defaultFileList={[
                          ...(fileList.length
                            ? fileList
                            : [
                              {
                                uid: "-1", // UID duy nhất cho ảnh đã có
                                name: "existing-image", // Tên ảnh có sẵn
                                status: "done",
                                url: imageUrl, // Hiển thị ảnh hiện tại trong preview
                              },
                            ]),
                        ]}
                      >
                        {fileList.length >= 1 ? null : (
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </div>
                        )}
                      </Upload>
                      {imageUrl && (
                        <div style={{ marginTop: "10px" }}>
                          <p>Link ảnh:</p>
                          <Input value={imageUrl} readOnly />
                        </div>
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" >
                      Cập nhập
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Card>
        :
        <NoRole />
      }
    </>
  )
}

export default SettingGeneral;