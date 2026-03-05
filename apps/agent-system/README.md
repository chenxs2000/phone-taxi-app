# 电话打车 - 坐席系统

## 项目简介

坐席系统是电话打车应用的管理后台，用于坐席人员管理订单、司机、查看统计数据等功能。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand
- **UI 组件**: Ant Design
- **HTTP 客户端**: Axios
- **请求库**: TanStack Query

## 功能特性

### 已实现
- ✅ 用户登录/登出
- ✅ 仪表板（实时统计数据）
- ✅ 订单列表（查看、筛选、派单）
- ✅ 手动派单功能
- ✅ 司机信息展示

### 待开发
- ⏳ 订单详情页
- ⏳ 司机管理页
- ⏳ 通知中心
- ⏳ 个人中心
- ⏳ 系统设置

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
agent-system/
├── src/
│   ├── components/         # 可复用组件
│   │   ├── common/      # 通用组件
│   │   ├── layout/      # 布局组件
│   │   ├── orders/      # 订单相关组件
│   │   ├── drivers/      # 司机相关组件
│   │   └── dashboard/   # 仪表板组件
│   ├── services/          # 服务层
│   │   ├── api.ts       # API 客户端
│   │   └── store.ts     # 状态管理
│   ├── pages/            # 页面组件
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── hooks/            # 自定义 Hooks
│   ├── App.tsx           # 应用根组件
│   ├── App.css           # 全局样式
│   └── main.tsx          # 应用入口
├── public/               # 静态资源
├── .env                 # 环境变量
├── index.html            # HTML 模板
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|---------|------|---------|
| VITE_API_BASE_URL | API 基础 URL | http://localhost:3000 |

## 开发说明

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由配置

### 添加新 API

1. 在 `src/services/api.ts` 添加 API 方法
2. 在 `src/types/index.ts` 定义类型

### 状态管理

使用 Zustand 进行状态管理：

```typescript
import { useAuthStore } from '../services/store';

const { isAuthenticated, user, logout } = useAuthStore();
```

## 部署

### Docker 部署

```bash
docker build -t phone-taxi/agent-system .
docker run -p 8080:80 phone-taxi/agent-system
```

### Nginx 部署

构建后将 `dist` 目录部署到 Nginx 静态服务器。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License
