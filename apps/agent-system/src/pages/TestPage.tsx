import { Card } from 'antd';

export const TestPage = () => {
  return (
    <div style={{ padding: '50px' }}>
      <Card title="测试页面">
        <h1>坐席系统测试</h1>
        <p>如果你能看到这个页面，说明 React 正常工作！</p>
        <p>时间：{new Date().toLocaleString('zh-CN')}</p>
      </Card>
    </div>
  );
};
