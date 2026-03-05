import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AppHeader } from './Header';
import { useAuthStore } from '../../services/store';
import './AppLayout.css';

const { Content } = Layout;

export const AppLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <Layout className="app-layout">
      <Sidebar />
      <Layout className="app-layout-main">
        <AppHeader />
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
