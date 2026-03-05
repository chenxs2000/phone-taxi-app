import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { TestPage } from './pages/TestPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { DriversPage } from './pages/DriversPage';

// 主题配置
const appTheme = {
  token: {
    colorPrimary: '#1890ff',
  },
};

function App() {
  return (
    <ConfigProvider theme={appTheme} locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* 测试路由 */}
          <Route path="/test" element={<TestPage />} />

          {/* 公开路由 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 受保护的路由 */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/notifications" element={<div>通知中心（待开发）</div>} />
            <Route path="/profile" element={<div>个人中心（待开发）</div>} />
            <Route path="/settings" element={<div>系统设置（待开发）</div>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
