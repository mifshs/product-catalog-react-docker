# Dockerfile frontend.
# Двухэтапная сборка:
# 1. Собираем React/Vite в статические файлы.
# 2. Кладём их в Nginx.

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Если есть lock-файл, используем npm ci.
# Если нет, используем npm install.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]