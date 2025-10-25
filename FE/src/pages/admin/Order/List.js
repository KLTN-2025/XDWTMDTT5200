import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import { Button, Card, Col, DatePicker, Form, Input, message, Modal, Row, Select, Space, Table } from "antd";
import { changeStatusOrderGet, listOrderGet } from "../../../services/admin/orderServies";
import { ExclamationCircleFilled } from '@ant-design/icons';
import OrderDetail from "./Detail";
import NoRole from "../../../components/NoRole";
import { formatDate } from "../../../helpers/dateTime";
import ShippingSetting from "./Shipping"
import { useCallback } from "react";

const { confirm } = Modal;

function OrderList() {
  const permissions = JSON.parse(localStorage.getItem('permissions'));

  const [orders, setOrders] = useState([]);
  const token = getCookie("token");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [keyword, setKeyword] = useState("");

  const fetchApi = async () => {
    try {
      const response = await listOrderGet(token, day, month, keyword);
      // Biến đổi mảng
      const transformedOrders = response.records.map(order => ({
        _id: order._id,
        fullName: order.userInfo.fullName,
        phone: order.userInfo.phone,
        address: order.userInfo.address,
        totalOrder: order.totalOrder,
        createdAt: order.createdAt,
        quantityOrder: order.products.reduce((sum, product) => sum + product.quantity, 0),
        products: order.products,
        paymentMethod: order.paymentMethod,
        code: order.code,
        status: order.status,
        email: order.userInfo.email,
        shippingFee: order.shippingFee,
        discountAmount: order.discountAmount,
        voucher_code: order.voucher_code,
        user_id: order.user_id
      }));

      setOrders(transformedOrders)
    } catch (error) {
      console.log(error.message);

      message.error('Lỗi khi tải dữ liệu vai trò!');
    }
  }

  useEffect(() => {
    console.log("1");

    fetchApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, month, keyword])

  const handleReload = () => {
    fetchApi();
  }

  const handleChangeStatus = (newStatus, code) => {
    confirm({
      title: 'Bạn chắc chắn muốn thay đổi trạng thái đơn hàng?',
      icon: <ExclamationCircleFilled />,
      onOk() {
        const fetchApiChangeStatus = async () => {
          const response = await changeStatusOrderGet(token, newStatus, code);

          if (response.code === 200) {
            message.success(response.message);
            handleReload();
          } else {
            message.error(response.message);
          }
        };

        fetchApiChangeStatus();
      },
      onCancel() { },
    });
  };

  // Data đổ vào table

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'CODE',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <b>{text}</b>
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (_, record) => {
        return (
          <span>
            {record.user_id ? (
              <p style={{ color: "blue" }}>Thành viên</p>
            ) : (
              <p style={{ color: "red" }}>Vãng lai
              </p>
            )}
          </span>
        )
      }
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        // Tính toán option cần disable
        const disabledOptions = {
          initialize: ['initialize', 'received', 'processing', 'shipping', 'completed', 'returned'],
          confirmed: ['initialize', 'confirmed', 'received', 'shipping', 'completed', 'returned'],
          received: ['initialize', 'received', 'shipping', 'completed', 'returned', 'processing'],
          processing: ['initialize', 'confirmed', 'processing', 'completed'],
          shipping: ['initialize', 'confirmed', 'received', 'processing', 'shipping'],
          completed: ['initialize', 'confirmed', 'received', 'processing', 'shipping', 'completed', 'cancelled', 'returned'],
          cancelled: ['initialize', 'confirmed', 'received', 'processing', 'shipping', 'completed', 'cancelled', 'returned'],
          returned: ['initialize', 'confirmed', 'received', 'processing', 'shipping', 'completed', 'cancelled', 'returned'],
        };

        return (
          <Select
            defaultValue={record.status}
            style={{ width: 180 }}
            onChange={(value) => handleChangeStatus(value, record.code)}
          >
            <Select.Option
              value="initialize"
              disabled={disabledOptions[record.status].includes("initialize")}
            >
              <span>Khởi tạo</span>
            </Select.Option>

            <Select.Option
              value="received"
              disabled={disabledOptions[record.status].includes("received")}
            >
              <span >Đã thanh toán</span>
            </Select.Option>

            <Select.Option
              value="confirmed"
              disabled={disabledOptions[record.status].includes("confirmed")}
            >
              <span>Đã xác nhận đơn</span>
            </Select.Option>

            <Select.Option
              value="processing"
              disabled={disabledOptions[record.status].includes("processing")}
            >
              <span>Đang xử lý đơn</span>
            </Select.Option>

            <Select.Option
              value="shipping"
              disabled={disabledOptions[record.status].includes("shipping")}
            >
              <span>Đang giao hàng</span>
            </Select.Option>

            <Select.Option
              value="completed"
              disabled={disabledOptions[record.status].includes("completed")}
            >
              <span style={{ color: "green" }}>Hoàn thành</span>
            </Select.Option>

            <Select.Option
              value="cancelled"
              disabled={disabledOptions[record.status].includes("cancelled")}
            >

              <span style={{ color: "red" }}>Đã hủy</span>
            </Select.Option>

            <Select.Option
              value="returned"
              disabled={disabledOptions[record.status].includes("returned")}
            >
              <span>Hoàn hàng / Hoàn tiền</span>
            </Select.Option>
          </Select>

        );
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalOrder',
      key: 'totalOrder',
      render: (_, record) => {
        return (
          <span>{Number(record.totalOrder - record.discountAmount + record.shippingFee).toLocaleString()}đ
          </span>
        )
      }
    },
    {
      title: 'Số lượng SP',
      dataIndex: 'quantityOrder',
      key: 'quantityOrder',
    },
    {
      title: 'Voucher',
      dataIndex: 'voucher_code',
      key: 'voucher_code',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => formatDate(text)
    },
    {
      title: 'Hành động',
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record) => {
        return (
          <>
            <div key={`action-${record._id}`}>
              <OrderDetail record={record} shippingFee={record.shippingFee} />
            </div>
          </>
        )
      }
    }
  ];

  const onChangeDay = (_date, dateString) => {
    setMonth("");
    setDay(dateString);
  };
  const onChangeMonth = (_date, dateString) => {
    setDay("");
    setMonth(dateString);
  };
  const handleSearch = useCallback((values) => setKeyword(values.keyword || ""), []);
  return (
    <>
      {permissions.includes("orders_view") ?
        <Card title="Danh sách đơn hàng" style={{ height: "100vh" }}>
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
              <Col span={2}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Tìm kiếm
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Card
            style={{
              marginTop: 10,
              width: "100%"
            }}
            type="inner"
          >
            <Space direction="horizontal" size={12} style={{ marginBottom: 10 }}>
              <DatePicker onChange={onChangeDay} />
              <DatePicker onChange={onChangeMonth} picker="month" />
              <ShippingSetting />
            </Space>
            <Table
              dataSource={orders}
              columns={columns}
              className='table-list'
              rowKey={(record) => record._id} // Đảm bảo rằng mỗi hàng trong bảng có key duy nhất
              pagination={{
                pageSize: 10, // Số mục trên mỗi trang
                total: orders.length, // Tổng số mục (dựa trên data)
                showSizeChanger: false, // Ẩn tính năng thay đổi số mục trên mỗi trang
                style: { display: 'flex', justifyContent: 'center' }, // Căn giữa phân trang
              }}
            />
          </Card>
        </Card>
        :
        <NoRole />
      }
    </>
  )
}

export default OrderList;