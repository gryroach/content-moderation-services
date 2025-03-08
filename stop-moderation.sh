#!/bin/bash

# Остановка сервиса модерации
echo "Остановка сервиса модерации..."
docker-compose -f docker-compose.moderation.yml down

# Удаление контейнеров
echo "Удаление контейнеров модерации..."
docker-compose -f docker-compose.moderation.yml rm -f

echo "Сервис модерации остановлен." 
