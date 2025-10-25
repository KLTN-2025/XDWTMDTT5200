import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  checkVoucherGiftPost,
  checkVoucherPost,
  createPaymentMomo,
  createQrPost,
  detailOrderGet,
  successOrderPatch,
} from "../../../services/client/checkoutServies";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  message,
  Row,
  Space,
  Spin,
  Tabs,
  Typography,
  Radio,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  MailOutlined,
  NotificationFilled,
  PhoneOutlined,
  UserOutlined,
  WalletOutlined,
  BankOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import "./CheckoutPay.scss";
import Title from "antd/es/typography/Title";
import { getCookie } from "../../../helpers/cookie";
const { Text } = Typography;

function CheckoutPay() {
  const navigate = useNavigate();
  const tokenUser = getCookie("tokenUser");
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code") || "";

  const [order, setOrder] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [onlineMethod, setOnlineMethod] = useState("vnpay"); // Thêm state cho lựa chọn thanh toán online

  const fetchApi = async () => {
    try {
      const response = await detailOrderGet(code);
      
      if (response.code === 200) {
        setOrder(response.data.order);
        setDiscountAmount(response.data.order.discountAmount);
        setShippingFee(response.data.order.shippingFee);
      }
    } catch (error) { }
  };

  useEffect(() => {
    fetchApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onchange = (key) => {
    setPaymentMethod(key);
  };

  const handlePayment = () => {
    const fetchApiSuccess = async () => {
      if (paymentMethod === "bank") {
        if (onlineMethod === "vnpay") {
          try {
            const option = {
              code: code,
              Amount: order.totalOrder - discountAmount + shippingFee, // Cộng thêm phí ship
              orderInfo: `Thanh toán đơn hàng ${code}`,
            };
            const vnpayResponse = await createQrPost(option);
            if (vnpayResponse.code === 201 || vnpayResponse.code === 200) {
              window.open(vnpayResponse.payUrl);
            } else if (vnpayResponse.code === 204) {
              message.success(vnpayResponse.message)
            } else if (vnpayResponse.code === 202) {
              fetchApi();
              message.error(vnpayResponse.message)
            } else {
              message.error(vnpayResponse.message)
            }
          } catch { }
        } else if (onlineMethod === "momo") {
          try {
            const option = {
              code: code,
              amount: order.totalOrder - discountAmount + shippingFee, // Cộng thêm phí ship
              orderInfo: `Thanh toán đơn hàng ${code}`,
            };
            const momoResponse = await createPaymentMomo(option);
            if (momoResponse.code === 201 || momoResponse.code === 200) {
              window.open(momoResponse.payUrl);
            } else if (momoResponse.code === 204) {
              message.success(momoResponse.message)
            } else if (momoResponse.code === 202) {
              fetchApi();
              message.error(momoResponse.message)
            } else {
              message.error(momoResponse.message)
            }
          } catch { }
        }
      } else {
        try {
          const response = await successOrderPatch(order._id, {
            paymentMethod: paymentMethod,
          });
          if (response.code === 200) {
            message.success(response.message);
            navigate("/");
          } else if (response.code === 204) {
            fetchApi();
            message.error(response.message);
          } else {
            message.error(response.message);
          }
        } catch (error) { }
      }
    };

    fetchApiSuccess();
  };

  // Giao diện thanh toán COD
  const PaymentCOD = () => (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <WalletOutlined
        style={{ fontSize: "48px", color: "#52c41a", marginBottom: "16px" }}
      />
      <Title level={4} style={{ color: "#262626", marginBottom: "8px" }}>
        Thanh toán khi nhận hàng
      </Title>
      <Text type="secondary">
        Bạn sẽ thanh toán trực tiếp cho shipper khi nhận được hàng
      </Text>
    </div>
  );

  // Giao diện thanh toán online
  const PaymentOnline = () => (
    <div style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <CreditCardOutlined
          style={{ fontSize: "48px", color: "#1890ff", marginBottom: "16px" }}
        />
        <Title level={4} style={{ color: "#262626", marginBottom: "8px" }}>
          Thanh toán trực tuyến
        </Title>
        <Text type="secondary">Chọn phương thức thanh toán online</Text>
      </div>

      <Radio.Group
        value={onlineMethod}
        onChange={(e) => setOnlineMethod(e.target.value)}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Card
            hoverable
            className={
              onlineMethod === "vnpay"
                ? "payment-card-selected"
                : "payment-card"
            }
            onClick={() => setOnlineMethod("vnpay")}
          >
            <Radio value="vnpay" style={{ width: "100%" }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <BankOutlined
                    style={{ fontSize: "24px", color: "#1890ff" }}
                  />
                </Col>
                <Col flex="auto">
                  <div>
                    <Text strong>VNPay</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Thanh toán qua ví điện tử VNPay
                    </Text>
                  </div>
                </Col>
                <Col>
                  <img
                    src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                    alt="VNPay"
                    style={{ height: "24px", objectFit: "contain" }}
                  />
                </Col>
              </Row>
            </Radio>
          </Card>

          <Card
            hoverable
            className={
              onlineMethod === "momo" ? "payment-card-selected" : "payment-card"
            }
            onClick={() => setOnlineMethod("momo")}
          >
            <Radio value="momo" style={{ width: "100%" }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <MobileOutlined
                    style={{ fontSize: "24px", color: "#d91465" }}
                  />
                </Col>
                <Col flex="auto">
                  <div>
                    <Text strong>MoMo</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Thanh toán qua ví điện tử MoMo
                    </Text>
                  </div>
                </Col>
                <Col>
                  <img
                    src="https://developers.momo.vn/v3/assets/images/icon-52bd5808cecdb1970e1aeec3c31a3ee1.png"
                    alt="MoMo"
                    style={{ height: "24px", objectFit: "contain" }}
                  />
                </Col>
              </Row>
            </Radio>
          </Card>
        </Space>
      </Radio.Group>
    </div>
  );

  const items = [
    {
      key: "cod",
      label: (
        <Space>
          <WalletOutlined />
          <span>COD</span>
        </Space>
      ),
      children: <PaymentCOD />,
    },
    {
      key: "bank",
      label: (
        <Space>
          <CreditCardOutlined />
          <span>Thanh toán online</span>
        </Space>
      ),
      children: <PaymentOnline />,
    },
  ];

  const onFinishCheckVoucher = (e) => {
    e.order_code = code;
    const fetchApiCheckVoucher = async () => {
      const response = await checkVoucherPost(e);
      if (response.code === 200) {
        message.success(response.message);
        fetchApi();
      } else if (response.code === 204) {
        message.error(response.message);
        fetchApi();
      } else {
        message.error(response.message);
      }
    };

    fetchApiCheckVoucher();
  };

  const onFinishCheckVoucherGift = (e) => {
    e.order_code = code;

    const fetchApiCheckVoucherGift = async () => {
      const response = await checkVoucherGiftPost(e, tokenUser);
      if (response.code === 200) {
        message.success(response.message);
        fetchApi();
      } else if (response.code === 204) {
        message.error(response.message);
        fetchApi();
      } else {
        message.error(response.message);
      }
    };

    fetchApiCheckVoucherGift();
  };
  return (
    <>
      <div className="check-out">
        {order === null ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải đơn hàng..." />
          </div>
        ) : order.status !== "initialize" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <CheckCircleOutlined
                style={{
                  fontSize: 64,
                  color: "green",
                  marginBottom: 16,
                }}
              />
              <Title level={2} style={{ color: "#262626", marginBottom: 8 }}>
                Bạn đã xử lý đơn hàng này rồi!
              </Title>
            </div>
          </>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col span={14}>
                {/* Thông tin khách hàng */}
                <Card
                  title={
                    <Space>
                      <UserOutlined />
                      <span>Thông tin khách hàng</span>
                    </Space>
                  }
                >
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    {order.userInfo && (
                      <>
                        <Space>
                          <UserOutlined style={{ color: "#8c8c8c" }} />
                          <Text>{order.userInfo.fullName}</Text>
                        </Space>

                        <Space>
                          <PhoneOutlined style={{ color: "#8c8c8c" }} />
                          <Text>{order.userInfo.phone}</Text>
                        </Space>

                        <Space>
                          <MailOutlined style={{ color: "#8c8c8c" }} />
                          <Text>{order.userInfo.email}</Text>
                        </Space>

                        <Space align="start">
                          <EnvironmentOutlined
                            style={{ color: "#8c8c8c", marginTop: 4 }}
                          />
                          <Text>{order.userInfo.address}</Text>
                        </Space>

                        <Space align="start">
                          <NotificationFilled
                            style={{ color: "#8c8c8c", marginTop: 4 }}
                          />
                          <Text>{order.userInfo.note}</Text>
                        </Space>
                      </>
                    )}
                  </Space>
                </Card>

                {/* Phần thanh toán đã được cải thiện */}
                <Card
                  title={
                    <Space>
                      <CreditCardOutlined />
                      <span>Chọn phương thức thanh toán</span>
                    </Space>
                  }
                  style={{ marginTop: "16px" }}
                >
                  <div className="pay">
                    <Tabs
                      defaultActiveKey="cod"
                      items={items}
                      type="card"
                      onChange={onchange}
                      size="large"
                    />
                    <Button
                      type="primary"
                      size="large"
                      style={{
                        marginTop: 20,
                        backgroundColor: "#FFC234",
                        borderColor: "#FFC234",
                        color: "#ffffff",
                        fontWeight: "bold",
                        height: "50px",
                        fontSize: "16px",
                      }}
                      block
                      onClick={handlePayment}
                    >
                      {paymentMethod === "cod"
                        ? "🚚 Xác nhận đặt hàng (Thanh toán khi nhận)"
                        : `💳 Thanh toán ${(
                          order.totalOrder - discountAmount + shippingFee
                        ).toLocaleString()}đ`}
                    </Button>
                  </div>
                </Card>
              </Col>

              <Col span={10}>
                <div className="cart">
                  {order ? (
                    <>
                      {/* Danh sách sản phẩm */}
                      <Card title="Sản phẩm trong đơn hàng">
                        <Space
                          direction="vertical"
                          size="middle"
                          style={{ width: "100%" }}
                        >
                          {order.products.map((product, index) => (
                            <Card
                              key={product._id}
                              size="small"
                              style={{ backgroundColor: "#fafafa" }}
                            >
                              <Row gutter={16} align="middle">
                                <Col xs={6} sm={4}>
                                  <Image
                                    width={70}
                                    height={70}
                                    src={
                                      product.productInfo.thumbnail ||
                                      "/placeholder.svg"
                                    }
                                    alt={product.productInfo.title}
                                    style={{
                                      objectFit: "cover",
                                      borderRadius: 8,
                                    }}
                                    fallback="/placeholder.svg?height=80&width=80"
                                  />
                                </Col>

                                <Col xs={18} sm={14}>
                                  <Title level={5} style={{ marginBottom: 8 }}>
                                    {product.productInfo.title}
                                  </Title>
                                  <Space direction="vertical" size="small">
                                    <Text type="secondary">
                                      Size: {product.size}
                                    </Text>
                                    <Text type="secondary">
                                      Số lượng: {product.quantity}
                                    </Text>
                                    <Space>
                                      <Text delete type="secondary">
                                        {product.price.toLocaleString()} đ
                                      </Text>
                                      <Text strong style={{ color: "#ff4d4f" }}>
                                        {Number(
                                          product.priceNew
                                        ).toLocaleString()}{" "}
                                        đ
                                      </Text>
                                      <Badge
                                        count={`-${product.discountPercentage}%`}
                                        style={{ backgroundColor: "#ff4d4f" }}
                                      />
                                    </Space>
                                  </Space>
                                </Col>

                                <Col
                                  xs={24}
                                  sm={6}
                                  style={{ textAlign: "right" }}
                                >
                                  <Title
                                    level={4}
                                    style={{ color: "#8c8c8c", margin: 0 }}
                                  >
                                    {Number(
                                      product.totalPrice
                                    ).toLocaleString()}{" "}
                                    đ
                                  </Title>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                        </Space>
                      </Card>

                      {/* Thông tin thanh toán */}
                      <Card title="Thông tin thanh toán" bordered={false}>
                        <Space
                          direction="vertical"
                          style={{ width: "100%" }}
                          size="large"
                        >
                          <Row justify="space-between">
                            <Col>
                              <Text>🎟️ Voucher hiện tại:</Text>
                            </Col>
                            <Col>
                              <Text strong>
                                {order.voucher_code || "Không có"}
                              </Text>
                            </Col>
                          </Row>
                          <Text><span style={{ color: "red" }}>*</span>Lưu ý mỗi đơn hàng chỉ áp dụng được một voucher giảm giá</Text>
                          <Form
                            layout="vertical"
                            onFinish={onFinishCheckVoucher}
                            initialValues={{ discountPercentage: 0 }}
                          >
                            <Row gutter={16}>
                              <Col span={18}>
                                <Form.Item
                                  label="Nhập mã voucher"
                                  name="voucher_code"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng nhập mã voucher!",
                                    },
                                  ]}
                                >
                                  <Input placeholder="Nhập mã giảm giá..." />
                                </Form.Item>
                              </Col>
                              <Col
                                span={6}
                                style={{ display: "flex", alignItems: "end" }}
                              >
                                <Form.Item>
                                  <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                  >
                                    Kiểm tra
                                  </Button>
                                </Form.Item>
                              </Col>
                            </Row>
                          </Form>

                          {tokenUser && (
                            <>
                              <Form
                                layout="vertical"
                                onFinish={onFinishCheckVoucherGift}
                                initialValues={{ discountPercentage: 0 }}
                              >
                                <Row gutter={16}>
                                  <Col span={18}>
                                    <Form.Item
                                      label="Nhập mã voucher quà tặng của bạn"
                                      name="voucher_code"
                                      rules={[
                                        {
                                          required: true,
                                          message: "Vui lòng nhập mã voucher quà tặng của bạn!",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="Nhập mã giảm giá..." />
                                    </Form.Item>
                                  </Col>
                                  <Col
                                    span={6}
                                    style={{ display: "flex", alignItems: "end" }}
                                  >
                                    <Form.Item>
                                      <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                      >
                                        Kiểm tra
                                      </Button>
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Form>
                            </>
                          )}

                          {/* Hiển thị chi tiết phí */}
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Row justify="space-between">
                              <Col>
                                <Text>Tạm tính:</Text>
                              </Col>
                              <Col>
                                <Text>
                                  {(order.totalOrder - discountAmount).toLocaleString()} đ
                                </Text>
                              </Col>
                            </Row>

                            <Row justify="space-between">
                              <Col>
                                <Text>🚚 Phí vận chuyển:</Text>
                              </Col>
                              <Col>
                                {shippingFee === 0 ? (
                                  <Text>Miễn phí vận chuyển</Text>
                                ) : (
                                  <Text>
                                    {Number(shippingFee).toLocaleString()} đ
                                  </Text>
                                )}
                              </Col>
                            </Row>

                            <Divider style={{ margin: "8px 0" }} />

                            <Row justify="space-between">
                              <Col>
                                <Text>Giảm:</Text>
                              </Col>
                              <Col>
                                <Text>
                                  {Number(discountAmount).toLocaleString()} đ
                                </Text>
                              </Col>
                            </Row>

                            <Row
                              justify="space-between"
                              style={{ marginTop: 8 }}
                            >
                              <Col>
                                <Title
                                  level={4}
                                  strong
                                  style={{ color: "#ff4d4f" }}
                                >
                                  Tổng cần thanh toán:
                                </Title>
                              </Col>
                              <Col>
                                <Title
                                  level={4}
                                  strong
                                  style={{ color: "#ff4d4f" }}
                                >
                                  {Number(
                                    order.totalOrder - discountAmount + shippingFee
                                  ).toLocaleString()}{" "}
                                  đ
                                </Title>
                              </Col>
                            </Row>
                          </Space>
                        </Space>
                      </Card>
                    </>
                  ) : (
                    <p>Đang tải...</p>
                  )}
                </div>
              </Col>
            </Row>
          </>
        )}
      </div>
    </>
  );
}

export default CheckoutPay;
