import { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, Select, Input, message } from 'antd';
import { SearchOutlined, ReloadOutlined, CarOutlined, PhoneOutlined } from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Driver } from '../types';

export const DriversPage = () => {
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

  useEffect(() => {
    fetchDrivers();
  }, [pagination.current, filters]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = {
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
        data: { list: Driver[]; total: number };
      }>('/api/drivers', params);

      if (response.success && response.data) {
        setDrivers(response.data.list);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      console.error('获取司机列表失败:', error);
      message.error('获取司机列表失败');
    } finally {
      setLoading(false);
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

  const getStatusTag = (status: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      1: { text: '空闲', color: 'success' },
      2: { text: '接单中', color: 'processing' },
      3: { text: '载客中', color: 'blue' },
      4: { text: '下线', color: 'default' },
    };

    const { text, color } = statusMap[status] || { text: '未知', color: 'default' };
    return <Tag color={color}>{text}</Tag>;
  };

  const handleCallDriver = (driver: Driver) => {
    Modal.confirm({
      title: '联系司机',
      content: `确定要拨打司机 ${driver.name} 的电话吗？\n电话：${driver.phone}`,
      onOk: () => {
        window.location.href = `tel:${driver.phone}`;
      },
    });
  };

  const columns = [
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (phone: string, record: Driver) => (
        <Space>
          <span>{phone}</span>
          <Button
            type="link"
            size="small"
            icon={<PhoneOutlined />}
            onClick={() => handleCallDriver(record)}
          >
            呼叫
          </Button>
        </Space>
      ),
    },
    {
      title: '车牌号',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      width: 100,
    },
    {
      title: '车型',
      dataIndex: 'carModel',
      key: 'carModel',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'driverStatus',
      key: 'driverStatus',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating?: number) => (
        <Tag color={rating && rating >= 4 ? 'success' : 'default'}>
          {rating || 0}分
        </Tag>
      ),
    },
    {
      title: '完成订单',
      dataIndex: 'completedOrders',
      key: 'completedOrders',
      width: 80,
    },
    {
      title: '当前位置',
      dataIndex: ['currentLocation', 'lat'],
      key: 'location',
      width: 150,
      render: (_: any, record: Driver) =>
        record.currentLocation ? (
          <span style={{ fontSize: 12 }}>
            {record.currentLocation.lat.toFixed(4)}, {record.currentLocation.lng.toFixed(4)}
          </span>
        ) : (
          <Tag>未知</Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Driver) => (
        <Space>
          <Button type="link" size="small">
            查看详情
          </Button>
          {record.driverStatus === 4 && (
            <Button type="primary" size="small">
              上线
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="drivers-page">
      <Card>
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="搜索司机姓名或电话"
            allowClear
            onPressEnter={(e: any) =>
              handleSearch({ keyword: e.target.value })
            }
          />
          <Select
            placeholder="选择状态"
            style={{ width: 120 }}
            allowClear
            onChange={(value) => handleSearch({ status: value as number })}
          >
            <Select.Option value={1}>空闲</Select.Option>
            <Select.Option value={2}>接单中</Select.Option>
            <Select.Option value={3}>载客中</Select.Option>
            <Select.Option value={4}>下线</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space.Compact>
      </Card>

      <Table
        dataSource={drivers}
        columns={columns}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => setPagination((prev) => ({ ...prev, current: page })),
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />
    </div>
  );
};
