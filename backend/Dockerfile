# Dockerfile backend.
# Собирает образ Node.js для Express API.

FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей.
COPY package*.json ./

# Если есть package-lock.json, используем npm ci.
# Если его нет, используем npm install.
# Это делает сборку устойчивой для Cloud Shell.
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Копируем исходный код.
COPY src ./src

EXPOSE 4000

CMD ["node", "src/server.js"]