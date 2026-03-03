# 使用官方 Node.js 镜像作为基础
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e js \
    "const http = require('http'); \
    http.get('http://localhost:3001/health', (res) => {\
      process.exit(res.statusCode === 200 ? 0 : 1);\
    });"

# 启动应用
CMD ["node", "dist/main.js"]
