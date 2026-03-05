import { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { SearchOutlined, ReloadOutlined, CarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Order, Driver, PaginationParams } from '../types';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<{
    status?: number;
    keyword?: string;
  }>({});
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dispatchForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [pagination.current, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: PaginationParams & { keyword?: string } = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.keyword) {
        params.keyword = filters.keyword;
      }

      const response = await apiService.get<{
        success: boolean;
        data: { list: Order[]; total: number };
      }>('/api/orders', params);

      if (response.success && response.data) {
        setOrders(response.data.list);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: Driver[];
      }>('/api/drivers/available');

      if (response.success && response.data) {
        setDrivers(response.data.filter((d) => d.driverStatus === 1)); // 只显示空闲司机
      }
    } catch (error) {
      console.error('获取司机列表失败:', error);
    }
  };

  const handleSearch = (values: { status?: number; keyword?: string }) => {
    setFilters(values);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleReset = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDispatch = (order: Order) => {
    setSelectedOrder(order);
    setDispatchModalVisible(true);
    dispatchForm.resetFields();
  };

  const handleDispatchSubmit = async () => {
    try {
      const values = await dispatchForm.validateFields();
      await apiService.post(`/api/orders/${selectedOrder?._id}/dispatch`, {
        driverId: values.driverId,
      });
      message.success('派单成功');
      setDispatchModalVisible(false);
      fetchOrders();
    } catch (error: any) {
      message.error(error.response?.data?.message || '派单失败');
    }
  };

  const getStatusTag = (status: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      1: { text: '待派单', color: 'default' },
      2: { text: '待接单', color: 'processing' },
      3: { text: '已接单', color: 'blue' },
      4: { text: '已到达', color: 'cyan' },
      5: { text: '行程中', color: 'geekblue' },
      6: { text: '已完成', color: 'success' },
      7: { text: '已取消', color: 'error' },
      8: { text: '已超时', color: 'warning' },
    };

    const { text, color } = statusMap[status] || { text: '未知', color: 'default' };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
    },
    {
      title: '乘客数',
      dataIndex: 'passengerCount',
      key: 'passengerCount',
      width: 80,
    },
    {
      title: '上车地址',
      dataIndex: ['pickup', 'address'],
      key: 'pickup',
      width: 200,
    },
    {
      title: '目的地',
      dataIndex: ['destination', 'address'],
      key: 'destination',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '预估费用',
      dataIndex: ['fare', 'estimated'],
      key: 'fare',
      width: 100,
      render: (fare: number) => `¥${(fare / 100).toFixed(2)}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Order) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/orders/${record._id}`)}
          >
            查看
          </Button>
          {record.orderStatus === 1 && (
            <Button
              type="primary"
              size="small"
              icon={<CarOutlined />}
              onClick={() => handleDispatch(record)}
            >
              派单
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="orders-page">
      <Card>
        <Form layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input placeholder="搜索订单号或地址" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="选择状态"
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value={1}>待派单</Select.Option>
              <Select.Option value={2}>待接单</Select.Option>
              <Select.Option value={3}>已接单</Select.Option>
              <Select.Option value={5}>行程中</Select.Option>
              <Select.Option value={6}>已完成</Select.Option>
              <Select.Option value={7}>已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => setPagination((prev) => ({ ...prev, current: page })),
        }}
      />

      <Modal
        title="手动派单"
        open={dispatchModalVisible}
        onOk={handleDispatchSubmit}
        onCancel={() => setDispatchModalVisible(false)}
        width={600}
      >
        <Form form={dispatchForm} layout="vertical">
          <Form.Item label="订单信息">
            <Card size="small">
              <p><strong>订单号：</strong>{selectedOrder?.orderNo}</p>
              <p><strong>上车地址：</strong>{selectedOrder?.pickup.address}</p>
              <p><strong>目的地：</strong>{selectedOrder?.destination.address}</p>
            </Card>
          </Form.Item>
          <Form.Item
            name="driverId"
            label="选择司机"
            rules={[{ required: true, message: '请选择司机' }]}
          >
            <Select
              placeholder="请选择司机"
              showSearch
              optionFilterProp="children"
            >
              {drivers.map((driver) => (
                <Select.Option key={driver._id} value={driver._id}>
                  {driver.name} - {driver.licensePlate} - {driver.carModel}
                  <Tag color="success">{driver.rating}分</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
