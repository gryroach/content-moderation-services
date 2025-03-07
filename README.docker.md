# Инструкции по запуску Docker-контейнеров

## Структура Docker-файлов

Проект разделен на несколько docker-compose файлов для удобства работы:

- `docker-compose.yml` - основные сервисы (nginx, ugc-api)
- `docker-compose.mongodb.yml` - сервисы MongoDB (шарды, конфигурационные серверы, mongos)
- `docker-compose.kafka.yml` - сервисы Kafka (брокеры, UI, инициализация)

## Сети Docker

Проект использует две основные сети Docker для коммуникации между сервисами:

- `ugc_main_network` - общая сеть для всех сервисов (MongoDB, API, Nginx)
- `ugc_kafka_network` - сеть для Kafka и сервисов, которые с ней взаимодействуют

Сети создаются автоматически при первом запуске сервисов через команду `make run-all`. Вручную создавать сети больше не требуется.

## Быстрый старт

Для просмотра всех доступных команд:

```bash
make help
```

## Управление всеми сервисами

```bash
# Запуск всех сервисов
make run-all

# Остановка всех сервисов
make down-all

# Просмотр статуса всех сервисов
make ps-all

# Просмотр логов всех сервисов
make logs-all
```

## Управление основными сервисами (nginx, ugc-api)

```bash
# Запуск основных сервисов
make run-core

# Остановка основных сервисов
make down-core
```

## Управление MongoDB

```bash
# Запуск MongoDB
make run-mongo

# Остановка MongoDB
make down-mongo

# Просмотр статуса MongoDB
make ps-mongo

# Просмотр логов MongoDB
make logs-mongo

# Инициализация шардов
make init-db

# Создание пользователя MongoDB
make create-dbuser
```

## Управление Kafka

```bash
# Запуск Kafka
make run-kafka

# Остановка Kafka
make down-kafka

# Просмотр статуса Kafka
make ps-kafka

# Просмотр логов Kafka
make logs-kafka
```

## Тестирование

```bash
# Запуск тестов
make test
```

## Отладка MongoDB

Для подключения к MongoDB и проверки статуса шардов:

```bash
# Подключение к mongos
docker exec -it mongos1 mongosh

# В консоли mongosh выполните:
sh.status()
```

## Отладка Kafka

Для проверки работы Kafka:

1. Откройте Kafka UI в браузере: http://localhost:8080
2. Проверьте статус брокеров и топиков
3. Для просмотра детальных логов Kafka:
   ```bash
   make logs-kafka
   ```

## Отладка сетевых проблем

Если у вас возникают проблемы с сетевым взаимодействием между контейнерами:

1. Проверьте, что сети созданы:

   ```bash
   docker network ls | grep ugc
   ```

2. Проверьте, к каким сетям подключен контейнер:

   ```bash
   docker inspect -f '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' <имя_контейнера>
   ```

3. Проверьте DNS-разрешение внутри контейнера:

   ```bash
   docker exec -it <имя_контейнера> ping <имя_другого_контейнера>
   ```

## Дополнительная информация

- Все сервисы настроены с использованием переменных окружения из файла `.env`
- MongoDB настроена с шардированием и репликацией для высокой доступности
- Kafka использует KRaft (без Zookeeper) и настроена с репликацией для отказоустойчивости
- Для мониторинга Kafka доступен веб-интерфейс Kafka UI (http://localhost:8080)
- Сервисы используют именованные сети Docker для стабильного сетевого взаимодействия
