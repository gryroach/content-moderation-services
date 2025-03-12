# Используем многоэтапную сборку
# Этап 1: Установка зависимостей и сборка
FROM node:20-alpine AS builder

# Установка дополнительных пакетов для решения возможных проблем
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json* ./

# Чистая установка зависимостей с повышенным лимитом памяти
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Этап 2: Рабочий образ
FROM node:20-alpine AS runner

WORKDIR /app

# Устанавливаем переменные среды для продакшена
ENV NODE_ENV=production \
    PORT=3000

# Копируем необходимые файлы из этапа сборки
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 
