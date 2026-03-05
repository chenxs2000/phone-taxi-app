import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/store';
import { apiService } from '../services/api';
import './LoginPage.css';

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await apiService.post('/api/auth/login', {
        phone: values.username,
        password: values.password,
      });

      if (response.success) {
        login(response.data.token, response.data.user);
        message.success('登录成功');
        navigate('/');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <h1>电话打车</h1>
          <p>坐席系统</p>
        </div>

        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <p>系统版本：v1.0.0</p>
          <p>技术支持：400-123-4567</p>
        </div>
      </Card>
    </div>
  );
};
