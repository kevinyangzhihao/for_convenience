# ===== build stage =====
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
# 如果你用的是 pnpm/yarn，把这里换掉
RUN npm install

COPY . .
RUN npm run build

# ===== runtime stage =====
FROM nginx:alpine
# 把 build 产物放到 nginx 默认静态目录
COPY --from=build /app/dist /usr/share/nginx/html

# 让 SPA 刷新路由不 404
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]