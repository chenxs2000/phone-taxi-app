import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  OrderedListOutlined,
  CarOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../services/store';
import './Sidebar.css';

const { Sider } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表板',
  },
  {
    key: '/orders',
    icon: <OrderedListOutlined />,
    label: '订单管理',
  },
  {
    key: '/drivers',
    icon: <CarOutlined />,
    label: '司机管理',
  },
  {
    key: '/notifications',
    icon: <BellOutlined />,
    label: '通知中心',
  },
  {
    key: '/profile',
    icon: <UserOutlined />,
    label: '个人中心',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed } = useAppStore();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === '/logout') {
      handleLogout();
    } else {
      navigate(key as string);
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      const { logout } = useAuthStore.getState();
      logout();
      navigate('/login');
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={sidebarCollapsed}
      className="sidebar"
    >
      <div className="sidebar-logo">
        <h2>电话打车</h2>
        <p>坐席系统</p>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
      <div className="sidebar-logout">
        <Menu theme="dark" mode="inline" onClick={handleMenuClick}>
          <Menu.Item key="/logout" icon={<LogoutOutlined />}>
            退出登录
          </Menu.Item>
        </Menu>
      </div>
    </Sider>
  );
};
