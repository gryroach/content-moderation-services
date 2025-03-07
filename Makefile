include .env

# Переменные для docker-compose файлов
COMPOSE_FILES := -f docker-compose.yml -f docker-compose.mongodb.yml -f docker-compose.kafka.yml
COMPOSE_CMD := docker-compose $(COMPOSE_FILES)

# Запуск всех сервисов
run-all:
	$(COMPOSE_CMD) up -d --build --remove-orphans

# Запуск только основных сервисов
run-core:
	$(COMPOSE_CMD) up -d --build

# Запуск только MongoDB
run-mongo:
	docker-compose -f docker-compose.mongodb.yml up -d --build

# Запуск только Kafka
run-kafka:
	docker-compose -f docker-compose.kafka.yml up -d --build

# Остановка всех сервисов
down-all:
	$(COMPOSE_CMD) down

# Остановка только основных сервисов
down-core:
	docker-compose down

# Остановка только MongoDB
down-mongo:
	docker-compose -f docker-compose.mongodb.yml down

# Остановка только Kafka
down-kafka:
	docker-compose -f docker-compose.kafka.yml down

# Просмотр логов всех сервисов
logs-all:
	$(COMPOSE_CMD) logs -f

# Просмотр логов Kafka
logs-kafka:
	docker-compose -f docker-compose.kafka.yml logs -f

# Просмотр логов MongoDB
logs-mongo:
	docker-compose -f docker-compose.mongodb.yml logs -f

# Просмотр статуса всех сервисов
ps-all:
	$(COMPOSE_CMD) ps

# Просмотр статуса Kafka
ps-kafka:
	docker-compose -f docker-compose.kafka.yml ps

# Просмотр статуса MongoDB
ps-mongo:
	docker-compose -f docker-compose.mongodb.yml ps

# Инициализация шардов MongoDB
init-db:
	@echo "Initializing MongoDB configuration..."
	docker-compose -f docker-compose.mongodb.yml exec mongocfg1 mongosh --eval 'load("/docker-entrypoint-initdb.d/init-config.js")'
	@echo "Initializing MongoDB shard 1..."
	docker-compose -f docker-compose.mongodb.yml exec mongors1n1 mongosh --eval 'load("/docker-entrypoint-initdb.d/init-shard1.js")'
	@echo "Initializing MongoDB shard 2..."
	docker-compose -f docker-compose.mongodb.yml exec mongors2n1 mongosh --eval 'load("/docker-entrypoint-initdb.d/init-shard2.js")'
	@echo "Initializing MongoDB mongos..."
	@echo "Waiting for shards to initialize..."
	@sleep 15
	docker-compose -f docker-compose.mongodb.yml exec mongos1 mongosh --eval 'load("/docker-entrypoint-initdb.d/init-mongos.js")'
	@echo "Initialization complete!"

# Создание пользователя MongoDB
create-dbuser:
	@echo "Creating MongoDB user..."
	docker-compose -f docker-compose.mongodb.yml exec mongos1 mongosh --eval 'db.getSiblingDB("admin").createUser({ user: "$(UGC_MONGO_USER)" , pwd: "$(UGC_MONGO_PASSWORD)", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})'

# Тесты
test:
	docker-compose build ugc-api-test
	docker-compose run -T --rm ugc-api-test

# Помощь
help:
	@echo "Доступные команды:"
	@echo "  run-all        - Запуск всех сервисов"
	@echo "  run-core       - Запуск только основных сервисов (nginx, ugc-api)"
	@echo "  run-mongo      - Запуск только MongoDB"
	@echo "  run-kafka      - Запуск только Kafka"
	@echo "  down-all       - Остановка всех сервисов"
	@echo "  down-core      - Остановка основных сервисов"
	@echo "  down-mongo     - Остановка MongoDB"
	@echo "  down-kafka     - Остановка Kafka"
	@echo "  logs-all       - Просмотр логов всех сервисов"
	@echo "  logs-kafka     - Просмотр логов Kafka"
	@echo "  logs-mongo     - Просмотр логов MongoDB"
	@echo "  ps-all         - Просмотр статуса всех сервисов"
	@echo "  ps-kafka       - Просмотр статуса Kafka"
	@echo "  ps-mongo       - Просмотр статуса MongoDB"
	@echo "  init-db        - Инициализация шардов MongoDB"
	@echo "  create-dbuser  - Создание пользователя MongoDB"
	@echo "  test          - Запуск тестов"

.PHONY: run-all run-core run-mongo run-kafka down-all down-core down-mongo down-kafka logs-all logs-kafka logs-mongo ps-all ps-kafka ps-mongo init-db create-dbuser test help
