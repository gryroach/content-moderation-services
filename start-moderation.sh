#!/bin/bash

# Функция для вывода справки
show_help() {
  echo "Запуск сервиса модерации"
  echo "Использование: $0 [опции]"
  echo ""
  echo "Опции:"
  echo "  -p, --prod     Запуск в production режиме"
  echo "  -d, --dev      Запуск в режиме разработки (по умолчанию)"
  echo "  -h, --help     Показать эту справку"
  echo ""
}

# По умолчанию используем dev-режим
MODE="dev"

# Обработка параметров
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--prod)
      MODE="prod"
      shift
      ;;
    -d|--dev)
      MODE="dev"
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Неизвестная опция: $1"
      show_help
      exit 1
      ;;
  esac
done

# Функция для остановки текущих контейнеров модерации
stop_moderation() {
  echo "Остановка предыдущих контейнеров модерации..."
  docker-compose -f docker-compose.moderation.yml stop 2>/dev/null
  docker-compose -f docker-compose.moderation.yml rm -f 2>/dev/null
}

# Создаем общую сеть, если не существует
./init-networks.sh

# Остановка текущих контейнеров
stop_moderation

# Запуск сервиса модерации
echo "Запуск сервиса модерации в режиме: $MODE..."

if [ "$MODE" == "prod" ]; then
  # Prod-режим
  export MODERATION_SERVICE=moderation-frontend
  docker-compose -f docker-compose.moderation.yml --profile prod up -d --build --force-recreate
  echo "Сервис модерации (PRODUCTION) запущен и доступен по адресу: http://localhost:3000"
else
  # Dev-режим (по умолчанию)
  export MODERATION_SERVICE=moderation-frontend-dev
  docker-compose -f docker-compose.moderation.yml --profile dev up -d --build --force-recreate
  echo "Сервис модерации (DEV) запущен и доступен по адресу: http://localhost:3000"
  echo "Режим разработки включает горячую перезагрузку."
fi 
