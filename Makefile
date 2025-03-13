include .env

# Переменные для docker-compose файлов
COMPOSE_FILES := -f docker-compose.yml -f docker-compose.mongodb.yml -f docker-compose.kafka.yml
COMPOSE_CMD := docker-compose $(COMPOSE_FILES)

# Инициализация сети
init-networks:
	./init-networks.sh

# Автоматическое добавление зависимости от init-networks
define add_network_dependency
$1: init-networks
endef

# Список всех целей Makefile, требующих инициализации сети
NETWORK_TARGETS := run-all run-core run-moderation run-moderation-api run-moderation-frontend run-moderation-frontend-prod \
                  run-moderation-fullstack run-mongo run-kafka ps-all ps-core ps-moderation ps-kafka ps-mongo \
                  init-db create-dbuser test

# Добавляем зависимость от init-networks ко всем целям из NETWORK_TARGETS
$(foreach target,$(NETWORK_TARGETS),$(eval $(call add_network_dependency,$(target))))

# Запуск всех сервисов
run-all: run-core run-moderation

# Запуск только основных сервисов
run-core:
	$(COMPOSE_CMD) up -d --build

# Запуск только модерации (все связанные сервисы)
run-moderation:
	docker compose -f docker-compose.moderation.yml up -d --build
	@echo "Сервисы модерации запущены и доступны"

# Запуск API панели модератора
run-moderation-api:
	docker compose -f docker-compose.moderation.yml up -d --build moderation-api moderator-db
	@echo "API модерации и база данных запущены"

# Запуск frontend сервиса модерации (dev режим)
run-moderation-frontend:
	./start-moderation.sh --dev
	@echo "Сервис модерации запущен в режиме разработки и доступен по адресу: http://localhost:3000"

# Запуск frontend сервиса модерации в prod режиме
run-moderation-frontend-prod:
	./start-moderation.sh --prod
	@echo "Сервис модерации запущен в production режиме и доступен по адресу: http://localhost:3000"

# Запуск полного стека модерации с nginx из основного docker-compose
run-moderation-fullstack:
	@echo "Запуск полного стека модерации с nginx..."
	# 1. Запускаем nginx из основного docker-compose
	docker compose -f docker-compose.yml up -d nginx
	# 2. Запускаем сервисы модерации из docker-compose.moderation.yml
	./start-moderation.sh --dev
	@echo "Полный стек модерации запущен."
	@echo "Frontend модерации доступен по адресу: http://localhost:8080"
	@echo "API модерации доступен по адресу: http://localhost:8011/api-moderator"

# Запуск только MongoDB
run-mongo:
	docker compose -f docker-compose.mongodb.yml up -d --build

# Запуск только Kafka
run-kafka:
	docker compose -f docker-compose.kafka.yml up -d --build

# Эти команды не требуют init-networks, поэтому оставляем их без изменений
down-moderation-frontend:
	./stop-moderation.sh
	@echo "Сервис модерации остановлен"

# Остановка всех сервисов модерации
down-moderation:
	@echo "Остановка сервисов модерации..."
	docker compose -f docker-compose.moderation.yml down
	@echo "Все сервисы модерации остановлены"

# Остановка полного стека модерации включая nginx
down-moderation-fullstack: down-moderation
	@echo "Остановка nginx из основного docker-compose..."
	docker compose -f docker-compose.yml stop nginx
	docker compose -f docker-compose.yml rm -f nginx
	@echo "Полный стек модерации остановлен"

# Остановка всех сервисов
down-all: down-core down-moderation
	./init-networks.sh clean

# Остановка только основных сервисов
down-core:
	@echo "Остановка основных сервисов..."
	docker compose down

# Остановка только MongoDB
down-mongo:
	@echo "Остановка MongoDB..."
	docker compose -f docker-compose.mongodb.yml down

# Остановка только Kafka
down-kafka:
	@echo "Остановка Kafka..."
	docker compose -f docker-compose.kafka.yml down

# Логи и статусы не требуют сетей напрямую, но могут показывать ошибки, если сети нет
logs-all:
	$(COMPOSE_CMD) logs -f

logs-moderation:
	docker compose -f docker-compose.moderation.yml logs -f

logs-kafka:
	docker compose -f docker-compose.kafka.yml logs -f

logs-mongo:
	docker compose -f docker-compose.mongodb.yml logs -f

# Просмотр статуса всех сервисов
ps-all: ps-core ps-moderation

# Просмотр статуса основных сервисов
ps-core:
	$(COMPOSE_CMD) ps

# Просмотр статуса модерации
ps-moderation:
	docker compose -f docker-compose.moderation.yml ps

# Просмотр статуса Kafka
ps-kafka:
	docker compose -f docker-compose.kafka.yml ps

# Просмотр статуса MongoDB
ps-mongo:
	docker compose -f docker-compose.mongodb.yml ps

# Инициализация шардов MongoDB
init-db:
	@echo "Initializing MongoDB configuration..."
	docker compose -f docker-compose.mongodb.yml exec mongocfg1 mongosh --eval 'load("/docker-entrypoint-initdb.d/init-config.js")'
	@echo "Initializing MongoDB shard 1..."
	docker compose -f docker-compose.mongodb.yml exec mongors1n1 mongosh --eval 'load("/docker-entrypoint-initdb.d/init-shard1.js")'
	@echo "Initializing MongoDB shard 2..."
	docker compose -f docker-compose.mongodb.yml exec mongors2n1 mongosh --eval 'load("/docker-entrypoint-initdb.d/init-shard2.js")'
	@echo "Initializing MongoDB mongos..."
	@echo "Waiting for shards to initialize..."
	@sleep 15
	docker compose -f docker-compose.mongodb.yml exec mongos1 mongosh --eval 'load("/docker-entrypoint-initdb.d/init-mongos.js")'
	@echo "Initialization complete!"

# Создание пользователя MongoDB
create-dbuser:
	@echo "Creating MongoDB user..."
	docker compose -f docker-compose.mongodb.yml exec mongos1 mongosh --eval 'db.getSiblingDB("admin").createUser({ user: "$(UGC_MONGO_USER)" , pwd: "$(UGC_MONGO_PASSWORD)", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})'

# Тесты
test:
	docker compose build ugc-api-test
	docker compose run -T --rm ugc-api-test

# Получение токена
get-token:
	python tools/generate_token.py

# Помощь
help:
	@echo "Доступные команды:"
	@echo "  run-all                  - Запуск всех сервисов"
	@echo "  run-core                 - Запуск только основных сервисов (nginx, ugc-api)"
	@echo "  run-mongo                - Запуск только MongoDB"
	@echo "  run-kafka                - Запуск только Kafka"
	@echo "  run-moderation           - Запуск всех сервисов модерации"
	@echo "  run-moderation-api       - Запуск API и БД модерации"
	@echo "  run-moderation-frontend  - Запуск сервиса модерации в режиме разработки"
	@echo "  run-moderation-frontend-prod - Запуск сервиса модерации в production режиме"
	@echo "  run-moderation-fullstack - Запуск полного стека модерации с nginx"
	@echo "  down-all                 - Остановка всех сервисов"
	@echo "  down-core                - Остановка основных сервисов"
	@echo "  down-mongo               - Остановка MongoDB"
	@echo "  down-kafka               - Остановка Kafka"
	@echo "  down-moderation          - Остановка всех сервисов модерации"
	@echo "  down-moderation-frontend - Остановка frontend сервиса модерации"
	@echo "  get-token                - Получение токена доступа к API"
	@echo "  logs-all                 - Просмотр логов всех сервисов"
	@echo "  logs-kafka               - Просмотр логов Kafka"
	@echo "  logs-mongo               - Просмотр логов MongoDB"
	@echo "  logs-moderation          - Просмотр логов модерации"
	@echo "  ps-all                   - Просмотр статуса всех сервисов"
	@echo "  ps-kafka                 - Просмотр статуса Kafka"
	@echo "  ps-mongo                 - Просмотр статуса MongoDB"
	@echo "  ps-moderation            - Просмотр статуса сервисов модерации"
	@echo "  init-db                  - Инициализация шардов MongoDB"
	@echo "  create-dbuser            - Создание пользователя MongoDB"
	@echo "  init-networks            - Создание необходимых Docker сетей"
	@echo "  test                     - Запуск тестов"

.PHONY: run-all run-core run-mongo run-kafka run-moderation run-moderation-api \
        run-moderation-frontend run-moderation-frontend-prod run-moderation-fullstack \
        down-all down-core down-mongo down-kafka down-moderation down-moderation-frontend \
        logs-all logs-kafka logs-mongo logs-moderation \
        ps-all ps-core ps-mongo ps-kafka ps-moderation \
        init-db create-dbuser test help init-networks $(NETWORK_TARGETS)
