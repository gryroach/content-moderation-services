# Сервис автоматической модерации отзывов

Сервис предназначен для автоматической модерации отзывов с использованием комбинации быстрых проверок и AI-модерации.

## Описание

Сервис выполняет следующие задачи:

- Получает отзывы из Kafka
- Проводит быструю модерацию текста (проверка на запрещенные слова, ссылки и т.д.)
- Выполняет AI-модерацию с использованием API GigaChat
- Обновляет статус отзыва в соответствии с результатами модерации

## Структура проекта

```
automated_moderation_service/
├── src/                      # Исходный код сервиса
│   ├── core/                 # Конфигурация и константы
│   ├── exceptions/           # Классы исключений
│   ├── schemas/              # Модели данных
│   ├── services/             # Бизнес-логика
│   │   ├── ai_service/       # Сервис AI-модерации
│   │   ├── moderator.py      # Основной сервис модерации
│   │   └── review_service.py # Сервис для работы с отзывами
│   └── main.py               # Точка входа в приложение
├── Dockerfile                # Конфигурация Docker-образа
├── pyproject.toml            # Зависимости и конфигурация проекта
└── README.md                 # Этот файл
```

## Требования

- Python 3.12+
- Kafka
- GigaChat API ключ (опционально)

## Установка и запуск

### Запуск с использованием Docker

1. Сборка образа:

```bash
docker build -t moderation-service .
```

2. Запуск контейнера:

```bash
docker run -d --name moderation-service \
  -e MODERATION_KAFKA_BOOTSTRAP_SERVERS=kafka:9092 \
  -e MODERATION_BANNED_WORDS='["word1", "word2"]' \
  -e GIGACHAT_AUTH_HEADER=your_api_key \
  moderation-service
```

### Локальный запуск

1. Создайте файл .env в корневой директории проекта:

```
MODERATION_KAFKA_TOPIC=ugc_reviews
MODERATION_KAFKA_BOOTSTRAP_SERVERS=localhost:9092
MODERATION_BANNED_WORDS=["word1", "word2"]
GIGACHAT_AUTH_HEADER=your_api_key
```

2. Запустите сервис:

```bash
python -m automated_moderation_service.src.main
```

## Настройка

Основные настройки можно задать через переменные окружения:

| Переменная                         | Описание                               | Пример значения    |
| ---------------------------------- | -------------------------------------- | ------------------ |
| MODERATION_KAFKA_TOPIC             | Топик Kafka для отзывов                | ugc_reviews        |
| MODERATION_KAFKA_BOOTSTRAP_SERVERS | Адреса серверов Kafka                  | kafka:9092         |
| MODERATION_BANNED_WORDS            | Список запрещенных слов в формате JSON | ["word1", "word2"] |
| MODERATION_CHECK_LINKS             | Проверять наличие ссылок               | true               |
| MODERATION_CONFIDENCE              | Минимальный порог уверенности AI       | 0.7                |
| GIGACHAT_AUTH_HEADER               | Заголовок авторизации для GigaChat     | Bearer XXXXX       |

## Развитие проекта

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
```
