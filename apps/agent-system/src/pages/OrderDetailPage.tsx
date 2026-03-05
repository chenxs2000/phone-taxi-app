import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Steps,
  Timeline,
  message,
  Modal,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Order, Driver } from '../types';

const { Step } = Steps;

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
      fetchDrivers();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<{
        success: boolean;
        data: Order;
      }>(`/api/orders/${id}`);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      message.error('获取订单详情失败');
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

  const handleDispatch = () => {
    if (selectedDriver) {
      Modal.confirm({
        title: '确认派单',
        content: `确定要将订单 ${order?.orderNo} 派给选中的司机吗？`,
        onOk: async () => {
          try {
            await apiService.post(`/api/orders/${id}/dispatch`, {
              driverId: selectedDriver,
            });
            message.success('派单成功');
            setDispatchModalVisible(false);
            fetchOrderDetail();
          } catch (error: any) {
            message.error(error.response?.data?.message || '派单失败');
          }
        },
      });
    } else {
      message.warning('请选择司机');
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: '确认取消订单',
      content: '确定要取消此订单吗？',
      onOk: async () => {
        try {
          await apiService.post(`/api/orders/${id}/cancel`, {
            reason: '坐席手动取消',
            cancelBy: 2, // 2-司机
          });
          message.success('订单已取消');
          fetchOrderDetail();
        } catch (error: any) {
          message.error(error.response?.data?.message || '取消订单失败');
        }
      },
    });
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

  const getOrderType = (type: number) => {
    const typeMap: Record<number, string> = {
      1: '即时',
      2: '预约',
      3: '紧急',
    };
    return typeMap[type] || '未知';
  };

  const getCarType = (type?: number) => {
    if (!type) return '未选择';
    const typeMap: Record<number, string> = {
      1: '普通',
      2: '舒适',
      3: '无障碍',
    };
    return typeMap[type] || '未知';
  };

  const getStatusStep = (status: number) => {
    const stepMap: Record<number, number> = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
    };
    return stepMap[status] ?? 0;
  };

  if (loading || !order) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Card loading={true} />
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="page-header">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
          返回列表
        </Button>
        <h2>订单详情 - {order.orderNo}</h2>
      </div>

      {/* 订单基本信息 */}
      <Card title="订单信息" className="detail-card">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="订单状态">
            {getStatusTag(order.orderStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="订单类型">
            {getOrderType(order.orderType)}
          </Descriptions.Item>
          <Descriptions.Item label="车型">
            {getCarType(order.carType)}
          </Descriptions.Item>
          <Descriptions.Item label="乘客人数">
            {order.passengerCount} 人
          </Descriptions.Item>
          <Descriptions.Item label="预估费用">
            ¥{((order.fare?.estimated || 0) / 100).toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="实际费用">
            {order.fare?.actual
              ? `¥${(order.fare.actual / 100).toFixed(2)}`
              : '未结算'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(order.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(order.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 位置信息 */}
      <Card title="行程信息" className="detail-card">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="上车地址">
            <Space direction="vertical" size={0}>
              <strong>{order.pickup.address}</strong>
              {order.pickup.landmark && <Tag>地标：{order.pickup.landmark}</Tag>}
              <span className="location-coords">
                {order.pickup.lat.toFixed(6)}, {order.pickup.lng.toFixed(6)}
              </span>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="目的地">
            <Space direction="vertical" size={0}>
              <strong>{order.destination.address}</strong>
              <span className="location-coords">
                {order.destination.lat.toFixed(6)}, {order.destination.lng.toFixed(6)}
              </span>
            </Space>
          </Descriptions.Item>
          {order.distance && (
            <Descriptions.Item label="行程距离">
              {(order.distance / 1000).toFixed(2)} 公里
            </Descriptions.Item>
          )}
          {order.duration && (
            <Descriptions.Item label="行程时长">
              {Math.floor(order.duration / 60)} 分 {order.duration % 60} 秒
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 司机信息 */}
      {order.driverId && (
        <Card
          title="司机信息"
          className="detail-card"
          extra={
            <Tag color="blue">
              <CarOutlined /> 司机已接单
            </Tag>
          }
        >
          <Descriptions column={2} bordered>
            <Descriptions.Item label="司机 ID">
              {order.driverId}
            </Descriptions.Item>
            <Descriptions.Item label="接单时间">
              {new Date(order.acceptTime || order.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 订单状态流转 */}
      <Card title="订单状态" className="detail-card">
        <Steps current={getStatusStep(order.orderStatus)} className="status-steps">
          <Step title="待派单" icon={<ClockCircleOutlined />} />
          <Step title="待接单" icon={<CarOutlined />} />
          <Step title="已接单" icon={<UserOutlined />} />
          <Step title="已到达" icon={<PhoneOutlined />} />
          <Step title="行程中" />
          <Step title="已完成" icon={<CheckCircleOutlined />} />
        </Steps>
      </Card>

      {/* 操作按钮 */}
      {order.orderStatus === 1 && (
        <Card title="操作" className="detail-card">
          <Space>
            <Button
              type="primary"
              onClick={() => setDispatchModalVisible(true)}
            >
              派单
            </Button>
            <Button danger onClick={handleCancel}>
              取消订单
            </Button>
          </Space>
        </Card>
      )}

      {/* 派单弹窗 */}
      <Modal
        title="选择司机派单"
        open={dispatchModalVisible}
        onOk={handleDispatch}
        onCancel={() => setDispatchModalVisible(false)}
        width={600}
        okText="确定派单"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p><strong>订单号：</strong>{order.orderNo}</p>
          <p><strong>上车地址：</strong>{order.pickup.address}</p>
          <p><strong>目的地：</strong>{order.destination.address}</p>
        </div>
        <Select
          placeholder="请选择司机"
          style={{ width: '100%' }}
          showSearch
          optionFilterProp="children"
          value={selectedDriver}
          onChange={setSelectedDriver}
        >
          {drivers.map((driver) => (
            <Select.Option key={driver._id} value={driver._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  {driver.name} - {driver.licensePlate} - {driver.carModel}
                </span>
                <Tag color="success">{driver.rating}分</Tag>
              </div>
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};
