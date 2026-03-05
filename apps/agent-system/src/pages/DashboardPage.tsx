import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Badge } from 'antd';
import {
  CarOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Order, DashboardStats } from '../types';

const { Count } = Statistic;

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 获取统计数据
      const statsResponse = await apiService.get<DashboardStats>('/api/statistics/dashboard');
      setStats(statsResponse.data || statsResponse);

      // 获取最近订单
      const ordersResponse = await apiService.get<{
        success: boolean;
        data: { list: Order[] };
      }>('/api/orders/recent', { limit: 10 });
      setRecentOrders(ordersResponse.data?.list || []);
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
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
    },
    {
      title: '上车地址',
      dataIndex: ['pickup', 'address'],
      key: 'pickup',
    },
    {
      title: '目的地',
      dataIndex: ['destination', 'address'],
      key: 'destination',
    },
    {
      title: '状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '预估费用',
      dataIndex: ['fare', 'estimated'],
      key: 'fare',
      render: (fare: number) => `¥${(fare / 100).toFixed(2)}`,
    },
  ];

  return (
    <div className="dashboard-page">
      <h2 className="page-title">仪表板</h2>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats?.totalOrders || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理订单"
              value={stats?.pendingOrders || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在线司机"
              value={stats?.activeDrivers || 0}
              prefix={<CarOutlined />}
              suffix={`/ ${stats?.totalDrivers || 0}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日营收"
              value={stats?.todayRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 订单统计 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中订单"
              value={stats?.inProgressOrders || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成订单"
              value={stats?.completedOrders || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已取消订单"
              value={stats?.cancelledOrders || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月营收"
              value={stats?.monthRevenue || 0}
              precision={2}
              suffix="元"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近订单 */}
      <Card title="最近订单" loading={loading} className="recent-orders-card">
        <Table
          dataSource={recentOrders}
          columns={columns}
          rowKey="_id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};
