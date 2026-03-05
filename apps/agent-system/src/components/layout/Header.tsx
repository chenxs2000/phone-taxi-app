import { Layout, Button, Space, Dropdown, Avatar } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../services/store';
import { useAppStore } from '../../services/store';

const { Header } = Layout;

export const AppHeader = () => {
  const { user } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人中心',
    },
    {
      key: 'settings',
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      onClick: () => {
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = '/login';
      },
    },
  ];

  return (
    <Header className="app-header">
      <div className="header-left">
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
        />
        <h1 className="header-title">电话打车坐席系统</h1>
      </div>

      <div className="header-right">
        <Space size="middle">
          <Button type="text" icon={<BellOutlined />}>
            <span>通知</span>
          </Button>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text">
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || '坐席'}</span>
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};
