# 统计服务 Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production
RUN npm run build

EXPOSE 3006

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e js \
    "const http = require('http'); \
    http.get('http://localhost:3006/health', (res) => {\
      process.exit(res.statusCode === 200 ? 0 : 1);\
    });"

CMD ["node", "dist/main.js"]
